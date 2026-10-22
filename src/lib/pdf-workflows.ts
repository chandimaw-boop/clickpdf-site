import type { LucideIcon } from "lucide-react";
import {
  BadgeCheck,
  Cpu,
  Eraser,
  FileDown,
  FileLock2,
  FilePlus2,
  Files,
  FileText,
  Globe,
  HardDriveDownload,
  ImagePlus,
  Images,
  KeyRound,
  LayoutGrid,
  Lock,
  Minimize2,
  Pencil,
  PenLine,
  Presentation,
  Rocket,
  ScanText,
  Scissors,
  Shuffle,
  Smartphone,
  Sparkles,
  Table,
  TextSearch,
  Timer,
  TrendingDown,
  Zap,
} from "lucide-react";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export type Category = {
  id: string;
  label: string;
};

export const CATEGORIES: Category[] = [
  { id: "unlock", label: "Unlock & Security" },
  { id: "convert", label: "Convert" },
  { id: "compress", label: "Compress & Optimize" },
  { id: "organize", label: "Merge & Organize" },
  { id: "extract", label: "Extract & Edit" },
  { id: "mobile", label: "Mobile & Quick" },
];

export type EngineOp =
  | "merge"
  | "split"
  | "reorder"
  | "imagesToPdf"
  | "createDocument"
  | "compress"
  | "backup"
  | "analyze"
  | "simulate";

export type Workflow = {
  id: string;
  title: string;
  tagline: string;
  category: string;
  icon: LucideIcon;
  accept: string;
  acceptLabel: string;
  multiple: boolean;
  needsPassword?: boolean;
  needsPageRange?: boolean;
  needsFile: boolean;
  engine: EngineOp;
  mobile?: boolean;
};

export type WorkflowOptions = {
  password?: string;
  pageRange?: string;
};

export type ProgressUpdate = {
  percent: number;
  status: string;
};

