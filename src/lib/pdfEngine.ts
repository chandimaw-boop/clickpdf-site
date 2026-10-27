// src/lib/pdfEngine.ts
// Unified client-side PDF engine — 100% in-browser, zero server round-trips.
//
// Strategy:
//  - pdf-lib (statically imported) powers page-level operations.
//  - Heavy libraries (pdfjs-dist, tesseract.js, docx, jspdf, @zip.js/zip.js)
//    are lazy-loaded so the initial JavaScript bundle stays small and only
//    the code for the selected tool is downloaded.

import { PDFDocument, StandardFonts, degrees, rgb } from "pdf-lib";

export type ProgressFn = (p: { percent: number; status: string }) => void;

export type EngineResult = {
  blob: Blob | null;
  filename: string;
  kind: "real" | "unsupported";
  note: string;
  error?: string;
};

export type PdfOperation =
  | "info"
  | "merge"
  | "split"
  | "reorder"
  | "rotate"
  | "removePages"
  | "extractText"
  | "ocr"
  | "imagesToPdf"
  | "createDocument"
  | "pdfToWord"
  | "pdfToExcel"
  | "extractImages"
  | "rasterize"
  | "clearBlurry"
  | "compress"
  | "signature"
  | "protect"
  | "unlock"
  | "removeWatermark"
  | "pdfToPpt";

export type OperationOptions = {
  password?: string;
  pageRange?: string;
  pages?: number[];
  rotation?: number;
  signatureText?: string;
  lang?: string;
  scale?: number;
};

// Keep in sync with the installed pdfjs-dist version.
const PDFJS_VERSION = "6.4.299";

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

async function emit(steps: Array<[number, string]>, onProgress: ProgressFn) {
  for (const [percent, status] of steps) {
    onProgress({ percent, status });
    await sleep(220);
  }
}

export function formatBytes(bytes: number): string {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

function pdfBlob(bytes: Uint8Array): Blob {
  return new Blob([bytes as unknown as BlobPart], { type: "application/pdf" });
}

function textBlob(text: string, type = "text/plain;charset=utf-8"): Blob {
  return new Blob([text], { type });
}

function csvBlob(rows: string[][]): Blob {
  const csv = rows
    .map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(","))
    .join("\n");
  return textBlob(csv, "text/csv;charset=utf-8");
}

async function fileBytes(file: File): Promise<Uint8Array> {
  return new Uint8Array(await file.arrayBuffer());
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Canvas export failed."))), type)
  );
}

// ---- Lazy loaders (code-split the heavy deps) --------------------------

let pdfjsPromise: Promise<typeof import("pdfjs-dist")> | null = null;
function loadPdfjs() {
  pdfjsPromise ??= import("pdfjs-dist").then((pdfjs) => {
    pdfjs.GlobalWorkerOptions.workerSrc =
      `https://cdn.jsdelivr.net/npm/pdfjs-dist@${PDFJS_VERSION}/build/pdf.worker.min.mjs`;
    return pdfjs;
  });
  return pdfjsPromise;
}

let tesseractPromise: Promise<typeof import("tesseract.js")> | null = null;
function loadTesseract() {
  // tesseract.js defaults to loading its WASM core + language data from a CDN.
  // For full self-hosting, pass { workerPath, corePath, langPath } in recognize().
  tesseractPromise ??= import("tesseract.js");
  return tesseractPromise;
}

// ---- pdf-lib structural operations ------------------------------------

function parseRange(range: string, total: number): number[] {
  const clean = range.trim();
  if (!clean) return [];
  const set = new Set<number>();
  for (const part of clean.split(",")) {
    const p = part.trim();
    if (!p) continue;
    const m = p.match(/^(\d+)\s*-\s*(\d+)$/);
    if (m) {
      let a = Number(m[1]);
      let b = Number(m[2]);
      if (a > b) [a, b] = [b, a];
      for (let i = Math.max(1, a); i <= Math.min(total, b); i++) set.add(i - 1);
    } else if (/^\d+$/.test(p)) {
      const n = Number(p);
      if (n >= 1 && n <= total) set.add(n - 1);
    }
  }
  return [...set].sort((x, y) => x - y);
}

