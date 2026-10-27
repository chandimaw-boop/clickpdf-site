import type { Metadata } from "next";
import type { ToolId } from "@/components/PdfToolEngine";

export type ToolSeo = {
  slug: string;
  toolId: ToolId;
  title: string;
  description: string;
  keywords: string[];
};

export const TOOL_SEO: ToolSeo[] = [
  {
    slug: "unlock-pdf",
    toolId: "unlock",
    title: "Unlock PDF Online Free — Remove PDF Password Instantly",
    description: "Unlock password protected PDF online fast and free. Remove PDF passwords with no limit, no registration, and download your unlocked file instantly — 100% in your browser.",
    keywords: ["unlock pdf online", "remove pdf password", "unlock password protected pdf online fast", "free online pdf password remover no limit", "remove pdf password online free"],
  },
  {
    slug: "pdf-to-word",
    toolId: "pdf-to-word",
    title: "PDF to Word Converter — Free Online, Editable DOCX",
    description: "Convert PDF to Word online free. Turn PDF files into editable DOCX documents instantly, with no signup and no watermarks — processed entirely in your browser.",
    keywords: ["pdf to word", "convert pdf to word", "pdf to word converter online free", "pdf to docx", "convert scanned pdf to word editable free"],
  },
  {
    slug: "compress-pdf",
    toolId: "compress",
    title: "Compress PDF Online — Reduce PDF File Size Free",
    description: "Compress PDF file size online free. Shrink large PDFs to under 100KB without registration, right in your browser. Fast, secure, and ad-supported.",
    keywords: ["compress pdf", "reduce pdf file size", "compress pdf file size under 100kb online", "compress pdf online free", "pdf size reducer"],
  },
  {
    slug: "merge-pdf",
    toolId: "merge",
    title: "Merge PDF Files Free — Combine PDFs Without Registration",
    description: "Merge PDF files free without registration. Combine multiple PDFs into one document instantly with drag-and-drop, no signup and no watermarks.",
    keywords: ["merge pdf", "merge pdf files free without registration", "combine pdf online", "merge pdf online free", "join pdf files"],
  },
  {
    slug: "extract-text",
    toolId: "extract",
    title: "Extract Text from PDF — Free OCR Online",
    description: "Extract text from PDF or images with free OCR. Copy searchable text from scanned PDFs instantly using Tesseract.js, 100% in your browser.",
    keywords: ["extract text from pdf", "pdf ocr", "ocr online free", "pdf to text", "extract text from image"],
  },
  {
    slug: "clear-blurry",
    toolId: "clear-blurry",
    title: "Clear Blurry PDF Scans — Enhance Scanned PDFs Free",
    description: "Clear blurry scanned PDFs and enhance contrast online free. Improve low-quality scans and images instantly with browser-based canvas filters.",
    keywords: ["clear blurry scanned pdf", "enhance scanned pdf", "fix blurry pdf", "pdf image enhancement", "sharpen scanned document"],
  },
  {
    slug: "split-pdf",
    toolId: "split",
    title: "Split PDF Pages Online Free — Extract Pages Instantly",
    description: "Split PDF pages online free. Extract a specific page range from any PDF in seconds, with no registration and no watermarks.",
    keywords: ["split pdf", "split pdf pages", "extract pages from pdf", "split pdf online free", "pdf page extractor"],
  },
  {
    slug: "pdf-to-excel",
    toolId: "pdf-to-excel",
    title: "PDF to Excel Converter — Free Online CSV Export",
    description: "Convert PDF to Excel online free. Turn tabular PDF text into a downloadable CSV spreadsheet instantly, no signup required.",
    keywords: ["pdf to excel", "convert pdf to excel", "pdf to csv", "pdf to spreadsheet", "extract table from pdf"],
  },
  {
    slug: "protect-pdf",
    toolId: "protect",
    title: "Protect PDF with Password — Free Online PDF Security",
    description: "Protect PDF with a password online free. Add password encryption to your PDF documents before sharing, processed securely in your browser.",
    keywords: ["protect pdf", "add password to pdf", "pdf encryption", "password protect pdf online", "secure pdf"],
  },
  {
    slug: "extract-images",
    toolId: "extract-images",
    title: "Extract Images from PDF — Download JPG/PNG Free",
    description: "Extract images from PDF online free. Download embedded JPG and PNG images from any PDF instantly, with no registration or watermarks.",
    keywords: ["extract images from pdf", "pdf image extractor", "download images from pdf", "pdf to png", "extract jpg from pdf"],
  },
  {
    slug: "image-to-pdf",
    toolId: "image-to-pdf",
    title: "Image to PDF Converter — JPG/PNG to PDF Online Free",
    description: "Convert JPG and PNG images to PDF online free. Turn multiple images into a single PDF document instantly, no signup and no watermarks.",
    keywords: ["image to pdf", "jpg to pdf", "png to pdf", "instant image to pdf converter online free", "photo to pdf"],
  },
  {
    slug: "add-watermark",
    toolId: "watermark",
    title: "Add Watermark to PDF Online Free — Protect Documents",
    description: "Add a watermark to PDF online free. Stamp text watermarks onto your PDF pages instantly, or fade existing watermarks, right in your browser.",
    keywords: ["add watermark to pdf", "watermark pdf online", "pdf watermark remover", "stamp watermark on pdf", "watermark pdf free"],
  },
  {
    slug: "reorder-pages",
    toolId: "reorder",
    title: "Reorder PDF Pages Online Free — Organize Pages Instantly",
    description: "Reorder PDF pages online free. Reverse or organize page order in any PDF in seconds, with no registration and no watermarks.",
    keywords: ["reorder pdf pages", "organize pdf pages", "reverse pdf pages", "arrange pdf pages", "sort pdf pages"],
  },
  {
    slug: "sign-pdf",
    toolId: "signature",
    title: "Sign PDF Online Free — Add Signature to PDF",
    description: "Add a signature to PDF online free. Draw your signature and merge it onto any PDF page instantly, no signup required.",
    keywords: ["sign pdf", "add signature to pdf", "pdf signature online", "digital signature pdf", "draw signature on pdf"],
  },
];

export const TOOL_SLUGS = TOOL_SEO.map((t) => t.slug);

export function getToolSeo(slug: string): ToolSeo | undefined {
  return TOOL_SEO.find((t) => t.slug === slug);
}

const SITE_URL = "https://clickpdf.online";
const SITE_NAME = "Clickpdf.online";

export function buildToolMetadata(seo: ToolSeo): Metadata {
  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    alternates: { canonical: `/${seo.slug}` },
    openGraph: {
      type: "website",
      url: `${SITE_URL}/${seo.slug}`,
      siteName: SITE_NAME,
      title: seo.title,
      description: seo.description,
    },
    twitter: {
      card: "summary_large_image",
      title: seo.title,
      description: seo.description,
    },
  };
}