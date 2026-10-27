"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ChangeEvent, DragEvent, PointerEvent as ReactPointerEvent } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  CheckCircle2,
  Download,
  Droplet,
  FileDown,
  FileLock2,
  Files,
  FileText,
  ImagePlus,
  Images,
  Lock,
  PenLine,
  ScanText,
  Scissors,
  Shuffle,
  Sparkles,
  Table,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { PDFDocument, StandardFonts, degrees, rgb } from "pdf-lib";

export type ToolId =
  | "unlock"
  | "pdf-to-word"
  | "compress"
  | "merge"
  | "extract"
  | "clear-blurry"
  | "split"
  | "pdf-to-excel"
  | "protect"
  | "extract-images"
  | "image-to-pdf"
  | "watermark"
  | "reorder"
  | "signature";

type Tool = {
  id: ToolId;
  label: string;
  tagline: string;
  icon: LucideIcon;
  accept: string;
  acceptLabel: string;
  multiple: boolean;
  hint: string;
};

const TOOLS: Tool[] = [
  { id: "unlock", label: "Unlock PDF", tagline: "Remove password protection", icon: FileLock2, accept: ".pdf", acceptLabel: "PDF", multiple: false, hint: "Drop a locked PDF to remove its password" },
  { id: "pdf-to-word", label: "PDF to Word", tagline: "Extract text to editable .docx", icon: FileText, accept: ".pdf", acceptLabel: "PDF", multiple: false, hint: "Drop a PDF to convert it to Word" },
  { id: "compress", label: "Compress PDF", tagline: "Optimize streams & shrink size", icon: FileDown, accept: ".pdf", acceptLabel: "PDF", multiple: false, hint: "Drop a PDF to reduce its file size" },
  { id: "merge", label: "Merge PDFs", tagline: "Combine multiple files", icon: Files, accept: ".pdf", acceptLabel: "PDF", multiple: true, hint: "Drop multiple PDFs to merge into one" },
  { id: "extract", label: "Extract Text / OCR", tagline: "Text stream or Tesseract OCR", icon: ScanText, accept: ".pdf,image/*", acceptLabel: "PDF or image", multiple: false, hint: "Drop a PDF or image to extract its text" },
  { id: "clear-blurry", label: "Clear Blurry Scans", tagline: "Canvas contrast & sharpening", icon: Sparkles, accept: ".pdf,image/*", acceptLabel: "PDF or image", multiple: false, hint: "Drop a blurry scan to enhance legibility" },
  { id: "split", label: "Split PDF Pages", tagline: "Extract a page range", icon: Scissors, accept: ".pdf", acceptLabel: "PDF", multiple: false, hint: "Drop a PDF and enter a page range" },
  { id: "pdf-to-excel", label: "PDF to Excel", tagline: "Tabular text to .csv", icon: Table, accept: ".pdf", acceptLabel: "PDF", multiple: false, hint: "Drop a PDF to export tabular text" },
  { id: "protect", label: "Protect PDF", tagline: "Add a user password", icon: Lock, accept: ".pdf", acceptLabel: "PDF", multiple: false, hint: "Drop a PDF to password-protect it" },
  { id: "extract-images", label: "Extract Images", tagline: "Download embedded JPG/PNG", icon: Images, accept: ".pdf", acceptLabel: "PDF", multiple: false, hint: "Drop a PDF to extract its images" },
  { id: "image-to-pdf", label: "Image to PDF", tagline: "JPG/PNG to PDF pages", icon: ImagePlus, accept: "image/*", acceptLabel: "image", multiple: true, hint: "Drop JPG/PNG images to build a PDF" },
  { id: "watermark", label: "Watermark", tagline: "Add or remove a watermark", icon: Droplet, accept: ".pdf", acceptLabel: "PDF", multiple: false, hint: "Drop a PDF to add/remove a watermark" },
  { id: "reorder", label: "Reorder Pages", tagline: "Reverse page order", icon: Shuffle, accept: ".pdf", acceptLabel: "PDF", multiple: false, hint: "Drop a PDF to reverse its pages" },
  { id: "signature", label: "Add Signature", tagline: "Draw & merge a signature", icon: PenLine, accept: ".pdf", acceptLabel: "PDF", multiple: false, hint: "Drop a PDF, then draw your signature" },
];