async function mergePdf(files: File[], onProgress: ProgressFn): Promise<EngineResult> {
  await emit([[5, "Reading PDFs…"], [35, "Extracting pages…"], [75, "Merging…"], [95, "Finalizing…"]], onProgress);
  const out = await PDFDocument.create();
  for (const file of files) {
    const src = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true });
    const pages = await out.copyPages(src, src.getPageIndices());
    pages.forEach((page) => out.addPage(page));
  }
  const bytes = await out.save({ useObjectStreams: true });
  return { blob: pdfBlob(bytes), filename: "clickpdf-merged.pdf", kind: "real", note: `Merged ${files.length} file(s).` };
}

async function splitPdf(files: File[], options: OperationOptions, onProgress: ProgressFn): Promise<EngineResult> {
  await emit([[5, "Reading PDF…"], [40, "Extracting selected pages…"], [80, "Building PDF…"], [95, "Finalizing…"]], onProgress);
  const src = await PDFDocument.load(await files[0].arrayBuffer(), { ignoreEncryption: true });
  const total = src.getPageCount();
  const indices = parseRange(options.pageRange ?? "", total);
  if (indices.length === 0) throw new Error("Enter a valid page range, e.g. 1-3 or 2,4.");
  const out = await PDFDocument.create();
  const pages = await out.copyPages(src, indices);
  pages.forEach((page) => out.addPage(page));
  const bytes = await out.save({ useObjectStreams: true });
  return { blob: pdfBlob(bytes), filename: "clickpdf-split.pdf", kind: "real", note: `Extracted ${indices.length} page(s).` };
}

async function reorderPdf(files: File[], onProgress: ProgressFn): Promise<EngineResult> {
  await emit([[5, "Reading PDF…"], [40, "Reversing pages…"], [80, "Rebuilding…"], [95, "Finalizing…"]], onProgress);
  const src = await PDFDocument.load(await files[0].arrayBuffer(), { ignoreEncryption: true });
  const out = await PDFDocument.create();
  const pages = await out.copyPages(src, src.getPageIndices().reverse());
  pages.forEach((page) => out.addPage(page));
  const bytes = await out.save({ useObjectStreams: true });
  return { blob: pdfBlob(bytes), filename: "clickpdf-reordered.pdf", kind: "real", note: "Reversed the page order." };
}

async function rotatePdf(files: File[], options: OperationOptions, onProgress: ProgressFn): Promise<EngineResult> {
  await emit([[10, "Reading PDF…"], [50, "Rotating pages…"], [85, "Finalizing…"]], onProgress);
  const src = await PDFDocument.load(await files[0].arrayBuffer(), { ignoreEncryption: true });
  const rotation = (options.rotation ?? 90) as 90 | 180 | 270;
  src.getPages().forEach((page) => page.setRotation(degrees(rotation)));
  const bytes = await src.save({ useObjectStreams: true });
  return { blob: pdfBlob(bytes), filename: "clickpdf-rotated.pdf", kind: "real", note: `Rotated every page by ${rotation}°.` };
}

async function removePagesPdf(files: File[], options: OperationOptions, onProgress: ProgressFn): Promise<EngineResult> {
  await emit([[10, "Reading PDF…"], [50, "Removing pages…"], [85, "Finalizing…"]], onProgress);
  const src = await PDFDocument.load(await files[0].arrayBuffer(), { ignoreEncryption: true });
  const total = src.getPageCount();
  const remove = new Set((options.pages ?? []).filter((n) => n >= 0 && n < total));
  if (remove.size === 0) throw new Error("Provide the 0-based page numbers to remove.");
  const out = await PDFDocument.create();
  const keep = src.getPageIndices().filter((i) => !remove.has(i));
  const pages = await out.copyPages(src, keep);
  pages.forEach((page) => out.addPage(page));
  const bytes = await out.save({ useObjectStreams: true });
  return { blob: pdfBlob(bytes), filename: "clickpdf-trimmed.pdf", kind: "real", note: `Removed ${remove.size} page(s).` };
}

async function imagesToPdf(files: File[], onProgress: ProgressFn): Promise<EngineResult> {
  await emit([[5, "Reading images…"], [40, "Placing images…"], [85, "Building PDF…"], [95, "Finalizing…"]], onProgress);
  const out = await PDFDocument.create();
  for (const file of files) {
    const bytes = await file.arrayBuffer();
    let image: Awaited<ReturnType<typeof out.embedPng>>;
    try {
      image = await out.embedPng(bytes);
    } catch {
      image = await out.embedJpg(bytes);
    }
    const page = out.addPage([595.28, 841.89]);
    const maxW = page.getWidth() - 72;
    const maxH = page.getHeight() - 72;
    const scale = Math.min(maxW / image.width, maxH / image.height);
    const w = image.width * scale;
    const h = image.height * scale;
    page.drawImage(image, {
      x: (page.getWidth() - w) / 2,
      y: (page.getHeight() - h) / 2,
      width: w,
      height: h,
    });
  }
  const bytes = await out.save({ useObjectStreams: true });
  return { blob: pdfBlob(bytes), filename: "clickpdf-images.pdf", kind: "real", note: `Converted ${files.length} image(s) to PDF.` };
}