export type ProcessResult = {
  blob: Blob | null;
  filename: string;
  kind: "real" | "demo";
  note: string;
  error?: string;
};

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export function formatBytes(bytes: number): string {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

async function emit(
  steps: Array<[number, string]>,
  onProgress: (p: ProgressUpdate) => void
) {
  for (const [percent, status] of steps) {
    onProgress({ percent, status });
    await sleep(260);
  }
}

export const WORKFLOWS: Workflow[] = [
  {
    id: "unlock",
    title: "Unlock PDF",
    tagline: "Unlock password-protected PDF",
    category: "unlock",
    icon: FileLock2,
    accept: ".pdf",
    acceptLabel: "PDF",
    multiple: false,
    needsPassword: true,
    needsFile: true,
    engine: "simulate",
  },
  {
    id: "pdf-to-word",
    title: "PDF to Word",
    tagline: "Convert PDF to Word",
    category: "convert",
    icon: FileText,
    accept: ".pdf",
    acceptLabel: "PDF",
    multiple: false,
    needsFile: true,
    engine: "simulate",
  },
  {
    id: "compress",
    title: "Compress PDF",
    tagline: "Compress PDF file size",
    category: "compress",
    icon: FileDown,
    accept: ".pdf",
    acceptLabel: "PDF",
    multiple: false,
    needsFile: true,
    engine: "compress",
  },
  {
    id: "merge",
    title: "Merge PDFs",
    tagline: "Merge multiple PDFs",
    category: "organize",
    icon: Files,
    accept: ".pdf",
    acceptLabel: "PDF",
    multiple: true,
    needsFile: true,
    engine: "merge",
  },
  {
    id: "extract-text",
    title: "Extract Text (OCR)",
    tagline: "Extract text from PDF/images",
    category: "extract",
    icon: ScanText,
    accept: ".pdf,image/*",
    acceptLabel: "PDF or image",
    multiple: false,
    needsFile: true,
    engine: "simulate",
  },
  {
    id: "edit-scanned",
    title: "Edit Scanned PDF",
    tagline: "Edit scanned PDF text",
    category: "extract",
    icon: Pencil,
    accept: ".pdf",
    acceptLabel: "PDF",
    multiple: false,
    needsFile: true,
    engine: "simulate",
  },
  {
    id: "split",
    title: "Split PDF Pages",
    tagline: "Split specific PDF pages",
    category: "organize",
    icon: Scissors,
    accept: ".pdf",
    acceptLabel: "PDF",
    multiple: false,
    needsPageRange: true,
    needsFile: true,
    engine: "split",
  },
  {
    id: "pdf-to-excel",
    title: "PDF to Excel",
    tagline: "Convert PDF to Excel",
    category: "convert",
    icon: Table,
    accept: ".pdf",
    acceptLabel: "PDF",
    multiple: false,
    needsFile: true,
    engine: "simulate",
  },
  {
    id: "mobile-hub",
    title: "Quick Mobile Tools",
    tagline: "Quick mobile PDF tools hub",
    category: "mobile",
    icon: LayoutGrid,
    accept: ".pdf",
    acceptLabel: "PDF",
    multiple: false,
    needsFile: true,
    engine: "simulate",
    mobile: true,
  },
  {
    id: "protect",
    title: "Protect PDF",
    tagline: "Protect PDF with a new password",
    category: "unlock",
    icon: Lock,
    accept: ".pdf",
    acceptLabel: "PDF",
    multiple: false,
    needsPassword: true,
    needsFile: true,
    engine: "simulate",
  },
  {
    id: "extract-images",
    title: "Extract Images",
    tagline: "Extract images from PDF",
    category: "extract",
    icon: Images,
    accept: ".pdf",
    acceptLabel: "PDF",
    multiple: false,
    needsFile: true,
    engine: "simulate",
  },
  {
    id: "browser-processing",
    title: "Browser Processing",
    tagline: "Client-side browser PDF processing",
    category: "extract",
    icon: Cpu,
    accept: ".pdf",
    acceptLabel: "PDF",
    multiple: false,
    needsFile: true,
    engine: "analyze",
  },
  {
    id: "reduce-mb-kb",
    title: "MB to KB",
    tagline: "Reduce PDF MB to KB instantly",
    category: "compress",
    icon: TrendingDown,
    accept: ".pdf",
    acceptLabel: "PDF",
    multiple: false,
    needsFile: true,
    engine: "compress",
  },
  {
    id: "remove-watermark",
    title: "Remove Watermark",
    tagline: "Remove watermark from PDF",
    category: "compress",
    icon: Eraser,
    accept: ".pdf",
    acceptLabel: "PDF",
    multiple: false,
    needsFile: true,
    engine: "simulate",
  },
  {
    id: "image-to-pdf",
    title: "Image to PDF",
    tagline: "Convert JPG/PNG to PDF",
    category: "convert",
    icon: ImagePlus,
    accept: "image/*",
    acceptLabel: "JPG or PNG",
    multiple: true,
    needsFile: true,
    engine: "imagesToPdf",
  },
  {
    id: "create-document",
    title: "Create Document",
    tagline: "Create official PDF documents on mobile",
    category: "extract",
    icon: FilePlus2,
    accept: "",
    acceptLabel: "No file needed",
    multiple: false,
    needsFile: false,
    engine: "createDocument",
    mobile: true,
  },
  {
    id: "clear-blurry",
    title: "Clear Blurry Scans",
    tagline: "Clear blurry scanned PDFs",
    category: "compress",
    icon: Sparkles,
    accept: ".pdf,image/*",
    acceptLabel: "PDF or image",
    multiple: false,
    needsFile: true,
    engine: "simulate",
  },
  {
    id: "fast-toolkit",
    title: "Fast Toolkit",
    tagline: "Fast online PDF toolkit",
    category: "mobile",
    icon: Zap,
    accept: ".pdf",
    acceptLabel: "PDF",
    multiple: false,
    needsFile: true,
    engine: "simulate",
  },
  {
    id: "pdf-to-ppt",
    title: "PDF to PowerPoint",
    tagline: "Convert PDF to PowerPoint (PPT)",
    category: "convert",
    icon: Presentation,
    accept: ".pdf",
    acceptLabel: "PDF",
    multiple: false,
    needsFile: true,
    engine: "simulate",
  },
  {
    id: "secure-backup",
    title: "Secure Backup",
    tagline: "Secure PDF backup and download",
    category: "organize",
    icon: HardDriveDownload,
    accept: ".pdf",
    acceptLabel: "PDF",
    multiple: false,
    needsFile: true,
    engine: "backup",
  },
  {
    id: "searchable-pdf",
    title: "Searchable PDF",
    tagline: "Searchable PDF text conversion",
    category: "convert",
    icon: TextSearch,
    accept: ".pdf,image/*",
    acceptLabel: "PDF or image",
    multiple: false,
    needsFile: true,
    engine: "simulate",
  },
  {
    id: "reorder",
    title: "Reorder Pages",
    tagline: "Reorder PDF pages",
    category: "organize",
    icon: Shuffle,
    accept: ".pdf",
    acceptLabel: "PDF",
    multiple: false,
    needsFile: true,
    engine: "reorder",
  },
  {
    id: "low-storage",
    title: "Low-storage Optimize",
    tagline: "Low-storage mobile PDF optimization",
    category: "mobile",
    icon: Minimize2,
    accept: ".pdf",
    acceptLabel: "PDF",
    multiple: false,
    needsFile: true,
    engine: "compress",
    mobile: true,
  },
  {
    id: "instant-utility",
    title: "Instant Web Utility",
    tagline: "Instant web-based PDF utility",
    category: "mobile",
    icon: Rocket,
    accept: ".pdf",
    acceptLabel: "PDF",
    multiple: false,
    needsFile: true,
    engine: "simulate",
  },
  {
    id: "password-recovery",
    title: "Password Recovery",
    tagline: "Forget PDF password recovery preview",
    category: "unlock",
    icon: KeyRound,
    accept: ".pdf",
    acceptLabel: "PDF",
    multiple: false,
    needsPassword: true,
    needsFile: true,
    engine: "simulate",
  },
  {
    id: "signature",
    title: "Add Signature",
    tagline: "Add digital signature to PDF",
    category: "unlock",
    icon: PenLine,
    accept: ".pdf",
    acceptLabel: "PDF",
    multiple: false,
    needsFile: true,
    engine: "simulate",
  },
  {
    id: "global-convert",
    title: "Global Convert",
    tagline: "Global fast PDF conversion",
    category: "convert",
    icon: Globe,
    accept: ".pdf",
    acceptLabel: "PDF",
    multiple: false,
    needsFile: true,
    engine: "simulate",
  },
  {
    id: "mobile-friendly",
    title: "Mobile-friendly Tool",
    tagline: "Mobile-friendly PDF tool",
    category: "mobile",
    icon: Smartphone,
    accept: ".pdf",
    acceptLabel: "PDF",
    multiple: false,
    needsFile: true,
    engine: "simulate",
    mobile: true,
  },
  {
    id: "ad-suite",
    title: "Free PDF Suite",
    tagline: "Ad-supported free PDF suite",
    category: "mobile",
    icon: BadgeCheck,
    accept: ".pdf",
    acceptLabel: "PDF",
    multiple: false,
    needsFile: true,
    engine: "simulate",
  },
  {
    id: "five-minute",
    title: "5-Minute Workflows",
    tagline: "Quick 5-minute PDF workflows",
    category: "mobile",
    icon: Timer,
    accept: ".pdf",
    acceptLabel: "PDF",
    multiple: false,
    needsFile: true,
    engine: "simulate",
    mobile: true,
  },
];

function parseRange(range: string, total: number): number[] {
  const clean = range.trim();
  if (!clean) return [];
  const indices = new Set<number>();
  for (const part of clean.split(",")) {
    const p = part.trim();
    if (!p) continue;
    const m = p.match(/^(\d+)\s*-\s*(\d+)$/);
    if (m) {
      let a = Number(m[1]);
      let b = Number(m[2]);
      if (a > b) [a, b] = [b, a];
      for (let i = Math.max(1, a); i <= Math.min(total, b); i++) {
        indices.add(i - 1);
      }
    } else if (/^\d+$/.test(p)) {
      const n = Number(p);
      if (n >= 1 && n <= total) indices.add(n - 1);
    }
  }
  return [...indices].sort((x, y) => x - y);
}

function demoBlob(text: string): Blob {
  return new Blob([text], { type: "text/plain;charset=utf-8" });
}

function csvBlob(rows: string[][]): Blob {
  const csv = rows
    .map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(","))
    .join("\n");
  return new Blob([csv], { type: "text/csv;charset=utf-8" });
}