type ProgressFn = (p: { percent: number; status: string }) => void;

type Outcome = { blob: Blob; filename: string; mime: string; note: string };

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

async function emit(steps: Array<[number, string]>, onProgress: ProgressFn) {
  for (const [percent, status] of steps) {
    onProgress({ percent, status });
    await sleep(220);
  }
}

function formatBytes(bytes: number): string {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

function pdfBlob(bytes: Uint8Array): Blob {
  return new Blob([bytes as unknown as BlobPart], { type: "application/pdf" });
}

function textBlob(text: string): Blob {
  return new Blob([text], { type: "text/plain;charset=utf-8" });
}

function canvasToBlob(canvas: HTMLCanvasElement, type = "image/png"): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Canvas export failed."))), type)
  );
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not read that image."));
    img.src = url;
  });
}

let pdfjsPromise: Promise<typeof import("pdfjs-dist")> | null = null;
function loadPdfjs() {
  pdfjsPromise ??= import("pdfjs-dist").then((pdfjs) => {
    pdfjs.GlobalWorkerOptions.workerSrc =
      "https://cdn.jsdelivr.net/npm/pdfjs-dist@6.4.299/build/pdf.worker.min.mjs";
    return pdfjs;
  });
  return pdfjsPromise;
}

let tesseractPromise: Promise<typeof import("tesseract.js")> | null = null;
function loadTesseract() {
  tesseractPromise ??= import("tesseract.js");
  return tesseractPromise;
}

function AdSlot({ id, size }: { id: string; size: "728x90" | "320x50" }) {
  const desktop = size === "728x90";
  return (
    <div
      id={id}
      data-adsterra={size}
      className={`${desktop ? "hidden md:flex" : "flex md:hidden"} items-center justify-center ${
        desktop ? "min-h-[90px]" : "min-h-[50px]"
      } w-full rounded-lg border border-dashed border-slate-800 bg-slate-900/40 text-slate-600`}
    >
      <span className="text-[10px] font-semibold uppercase tracking-[0.2em]">
        Adsterra {size}
      </span>
    </div>
  );
}

async function extractTextFromPdf(file: File, onProgress: ProgressFn): Promise<string> {
  const pdfjs = await loadPdfjs();
  const doc = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
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

async function renderPagesToPngs(bytes: Uint8Array, scale: number, onProgress: ProgressFn): Promise<Blob[]> {
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

async function ocrImage(image: Blob, onProgress: ProgressFn): Promise<string> {
  const T = await loadTesseract();
  const { data } = await T.recognize(image, "eng", {
    logger: (m) => {
      if (m.status === "recognizing text") {
        onProgress({ percent: Math.round(m.progress * 100), status: "OCR: recognizing text…" });
      }
    },
  });
  return data.text;
}

async function processUnlock(files: File[], onProgress: ProgressFn): Promise<Outcome> {
  await emit([[10, "Reading PDF…"], [60, "Checking encryption…"]], onProgress);
  try {
    const src = await PDFDocument.load(await files[0].arrayBuffer());
    const bytes = await src.save({ useObjectStreams: true });
    return { blob: pdfBlob(bytes), filename: "clickpdf-unlocked.pdf", mime: "application/pdf", note: "This PDF was not encrypted — saved a clean, unlocked copy." };
  } catch {
    throw new Error("This PDF is password-protected. pdf-lib cannot decrypt AES encryption in-browser — unlock needs a server (qpdf/pikepdf) or a qpdf WASM build.");
  }
}

async function processPdfToWord(files: File[], onProgress: ProgressFn): Promise<Outcome> {
  await emit([[10, "Extracting text…"], [60, "Building .docx…"], [90, "Finalizing…"]], onProgress);
  const text = await extractTextFromPdf(files[0], onProgress);
  const { Document, Packer, Paragraph, TextRun } = await import("docx");
  const children = text
    .split("\n")
    .filter((line) => line.trim())
    .map((line) => new Paragraph({ children: [new TextRun(line)] }));
  const doc = new Document({
    sections: [{ children: children.length ? children : [new Paragraph({ children: [new TextRun("")] })] }],
  });
  const blob = await Packer.toBlob(doc);
  return {
    blob,
    filename: "clickpdf-converted.docx",
    mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    note: "Converted the PDF text into an editable .docx.",
  };
}

async function processCompress(files: File[], onProgress: ProgressFn): Promise<Outcome> {
  await emit([[5, "Reading PDF…"], [40, "Optimizing objects…"], [80, "Recompressing…"], [95, "Finalizing…"]], onProgress);
  const file = files[0];
  const before = file.size;
  const src = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true });
  const bytes = await src.save({ useObjectStreams: true });
  const after = bytes.byteLength;
  const saved = before - after;
  const note = saved > 0
    ? `Re-encoded: ${formatBytes(before)} → ${formatBytes(after)} (${Math.round((saved / before) * 100)}% smaller).`
    : `Re-encoded to ${formatBytes(after)}. Aggressive <100KB compression needs image re-encoding or a server.`;
  return { blob: pdfBlob(bytes), filename: "clickpdf-compressed.pdf", mime: "application/pdf", note };
}