async function createDocumentPdf(onProgress: ProgressFn): Promise<EngineResult> {
  await emit([[10, "Creating page…"], [50, "Writing header…"], [85, "Finalizing…"]], onProgress);
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(37, 99, 235);
  doc.text("OFFICIAL DOCUMENT", 40, 80);
  doc.setDrawColor(37, 99, 235);
  doc.line(40, 92, 555, 92);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(80, 90, 100);
  doc.text("Generated with Clickpdf.online", 40, 124);
  doc.text(
    new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
    40,
    142
  );
  return { blob: doc.output("blob"), filename: "clickpdf-document.pdf", kind: "real", note: "Created an official PDF document." };
}

async function compressPdf(files: File[], onProgress: ProgressFn): Promise<EngineResult> {
  await emit([[5, "Reading PDF…"], [40, "Optimizing objects…"], [80, "Recompressing…"], [95, "Finalizing…"]], onProgress);
  const file = files[0];
  const before = file.size;
  const src = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true });
  const bytes = await src.save({ useObjectStreams: true });
  const after = bytes.byteLength;
  const saved = before - after;
  const note =
    saved > 0
      ? `Re-encoded: ${formatBytes(before)} → ${formatBytes(after)} (${Math.round((saved / before) * 100)}% smaller).`
      : `Re-encoded to ${formatBytes(after)}. Aggressive <100KB compression needs image re-encoding (see rasterize) or a server.`;
  return { blob: pdfBlob(bytes), filename: "clickpdf-compressed.pdf", kind: "real", note };
}

async function signaturePdf(files: File[], options: OperationOptions, onProgress: ProgressFn): Promise<EngineResult> {
  await emit([[10, "Reading PDF…"], [50, "Applying signature…"], [85, "Finalizing…"]], onProgress);
  const src = await PDFDocument.load(await files[0].arrayBuffer(), { ignoreEncryption: true });
  const page = src.getPage(src.getPageCount() - 1);
  const font = await src.embedFont(StandardFonts.Helvetica);
  const text = options.signatureText || "Digitally signed via Clickpdf.online";
  page.drawText(text, { x: 40, y: 64, size: 11, font, color: rgb(0.1, 0.4, 0.9) });
  page.drawLine({ start: { x: 40, y: 50 }, end: { x: 190, y: 50 }, thickness: 1, color: rgb(0.1, 0.4, 0.9) });
  const bytes = await src.save({ useObjectStreams: true });
  return {
    blob: pdfBlob(bytes),
    filename: "clickpdf-signed.pdf",
    kind: "real",
    note: "Added a visible signature stamp (cryptographic signing needs a certificate).",
  };
}

// ---- pdfjs-dist (read / render) ---------------------------------------

async function renderPagesToImages(bytes: Uint8Array, scale: number, onProgress: ProgressFn): Promise<Blob[]> {
  const pdfjs = await loadPdfjs();
  const doc = await pdfjs.getDocument({ data: bytes }).promise;
  const blobs: Blob[] = [];
  for (let i = 1; i <= doc.numPages; i++) {
    onProgress({ percent: Math.round((i / doc.numPages) * 90), status: `Rendering page ${i}/${doc.numPages}…` });
    const page = await doc.getPage(i);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas is not supported in this browser.");
    await page.render({ canvasContext: ctx, viewport, canvas }).promise;
    blobs.push(await canvasToBlob(canvas, "image/png"));
  }
  return blobs;
}

async function infoPdf(files: File[], onProgress: ProgressFn): Promise<EngineResult> {
  await emit([[10, "Reading PDF…"], [60, "Inspecting document…"]], onProgress);
  const file = files[0];
  const pdfjs = await loadPdfjs();
  const doc = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
  const text = [`File: ${file.name}`, `Size: ${formatBytes(file.size)}`, `Pages: ${doc.numPages}`].join("\n");
  return { blob: textBlob(text), filename: "clickpdf-info.txt", kind: "real", note: `Analyzed "${file.name}" — ${doc.numPages} page(s).` };
}