function pdfBlob(bytes: Uint8Array): Blob {
  return new Blob([bytes as unknown as BlobPart], { type: "application/pdf" });
}

async function mergePdfs(
  files: File[],
  onProgress: (p: ProgressUpdate) => void
): Promise<ProcessResult> {
  await emit(
    [[5, "Reading PDFs…"], [35, "Extracting pages…"], [75, "Merging into one file…"], [95, "Finalizing…"]],
    onProgress
  );
  const out = await PDFDocument.create();
  for (const file of files) {
    const src = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true });
    const pages = await out.copyPages(src, src.getPageIndices());
    pages.forEach((page) => out.addPage(page));
  }
  const bytes = await out.save({ useObjectStreams: true });
  return {
    blob: pdfBlob(bytes),
    filename: "clickpdf-merged.pdf",
    kind: "real",
    note: `Merged ${files.length} file(s) into a single PDF.`,
  };
}

async function splitPdf(
  files: File[],
  options: WorkflowOptions,
  onProgress: (p: ProgressUpdate) => void
): Promise<ProcessResult> {
  await emit(
    [[5, "Reading PDF…"], [40, "Extracting selected pages…"], [80, "Building split PDF…"], [95, "Finalizing…"]],
    onProgress
  );
  const src = await PDFDocument.load(await files[0].arrayBuffer(), { ignoreEncryption: true });
  const total = src.getPageCount();
  const indices = parseRange(options.pageRange ?? "", total);
  if (indices.length === 0) throw new Error("Enter a valid page range, e.g. 1-3 or 2,4.");
  const out = await PDFDocument.create();
  const pages = await out.copyPages(src, indices);
  pages.forEach((page) => out.addPage(page));
  const bytes = await out.save({ useObjectStreams: true });
  return {
    blob: pdfBlob(bytes),
    filename: "clickpdf-split.pdf",
    kind: "real",
    note: `Extracted ${indices.length} page(s) from a ${total}-page PDF.`,
  };
}