async function processMerge(files: File[], onProgress: ProgressFn): Promise<Outcome> {
  await emit([[5, "Reading PDFs…"], [35, "Extracting pages…"], [75, "Merging…"], [95, "Finalizing…"]], onProgress);
  const out = await PDFDocument.create();
  for (const file of files) {
    const src = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true });
    const pages = await out.copyPages(src, src.getPageIndices());
    pages.forEach((page) => out.addPage(page));
  }
  const bytes = await out.save({ useObjectStreams: true });
  return { blob: pdfBlob(bytes), filename: "clickpdf-merged.pdf", mime: "application/pdf", note: `Merged ${files.length} file(s).` };
}

async function processExtract(files: File[], mode: "text" | "ocr", onProgress: ProgressFn): Promise<Outcome> {
  const file = files[0];
  const isPdf = file.type.includes("pdf");
  if (mode === "ocr" || !isPdf) {
    let text: string;
    if (isPdf) {
      const pngs = await renderPagesToPngs(new Uint8Array(await file.arrayBuffer()), 2, onProgress);
      const parts: string[] = [];
      for (let i = 0; i < pngs.length; i++) {
        onProgress({ percent: 90 + Math.round((i / pngs.length) * 9), status: `OCR page ${i + 1}/${pngs.length}…` });
        parts.push(await ocrImage(pngs[i], onProgress));
      }
      text = parts.join("\n\n");
    } else {
      text = await ocrImage(file, onProgress);
    }
    return { blob: textBlob(text), filename: "clickpdf-ocr.txt", mime: "text/plain", note: "OCR complete." };
  }
  const text = await extractTextFromPdf(file, onProgress);
  return { blob: textBlob(text), filename: "clickpdf-text.txt", mime: "text/plain", note: "Extracted the PDF text layer." };
}