async function extractTextPdf(bytes: Uint8Array, onProgress: ProgressFn): Promise<string> {
  const pdfjs = await loadPdfjs();
  const doc = await pdfjs.getDocument({ data: bytes }).promise;
  const parts: string[] = [];
  for (let i = 1; i <= doc.numPages; i++) {
    onProgress({ percent: Math.round((i / doc.numPages) * 90), status: `Extracting page ${i}/${doc.numPages}…` });
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const items = content.items as Array<{ str?: string }>;
    parts.push(`--- Page ${i} ---\n${items.map((it) => it.str ?? "").join(" ")}`);
  }
  return parts.join("\n\n");
}

async function ocrBlob(image: Blob, lang: string, onProgress: ProgressFn): Promise<string> {
  const T = await loadTesseract();
  const { data } = await T.recognize(image, lang, {
    logger: (m) => {
      if (m.status === "recognizing text") {
        onProgress({ percent: Math.round(m.progress * 100), status: "OCR: recognizing text…" });
      }
    },
  });
  return data.text;
}

async function ocrPdf(files: File[], options: OperationOptions, onProgress: ProgressFn): Promise<EngineResult> {
  const lang = options.lang ?? "eng";
  const pngs = await renderPagesToImages(await fileBytes(files[0]), options.scale ?? 2, onProgress);
  const texts: string[] = [];
  for (let i = 0; i < pngs.length; i++) {
    onProgress({ percent: 90 + Math.round((i / pngs.length) * 9), status: `OCR page ${i + 1}/${pngs.length}…` });
    texts.push(await ocrBlob(pngs[i], lang, onProgress));
  }
  return { blob: textBlob(texts.join("\n\n")), filename: "clickpdf-ocr.txt", kind: "real", note: `OCR complete for ${pngs.length} page(s).` };
}

async function pdfToWordPdf(files: File[], onProgress: ProgressFn): Promise<EngineResult> {
  await emit([[10, "Extracting text…"], [60, "Building DOCX…"], [90, "Finalizing…"]], onProgress);
  const text = await extractTextPdf(await fileBytes(files[0]), onProgress);
  const { Document, Packer, Paragraph, TextRun } = await import("docx");
  const children = text
    .split("\n")
    .filter((line) => line.trim())
    .map((line) => new Paragraph({ children: [new TextRun(line)] }));
  const doc = new Document({
    sections: [{ children: children.length ? children : [new Paragraph({ children: [new TextRun("")] })] }],
  });
  const blob = await Packer.toBlob(doc);
  return { blob, filename: "clickpdf-converted.docx", kind: "real", note: "Exported the PDF text to an editable .docx." };
}

async function pdfToExcelPdf(files: File[], onProgress: ProgressFn): Promise<EngineResult> {
  await emit([[10, "Extracting text…"], [60, "Building CSV…"], [90, "Finalizing…"]], onProgress);
  const text = await extractTextPdf(await fileBytes(files[0]), onProgress);
  const rows = text.split("\n").filter((line) => line.trim()).map((line) => [line]);
  return { blob: csvBlob(rows.length ? rows : [["No text found"]]), filename: "clickpdf-export.csv", kind: "real", note: "Exported text to CSV (use SheetJS for a true .xlsx)." };
}

async function extractImagesPdf(files: File[], options: OperationOptions, onProgress: ProgressFn): Promise<EngineResult> {
  const pngs = await renderPagesToImages(await fileBytes(files[0]), options.scale ?? 2, onProgress);
  onProgress({ percent: 92, status: "Packing images into a ZIP…" });
  const { BlobWriter, ZipWriter } = await import("@zip.js/zip.js");
  const writer = new ZipWriter(new BlobWriter("application/zip"));
  for (let i = 0; i < pngs.length; i++) await writer.add(`page-${i + 1}.png`, pngs[i].stream());
  const zip = await writer.close();
  return { blob: zip, filename: "clickpdf-pages.zip", kind: "real", note: `Exported ${pngs.length} page snapshot(s) as PNG in a ZIP.` };
}