async function reorderPdf(
  files: File[],
  onProgress: (p: ProgressUpdate) => void
): Promise<ProcessResult> {
  await emit(
    [[5, "Reading PDF…"], [40, "Reversing page order…"], [80, "Rebuilding PDF…"], [95, "Finalizing…"]],
    onProgress
  );
  const src = await PDFDocument.load(await files[0].arrayBuffer(), { ignoreEncryption: true });
  const out = await PDFDocument.create();
  const pages = await out.copyPages(src, src.getPageIndices().reverse());
  pages.forEach((page) => out.addPage(page));
  const bytes = await out.save({ useObjectStreams: true });
  return {
    blob: pdfBlob(bytes),
    filename: "clickpdf-reordered.pdf",
    kind: "real",
    note: "Reversed the page order of your PDF.",
  };
}

async function imagesToPdf(
  files: File[],
  onProgress: (p: ProgressUpdate) => void
): Promise<ProcessResult> {
  await emit(
    [[5, "Reading images…"], [40, "Placing images on pages…"], [85, "Building PDF…"], [95, "Finalizing…"]],
    onProgress
  );
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
  return {
    blob: pdfBlob(bytes),
    filename: "clickpdf-images.pdf",
    kind: "real",
    note: `Converted ${files.length} image(s) into a single PDF.`,
  };
}

async function createDocumentPdf(
  onProgress: (p: ProgressUpdate) => void
): Promise<ProcessResult> {
  await emit(
    [[10, "Creating page…"], [45, "Writing header…"], [80, "Formatting layout…"], [95, "Finalizing…"]],
    onProgress
  );
  const doc = await PDFDocument.create();
  const page = doc.addPage([595.28, 841.89]);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const blue = rgb(0.145, 0.388, 0.922);
  const gray = rgb(0.45, 0.5, 0.6);
  page.drawText("OFFICIAL DOCUMENT", { x: 50, y: 780, size: 20, font: bold, color: blue });
  page.drawText("Clickpdf.online", { x: 50, y: 748, size: 12, font: bold, color: rgb(0.2, 0.2, 0.25) });
  page.drawText(
    new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
    { x: 50, y: 726, size: 10, font, color: gray }
  );
  page.drawLine({ start: { x: 50, y: 706 }, end: { x: 545, y: 706 }, thickness: 1, color: blue });
  page.drawText("This document was generated instantly with the Clickpdf.online", { x: 50, y: 680, size: 11, font, color: gray });
  page.drawText("mobile document builder. Replace this placeholder text with your", { x: 50, y: 664, size: 11, font, color: gray });
  page.drawText("own content, then save or share the file.", { x: 50, y: 648, size: 11, font, color: gray });
  const bytes = await doc.save({ useObjectStreams: true });
  return {
    blob: pdfBlob(bytes),
    filename: "clickpdf-official-document.pdf",
    kind: "real",
    note: "Created a blank official PDF document.",
  };
}

async function compressPdf(
  files: File[],
  onProgress: (p: ProgressUpdate) => void
): Promise<ProcessResult> {
  await emit(
    [[5, "Reading PDF…"], [40, "Optimizing objects…"], [80, "Recompressing streams…"], [95, "Finalizing…"]],
    onProgress
  );
  const file = files[0];
  const before = file.size;
  const src = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true });
  const bytes = await src.save({ useObjectStreams: true });
  const after = bytes.byteLength;
  const saved = before - after;
  const note =
    saved > 0
      ? `Re-encoded PDF: ${formatBytes(before)} → ${formatBytes(after)} (${Math.round((saved / before) * 100)}% smaller).`
      : `PDF re-encoded to ${formatBytes(after)}. For aggressive compression under 100KB, large images need server-side optimization.`;
  return {
    blob: pdfBlob(bytes),
    filename: "clickpdf-compressed.pdf",
    kind: "real",
    note,
  };
}