async function processClearBlurry(files: File[], onProgress: ProgressFn): Promise<Outcome> {
  const file = files[0];
  const out = await PDFDocument.create();
  const isPdf = file.type.includes("pdf");
  if (isPdf) {
    const pdfjs = await loadPdfjs();
    const doc = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
    for (let i = 1; i <= doc.numPages; i++) {
      onProgress({ percent: Math.round((i / doc.numPages) * 90), status: `Enhancing page ${i}/${doc.numPages}…` });
      const page = await doc.getPage(i);
      const viewport = page.getViewport({ scale: 2 });
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
  } else {
    const imgEl = await loadImage(file);
    const canvas = document.createElement("canvas");
    canvas.width = imgEl.naturalWidth;
    canvas.height = imgEl.naturalHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas is not supported in this browser.");
    ctx.drawImage(imgEl, 0, 0);
    ctx.filter = "contrast(1.15) saturate(1.05)";
    ctx.drawImage(canvas, 0, 0);
    ctx.filter = "none";
    const png = await canvasToBlob(canvas, "image/png");
    const img = await out.embedPng(await png.arrayBuffer());
    const p = out.addPage([img.width, img.height]);
    p.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
  }
  const bytes = await out.save({ useObjectStreams: true });
  return { blob: pdfBlob(bytes), filename: "clickpdf-enhanced.pdf", mime: "application/pdf", note: "Applied contrast/saturation enhancement." };
}

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

async function processSplit(files: File[], pageRange: string, onProgress: ProgressFn): Promise<Outcome> {
  await emit([[5, "Reading PDF…"], [40, "Extracting pages…"], [80, "Building…"], [95, "Finalizing…"]], onProgress);
  const src = await PDFDocument.load(await files[0].arrayBuffer(), { ignoreEncryption: true });
  const total = src.getPageCount();
  const indices = parseRange(pageRange, total);
  if (indices.length === 0) throw new Error("Enter a valid page range, e.g. 1-3 or 2,4.");
  const out = await PDFDocument.create();
  const pages = await out.copyPages(src, indices);
  pages.forEach((page) => out.addPage(page));
  const bytes = await out.save({ useObjectStreams: true });
  return { blob: pdfBlob(bytes), filename: "clickpdf-split.pdf", mime: "application/pdf", note: `Extracted ${indices.length} page(s).` };
}

async function processPdfToExcel(files: File[], onProgress: ProgressFn): Promise<Outcome> {
  await emit([[10, "Extracting text…"], [60, "Building .csv…"], [90, "Finalizing…"]], onProgress);
  const text = await extractTextFromPdf(files[0], onProgress);
  const rows = text.split("\n").filter((line) => line.trim()).map((line) => [line]);
  const csv = rows.length
    ? rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n")
    : "No text found";
  return { blob: new Blob([csv], { type: "text/csv;charset=utf-8" }), filename: "clickpdf-export.csv", mime: "text/csv", note: "Exported tabular text as .csv." };
}

async function processProtect(_files: File[], _password: string, onProgress: ProgressFn): Promise<Outcome> {
  await emit([[20, "Checking encryption support…"]], onProgress);
  throw new Error("pdf-lib's public API cannot AES-encrypt a PDF. Use a server (qpdf/pikepdf) or a qpdf WASM build to add a password.");
}

async function processExtractImages(files: File[], onProgress: ProgressFn): Promise<Outcome> {
  const file = files[0];
  const pdfjs = await loadPdfjs();
  const doc = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
  const pngs: Blob[] = [];
  const seen = new Set<string>();
  for (let i = 1; i <= doc.numPages; i++) {
    onProgress({ percent: Math.round((i / doc.numPages) * 80), status: `Scanning page ${i}/${doc.numPages} for images…` });
    const page = await doc.getPage(i);
    const opList = await page.getOperatorList();
    for (let j = 0; j < opList.fnArray.length; j++) {
      if (opList.fnArray[j] !== pdfjs.OPS.paintImageXObject) continue;
      const key = String(opList.argsArray[j][0]);
      if (seen.has(key)) continue;
      seen.add(key);
      try {
        const img = await page.objs.get(key);
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) continue;
        if (img instanceof ImageBitmap) {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
        } else if (img && typeof img === "object" && "width" in img && "height" in img) {
          canvas.width = Number(img.width);
          canvas.height = Number(img.height);
          const data = (img as { data?: Uint8ClampedArray }).data;
          if (data) ctx.putImageData(new ImageData(new Uint8ClampedArray(data), canvas.width, canvas.height), 0, 0);
          else continue;
        } else {
          continue;
        }
        pngs.push(await canvasToBlob(canvas, "image/png"));
      } catch {
        // Skip unreadable image objects.
      }
    }
  }
  if (pngs.length === 0) throw new Error("No embedded images found in this PDF.");
  if (pngs.length === 1) {
    return { blob: pngs[0], filename: "clickpdf-image.png", mime: "image/png", note: "Extracted 1 embedded image." };
  }
  const { BlobWriter, ZipWriter } = await import("@zip.js/zip.js");
  const writer = new ZipWriter(new BlobWriter("application/zip"));
  for (let i = 0; i < pngs.length; i++) await writer.add(`image-${i + 1}.png`, pngs[i].stream());
  const zip = await writer.close();
  return { blob: zip, filename: "clickpdf-images.zip", mime: "application/zip", note: `Extracted ${pngs.length} embedded image(s) as PNG in a ZIP.` };
}