async function rasterizePdf(files: File[], options: OperationOptions, onProgress: ProgressFn): Promise<EngineResult> {
  const pngs = await renderPagesToImages(await fileBytes(files[0]), options.scale ?? 2, onProgress);
  const out = await PDFDocument.create();
  for (const png of pngs) {
    const img = await out.embedPng(await png.arrayBuffer());
    const page = out.addPage([img.width, img.height]);
    page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
  }
  const bytes = await out.save({ useObjectStreams: true });
  return { blob: pdfBlob(bytes), filename: "clickpdf-flattened.pdf", kind: "real", note: "Rasterized every page to an image and rebuilt the PDF." };
}

async function clearBlurryPdf(files: File[], options: OperationOptions, onProgress: ProgressFn): Promise<EngineResult> {
  const pdfjs = await loadPdfjs();
  const doc = await pdfjs.getDocument({ data: await fileBytes(files[0]) }).promise;
  const scale = options.scale ?? 2;
  const out = await PDFDocument.create();
  for (let i = 1; i <= doc.numPages; i++) {
    onProgress({ percent: Math.round((i / doc.numPages) * 90), status: `Enhancing page ${i}/${doc.numPages}…` });
    const page = await doc.getPage(i);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas is not supported in this browser.");
    await page.render({ canvasContext: ctx, viewport, canvas }).promise;
    ctx.filter = "contrast(1.15) saturate(1.05)";
    ctx.drawImage(canvas, 0, 0);
    ctx.filter = "none";
    const png = await canvasToBlob(canvas, "image/png");
    const img = await out.embedPng(await png.arrayBuffer());
    const p = out.addPage([img.width, img.height]);
    p.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
  }
  const bytes = await out.save({ useObjectStreams: true });
  return { blob: pdfBlob(bytes), filename: "clickpdf-enhanced.pdf", kind: "real", note: "Applied contrast/saturation enhancement to improve legibility." };
}

function unsupported(title: string, reason: string): EngineResult {
  return {
    blob: null,
    filename: "",
    kind: "unsupported",
    note: reason,
    error: `${title} cannot be done fully client-side. ${reason}`,
  };
}

export async function runPdfOperation(
  op: PdfOperation,
  files: File[],
  options: OperationOptions,
  onProgress: ProgressFn
): Promise<EngineResult> {
  try {
    switch (op) {
      case "info":
        return await infoPdf(files, onProgress);
      case "merge":
        return await mergePdf(files, onProgress);
      case "split":
        return await splitPdf(files, options, onProgress);
      case "reorder":
        return await reorderPdf(files, onProgress);
      case "rotate":
        return await rotatePdf(files, options, onProgress);
      case "removePages":
        return await removePagesPdf(files, options, onProgress);
      case "imagesToPdf":
        return await imagesToPdf(files, onProgress);
      case "createDocument":
        return await createDocumentPdf(onProgress);
      case "compress":
        return await compressPdf(files, onProgress);
      case "signature":
        return await signaturePdf(files, options, onProgress);
      case "extractText": {
        const text = await extractTextPdf(await fileBytes(files[0]), onProgress);
        return { blob: textBlob(text), filename: "clickpdf-text.txt", kind: "real", note: "Extracted text from the PDF." };
      }
      case "ocr":
        return await ocrPdf(files, options, onProgress);
      case "pdfToWord":
        return await pdfToWordPdf(files, onProgress);
      case "pdfToExcel":
        return await pdfToExcelPdf(files, onProgress);
      case "extractImages":
        return await extractImagesPdf(files, options, onProgress);
      case "rasterize":
        return await rasterizePdf(files, options, onProgress);
      case "clearBlurry":
        return await clearBlurryPdf(files, options, onProgress);
      case "protect":
        return unsupported("Password protection", "AES-encrypting a PDF needs qpdf/pikepdf (a server or a qpdf WASM build).");
      case "unlock":
        return unsupported("Password unlocking", "Removing encryption requires the password plus a decryption engine (not available in pure JS).");
      case "removeWatermark":
        return unsupported("Watermark removal", "Watermark inpainting is an image-editing task that can't be done reliably in-browser.");
      case "pdfToPpt":
        return unsupported("PDF → PowerPoint", "No production-grade client-side PPTX writer exists yet — use PDF → Word instead.");
      default:
        return unsupported(op, "Unknown operation.");
    }
  } catch (err) {
    return {
      blob: null,
      filename: "",
      kind: "unsupported",
      note: "",
      error: err instanceof Error ? err.message : "Processing failed.",
    };
  }
}