async function backupPdf(
  files: File[],
  onProgress: (p: ProgressUpdate) => void
): Promise<ProcessResult> {
  await emit(
    [[5, "Reading PDF…"], [40, "Writing metadata…"], [80, "Packing backup…"], [95, "Finalizing…"]],
    onProgress
  );
  const src = await PDFDocument.load(await files[0].arrayBuffer(), { ignoreEncryption: true });
  src.setTitle("Clickpdf.online backup");
  src.setProducer("Clickpdf.online");
  src.setCreator("Clickpdf.online");
  const bytes = await src.save({ useObjectStreams: true });
  return {
    blob: pdfBlob(bytes),
    filename: "clickpdf-backup.pdf",
    kind: "real",
    note: "Created a re-encoded backup copy of your PDF.",
  };
}

async function analyzePdf(
  files: File[],
  onProgress: (p: ProgressUpdate) => void
): Promise<ProcessResult> {
  await emit(
    [[10, "Reading PDF…"], [50, "Inspecting document…"], [85, "Summarizing…"]],
    onProgress
  );
  const file = files[0];
  const src = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true });
  const text = [
    `Clickpdf.online — PDF analysis`,
    `File: ${file.name}`,
    `Size: ${formatBytes(file.size)}`,
    `Pages: ${src.getPageCount()}`,
    `Encrypted: ${src.isEncrypted ? "Yes" : "No"}`,
    `Processed 100% in your browser.`,
  ].join("\n");
  return {
    blob: demoBlob(text),
    filename: "clickpdf-analysis.txt",
    kind: "real",
    note: `Analyzed "${file.name}" — ${src.getPageCount()} page(s).`,
  };
}

async function simulateWorkflow(
  workflow: Workflow,
  files: File[],
  onProgress: (p: ProgressUpdate) => void
): Promise<ProcessResult> {
  const isCsv = workflow.id === "pdf-to-excel";
  const isSecurity =
    workflow.id === "unlock" ||
    workflow.id === "protect" ||
    workflow.id === "password-recovery";

  await emit(
    [
      [8, "Validating file…"],
      [28, isSecurity ? "Checking encryption…" : "Analyzing content…"],
      [55, "Processing document…"],
      [80, "Applying transformations…"],
      [95, "Generating output…"],
    ],
    onProgress
  );

  if (isCsv) {
    const rows = [
      ["Column A", "Column B", "Column C"],
      ["Sample row 1", "Sample row 1", "Sample row 1"],
      ["Sample row 2", "Sample row 2", "Sample row 2"],
      ["", "Demo CSV preview", ""],
    ];
    return {
      blob: csvBlob(rows),
      filename: "clickpdf-export.csv",
      kind: "demo",
      note: "Generated a demo CSV preview.",
    };
  }

  const lines = [
    `Clickpdf.online — ${workflow.title}`,
    `Workflow: ${workflow.tagline}`,
    `Files: ${files.map((f) => f.name).join(", ") || "(none)"}`,
    `Status: demo preview (client-side)`,
    ``,
    `This workflow runs as a simulated preview in the browser.`,
    `Connect a processing backend (or a heavier client library) to`,
    `produce the final output file.`,
  ];
  return {
    blob: demoBlob(lines.join("\n")),
    filename: "clickpdf-result.txt",
    kind: "demo",
    note: "Simulated workflow preview complete.",
  };
}

export async function runWorkflow(
  workflow: Workflow,
  files: File[],
  options: WorkflowOptions,
  onProgress: (p: ProgressUpdate) => void
): Promise<ProcessResult> {
  try {
    switch (workflow.engine) {
      case "merge":
        return await mergePdfs(files, onProgress);
      case "split":
        return await splitPdf(files, options, onProgress);
      case "reorder":
        return await reorderPdf(files, onProgress);
      case "imagesToPdf":
        return await imagesToPdf(files, onProgress);
      case "createDocument":
        return await createDocumentPdf(onProgress);
      case "compress":
        return await compressPdf(files, onProgress);
      case "backup":
        return await backupPdf(files, onProgress);
      case "analyze":
        return await analyzePdf(files, onProgress);
      default:
        return await simulateWorkflow(workflow, files, onProgress);
    }
  } catch (err) {
    return {
      blob: null,
      filename: "",
      kind: "demo",
      note: "",
      error:
        err instanceof Error
          ? err.message
          : "Something went wrong while processing the file.",
    };
  }
}