async function processImageToPdf(files: File[], onProgress: ProgressFn): Promise<Outcome> {
  await emit([[5, "Reading images…"], [40, "Placing images…"], [85, "Building PDF…"], [95, "Finalizing…"]], onProgress);
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  for (let i = 0; i < files.length; i++) {
    onProgress({ percent: Math.round((i / files.length) * 90), status: `Adding image ${i + 1}/${files.length}…` });
    const img = await loadImage(files[i]);
    const format = files[i].type === "image/png" ? "PNG" : "JPEG";
    let w = pageW - 80;
    let h = (img.naturalHeight / img.naturalWidth) * w;
    if (h > pageH - 80) {
      h = pageH - 80;
      w = (img.naturalWidth / img.naturalHeight) * h;
    }
    doc.addImage(img, format, (pageW - w) / 2, (pageH - h) / 2, w, h);
    if (i < files.length - 1) doc.addPage();
  }
  return { blob: doc.output("blob"), filename: "clickpdf-images.pdf", mime: "application/pdf", note: `Converted ${files.length} image(s) to PDF.` };
}

async function processWatermark(files: File[], mode: "add" | "remove", text: string, onProgress: ProgressFn): Promise<Outcome> {
  const file = files[0];
  const src = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true });
  if (mode === "add") {
    await emit([[10, "Reading PDF…"], [50, "Stamping watermark…"], [85, "Finalizing…"]], onProgress);
    const font = await src.embedFont(StandardFonts.HelveticaBold);
    const label = (text || "CONFIDENTIAL").toUpperCase();
    for (const page of src.getPages()) {
      const { width, height } = page.getSize();
      page.drawText(label, { x: width / 2 - 170, y: height / 2, size: 42, font, color: rgb(0.55, 0.58, 0.65), opacity: 0.3, rotate: degrees(-45) });
    }
    const bytes = await src.save({ useObjectStreams: true });
    return { blob: pdfBlob(bytes), filename: "clickpdf-watermarked.pdf", mime: "application/pdf", note: "Added a diagonal text watermark." };
  }
  await emit([[10, "Rendering pages…"], [50, "Fading watermark…"], [85, "Rebuilding…"]], onProgress);
  const pdfjs = await loadPdfjs();
  const doc = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
  const out = await PDFDocument.create();
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const viewport = page.getViewport({ scale: 2 });
    const canvas = document.createElement("canvas");
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas is not supported in this browser.");
    await page.render({ canvasContext: ctx, viewport, canvas }).promise;
    ctx.filter = "brightness(1.08) contrast(1.04)";
    ctx.drawImage(canvas, 0, 0);
    ctx.filter = "none";
    const png = await canvasToBlob(canvas, "image/png");
    const img = await out.embedPng(await png.arrayBuffer());
    const p = out.addPage([img.width, img.height]);
    p.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
  }
  const bytes = await out.save({ useObjectStreams: true });
  return { blob: pdfBlob(bytes), filename: "clickpdf-clean.pdf", mime: "application/pdf", note: "Applied a lighten pass (best-effort watermark fade)." };
}

async function processReorder(files: File[], onProgress: ProgressFn): Promise<Outcome> {
  await emit([[5, "Reading PDF…"], [40, "Reversing pages…"], [80, "Rebuilding…"], [95, "Finalizing…"]], onProgress);
  const src = await PDFDocument.load(await files[0].arrayBuffer(), { ignoreEncryption: true });
  const out = await PDFDocument.create();
  const pages = await out.copyPages(src, src.getPageIndices().reverse());
  pages.forEach((page) => out.addPage(page));
  const bytes = await out.save({ useObjectStreams: true });
  return { blob: pdfBlob(bytes), filename: "clickpdf-reordered.pdf", mime: "application/pdf", note: "Reversed the page order." };
}

async function processSignature(files: File[], signatureDataUrl: string, onProgress: ProgressFn): Promise<Outcome> {
  if (!signatureDataUrl) throw new Error("Draw a signature first.");
  await emit([[10, "Reading PDF…"], [40, "Embedding signature…"], [80, "Finalizing…"]], onProgress);
  const src = await PDFDocument.load(await files[0].arrayBuffer(), { ignoreEncryption: true });
  const page = src.getPage(src.getPageCount() - 1);
  const png = await (await fetch(signatureDataUrl)).arrayBuffer();
  const img = await src.embedPng(png);
  const { width, height } = page.getSize();
  const w = 170;
  const h = (img.height / img.width) * w;
  page.drawImage(img, { x: width - w - 40, y: height - h - 40, width: w, height: h });
  const bytes = await src.save({ useObjectStreams: true });
  return { blob: pdfBlob(bytes), filename: "clickpdf-signed.pdf", mime: "application/pdf", note: "Merged your signature onto the last page." };
}

type ToolOptions = {
  password?: string;
  pageRange?: string;
  watermarkText?: string;
  watermarkMode?: "add" | "remove";
  extractMode?: "text" | "ocr";
  signatureDataUrl?: string;
};

async function runTool(toolId: ToolId, files: File[], opts: ToolOptions, onProgress: ProgressFn): Promise<Outcome> {
  switch (toolId) {
    case "unlock":
      return processUnlock(files, onProgress);
    case "pdf-to-word":
      return processPdfToWord(files, onProgress);
    case "compress":
      return processCompress(files, onProgress);
    case "merge":
      return processMerge(files, onProgress);
    case "extract":
      return processExtract(files, opts.extractMode ?? "text", onProgress);
    case "clear-blurry":
      return processClearBlurry(files, onProgress);
    case "split":
      return processSplit(files, opts.pageRange ?? "", onProgress);
    case "pdf-to-excel":
      return processPdfToExcel(files, onProgress);
    case "protect":
      return processProtect(files, opts.password ?? "", onProgress);
    case "extract-images":
      return processExtractImages(files, onProgress);
    case "image-to-pdf":
      return processImageToPdf(files, onProgress);
    case "watermark":
      return processWatermark(files, opts.watermarkMode ?? "add", opts.watermarkText ?? "", onProgress);
    case "reorder":
      return processReorder(files, onProgress);
    case "signature":
      return processSignature(files, opts.signatureDataUrl ?? "", onProgress);
    default:
      throw new Error("Unknown tool.");
  }
}

export default function PdfToolEngine({
  initialTool = "compress",
  showAds = true,
}: {
  initialTool?: ToolId;
  showAds?: boolean;
}) {
  const [toolId, setToolId] = useState<ToolId>(initialTool);
  const [files, setFiles] = useState<File[]>([]);
  const [password, setPassword] = useState("");
  const [pageRange, setPageRange] = useState("");
  const [watermarkText, setWatermarkText] = useState("");
  const [watermarkMode, setWatermarkMode] = useState<"add" | "remove">("add");
  const [extractMode, setExtractMode] = useState<"text" | "ocr">("text");
  const [dragging, setDragging] = useState(false);
  const [phase, setPhase] = useState<"idle" | "processing" | "done" | "error">("idle");
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ url: string; filename: string; mime: string; note: string } | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const sigCanvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const urlRef = useRef<string | null>(null);

  const active = TOOLS.find((t) => t.id === toolId) ?? TOOLS[0];

  useEffect(() => {
    const c = sigCanvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, c.width, c.height);
  }, [toolId]);

  useEffect(() => {
    return () => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    };
  }, []);

  const addFiles = useCallback((list: FileList | null) => {
    if (!list || list.length === 0) return;
    setFiles((prev) => [...prev, ...Array.from(list)].slice(0, active.multiple ? 20 : 1));
  }, [active.multiple]);

  const handleInput = (e: ChangeEvent<HTMLInputElement>) => {
    addFiles(e.target.files);
    e.target.value = "";
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const removeFile = (index: number) => setFiles((prev) => prev.filter((_, i) => i !== index));

  const handleSelect = (id: ToolId) => {
    setToolId(id);
    setFiles([]);
    setPassword("");
    setPageRange("");
    setWatermarkText("");
    setWatermarkMode("add");
    setExtractMode("text");
    setPhase("idle");
    setProgress(0);
    setStatus("");
    setError("");
    setResult(null);
  };

  const sigPoint = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    const c = sigCanvasRef.current;
    if (!c) return null;
    const rect = c.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const onSigDown = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    const p = sigPoint(e);
    if (!p) return;
    drawingRef.current = true;
    lastPointRef.current = p;
  };

  const onSigMove = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    const p = sigPoint(e);
    if (!p) return;
    const c = sigCanvasRef.current;
    const ctx = c?.getContext("2d");
    if (!c || !ctx) return;
    const last = lastPointRef.current ?? p;
    ctx.beginPath();
    ctx.moveTo(last.x, last.y);
    ctx.lineTo(p.x, p.y);
    ctx.strokeStyle = "#0f172a";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.stroke();
    lastPointRef.current = p;
  };

  const onSigUp = () => {
    drawingRef.current = false;
    lastPointRef.current = null;
  };

  const clearSignature = () => {
    const c = sigCanvasRef.current;
    const ctx = c?.getContext("2d");
    if (c && ctx) {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, c.width, c.height);
    }
  };

  const handleRun = async () => {
    if (files.length === 0) {
      setError("Please add at least one file first.");
      setPhase("error");
      return;
    }
    const signatureDataUrl = toolId === "signature" ? sigCanvasRef.current?.toDataURL("image/png") : undefined;
    setPhase("processing");
    setProgress(0);
    setStatus("Starting…");
    setError("");
    setResult(null);
    try {
      const outcome = await runTool(toolId, files, { password, pageRange, watermarkText, watermarkMode, extractMode, signatureDataUrl }, (p) => {
        setProgress(p.percent);
        setStatus(p.status);
      });
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
      const url = URL.createObjectURL(outcome.blob);
      urlRef.current = url;
      setResult({ url, filename: outcome.filename, mime: outcome.mime, note: outcome.note });
      setProgress(100);
      setStatus("Complete");
      setPhase("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Processing failed.");
      setPhase("error");
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-6">
        {/* Header ad slots */}
        {showAds && (
          <div className="space-y-3">
            <AdSlot id="ad-header-desktop" size="728x90" />
            <AdSlot id="ad-header-mobile" size="320x50" />
          </div>
        )}

        <header className="py-6 text-center">
          <h1 className="text-2xl font-extrabold sm:text-3xl">Clickpdf.online Tools</h1>
          <p className="mt-1 text-sm text-slate-400">
            All 14 tools run 100% in your browser — nothing is uploaded.
          </p>
        </header>

        {/* Tool grid */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {TOOLS.map((t) => {
            const selected = t.id === toolId;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => handleSelect(t.id)}
                className={`flex flex-col items-center gap-2 rounded-xl border p-3 text-center transition-colors ${
                  selected
                    ? "border-emerald-500/60 bg-emerald-500/10 text-white"
                    : "border-slate-800 bg-slate-900/40 text-slate-400 hover:border-slate-700 hover:text-white"
                }`}
              >
                <t.icon className={`h-5 w-5 ${selected ? "text-emerald-400" : "text-slate-500"}`} />
                <span className="text-xs font-semibold leading-tight">{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Main card */}
        <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/50 p-5 backdrop-blur">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
              <active.icon className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-white">{active.label}</h2>
              <p className="text-xs text-slate-400">{active.tagline}</p>
            </div>
          </div>

          {toolId === "extract" && (
            <div className="mt-4 flex gap-2">
              {(["text", "ocr"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setExtractMode(m)}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                    extractMode === m
                      ? "bg-emerald-500 text-slate-950"
                      : "border border-slate-700 text-slate-400 hover:text-white"
                  }`}
                >
                  {m === "text" ? "Text layer" : "OCR"}
                </button>
              ))}
            </div>
          )}

          {toolId === "split" && (
            <div className="mt-4">
              <label className="mb-1.5 block text-xs font-semibold text-slate-400">Page range</label>
              <input
                type="text"
                value={pageRange}
                onChange={(e) => setPageRange(e.target.value)}
                placeholder="e.g. 1-3 or 2,4"
                className="w-full rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:border-emerald-500/60 focus:outline-none"
              />
            </div>
          )}

          {toolId === "protect" && (
            <div className="mt-4">
              <label className="mb-1.5 block text-xs font-semibold text-slate-400">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="New password"
                className="w-full rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:border-emerald-500/60 focus:outline-none"
              />
            </div>
          )}

          {toolId === "watermark" && (
            <div className="mt-4 space-y-3">
              <div className="flex gap-2">
                {(["add", "remove"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setWatermarkMode(m)}
                    className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                      watermarkMode === m
                        ? "bg-emerald-500 text-slate-950"
                        : "border border-slate-700 text-slate-400 hover:text-white"
                    }`}
                  >
                    {m === "add" ? "Add watermark" : "Remove watermark"}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={watermarkText}
                onChange={(e) => setWatermarkText(e.target.value)}
                placeholder="Watermark text (add mode)"
                className="w-full rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:border-emerald-500/60 focus:outline-none"
              />
            </div>
          )}

          {toolId === "signature" && (
            <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/60 p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Draw your signature</span>
                <button type="button" onClick={clearSignature} className="text-xs font-medium text-slate-500 hover:text-red-400">
                  Clear
                </button>
              </div>
              <canvas
                ref={sigCanvasRef}
                width={500}
                height={160}
                onPointerDown={onSigDown}
                onPointerMove={onSigMove}
                onPointerUp={onSigUp}
                onPointerLeave={onSigUp}
                className="w-full touch-none rounded-lg bg-white"
                style={{ height: 160 }}
              />
            </div>
          )}

          {/* Dropzone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            className={`mt-5 rounded-2xl border-2 border-dashed p-6 text-center transition-colors ${
              dragging ? "border-emerald-500 bg-emerald-500/10" : "border-slate-700 bg-slate-950/40"
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              multiple={active.multiple}
              accept={active.accept}
              className="hidden"
              onChange={handleInput}
            />
            <Upload className="mx-auto h-8 w-8 text-emerald-400" />
            <p className="mt-3 text-sm font-semibold text-white">{dragging ? "Drop files here" : active.hint}</p>
            <p className="mt-1 text-xs text-slate-400">
              or{" "}
              <button type="button" onClick={() => inputRef.current?.click()} className="font-semibold text-emerald-400 hover:text-emerald-300">
                browse files
              </button>
            </p>
            <p className="mt-1.5 text-[11px] text-slate-500">
              {active.acceptLabel} · {active.multiple ? "multiple files" : "single file"} · processed locally
            </p>
          </div>

          {/* Selected files */}
          {files.length > 0 && (
            <div className="mt-4 rounded-xl border border-slate-800 bg-slate-900/60 p-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-300">
                  {files.length} file{files.length > 1 ? "s" : ""} ready
                </p>
                <button type="button" onClick={() => setFiles([])} className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-red-400">
                  <Trash2 className="h-3.5 w-3.5" />
                  Clear all
                </button>
              </div>
              <ul className="mt-3 space-y-2">
                {files.map((f, i) => (
                  <li key={`${f.name}-${i}`} className="flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-950/50 px-3 py-2">
                    <FileText className="h-4 w-4 shrink-0 text-emerald-400" />
                    <span className="min-w-0 flex-1 truncate text-sm text-slate-300">{f.name}</span>
                    <span className="text-xs text-slate-500">{formatBytes(f.size)}</span>
                    <button type="button" onClick={() => removeFile(i)} aria-label={`Remove ${f.name}`} className="text-slate-500 hover:text-red-400">
                      <X className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Run button */}
          <button
            type="button"
            onClick={handleRun}
            disabled={phase === "processing"}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-3.5 text-sm font-bold text-slate-950 transition-colors hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {phase === "processing" ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-900/30 border-t-slate-900" />
                Processing…
              </>
            ) : (
              <>
                {active.label}
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>

          {/* Progress */}
          {phase === "processing" && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>{status}</span>
                <span>{progress}%</span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-800">
                <div className="h-full rounded-full bg-emerald-500 transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          {/* Error */}
          {phase === "error" && error && (
            <p className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</p>
          )}

          {/* Result */}
          {phase === "done" && result && (
            <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
                <span className="text-sm font-semibold text-white">Ready to download</span>
              </div>
              <p className="mt-2 text-xs text-slate-400">{result.note}</p>
              <a
                href={result.url}
                download={result.filename}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-emerald-400"
              >
                <Download className="h-4 w-4" />
                Download {result.filename}
              </a>
            </div>
          )}
        </div>

        {/* Footer ad slots */}
        {showAds && (
          <div className="mt-6 space-y-3">
            <AdSlot id="ad-footer-desktop" size="728x90" />
            <AdSlot id="ad-footer-mobile" size="320x50" />
          </div>
        )}
      </div>
    </div>
  );
}