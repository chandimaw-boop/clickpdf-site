"use client";

import { useState } from "react";
import {
  CheckCircle2,
  ChevronDown,
  Gauge,
  Globe,
  LockOpen,
  Menu,
  ScanLine,
  ShieldCheck,
  Sparkles,
  X,
  Zap,
} from "lucide-react";
import { WORKFLOWS } from "@/lib/pdf-workflows";
import { WorkflowGrid } from "@/components/workflow-grid";
import { WorkflowHub } from "@/components/workflow-hub";

const NAV_LINKS = [
  { label: "Tools", href: "#tools" },
  { label: "All 30 Workflows", href: "#all-tools" },
  { label: "FAQ", href: "#faq" },
];

const FEATURES = [
  {
    icon: ShieldCheck,
    title: "Bank-grade Security",
    text: "Files are processed in your browser and never uploaded to a server.",
  },
  {
    icon: Gauge,
    title: "Blazing Fast",
    text: "Compress PDF file size under 100KB online in seconds, not minutes.",
  },
  {
    icon: LockOpen,
    title: "No Limits",
    text: "A free online PDF password remover no limit — no caps, no watermarks.",
  },
  {
    icon: ScanLine,
    title: "OCR Powered",
    text: "Convert scanned PDF to Word editable free with smart text recognition.",
  },
];

const KEYWORD_LIST = [
  "Free online PDF password remover no limit — no watermarks or file caps.",
  "Unlock password protected PDF online fast, right in your browser.",
  "Compress PDF file size under 100KB online without losing quality.",
  "Merge PDF files free without registration in a single click.",
  "Convert scanned PDF to Word editable free with built-in OCR.",
  "Instant image to PDF converter online free for JPG, PNG, and WebP.",
];

const FAQS = [
  {
    q: "How can I remove a password from a PDF online for free with no limit?",
    a: "Use the free online PDF password remover with no limit on Clickpdf.online. Upload your locked file, enter the password to unlock it, and download the unprotected PDF instantly — no account or file size cap required.",
  },
  {
    q: "Can I unlock a password protected PDF online fast?",
    a: "Yes. Unlock password protected PDF online fast by uploading your file to Clickpdf.online. The browser-based tool removes the open or owner password in seconds while keeping your document private.",
  },
  {
    q: "How do I compress a PDF file size under 100KB online?",
    a: "To compress PDF file size under 100KB online, upload your PDF to Clickpdf.online and choose the maximum compression level. The tool optimizes images and streams without requiring signup.",
  },
  {
    q: "Can I merge PDF files free without registration?",
    a: "Yes, you can merge PDF files free without registration on Clickpdf.online. Drag and drop multiple PDFs, arrange them in order, and download a single combined file in one click.",
  },
  {
    q: "How do I convert a scanned PDF to an editable Word document for free?",
    a: "Convert scanned PDF to Word editable free by uploading your scanned file to Clickpdf.online. The OCR engine recognizes the text and produces an editable DOCX you can download at no cost.",
  },
  {
    q: "Is there an instant image to PDF converter online free?",
    a: "Yes. Clickpdf.online offers an instant image to PDF converter online free. Upload JPG, PNG, or WebP images and turn them into a single, shareable PDF in seconds.",
  },
];

// Paste the "invoke.js" URL from your Adsterra Popunder zone below.
const ADSTERRA_POPUNDER_URL = "";

let adsterraInvoked = false;

function triggerAdsterraPopunder() {
  if (typeof window === "undefined") return;

  if (!ADSTERRA_POPUNDER_URL) {
    if (process.env.NODE_ENV !== "production") {
      console.info(
        "[Clickpdf.online] Adsterra popunder trigger fired — set ADSTERRA_POPUNDER_URL to activate."
      );
    }
    return;
  }

  if (adsterraInvoked) return;
  adsterraInvoked = true;

  const script = document.createElement("script");
  script.type = "text/javascript";
  script.async = true;
  script.src = ADSTERRA_POPUNDER_URL;
  document.head.appendChild(script);
}

function AdSlot({
  id,
  label,
  className = "",
}: {
  id: string;
  label: string;
  className?: string;
}) {
  return (
    <div
      id={id}
      data-adsterra-slot={id}
      className={`flex items-center justify-center rounded-xl border border-dashed border-slate-700/60 bg-slate-900/40 text-slate-500 ${className}`}
    >
      <span className="px-4 py-3 text-center text-[10px] font-semibold uppercase tracking-[0.25em]">
        {label} · Adsterra
      </span>
    </div>
  );
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [selectedId, setSelectedId] = useState("compress");

  const selectedWorkflow =
    WORKFLOWS.find((w) => w.id === selectedId) ?? WORKFLOWS[0];

  const handleSelect = (id: string) => {
    setSelectedId(id);
    document.getElementById("tools")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div id="top" className="relative min-h-screen overflow-x-hidden pb-20">
      {/* Decorative background */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-blue-600/20 blur-[120px]" />
        <div className="animate-float-slow absolute right-0 top-1/3 h-[400px] w-[400px] rounded-full bg-indigo-600/10 blur-[100px]" />
        <div className="animate-float-slow absolute left-0 top-2/3 h-[400px] w-[400px] rounded-full bg-sky-500/10 blur-[100px]" />
        <div className="bg-grid absolute inset-0" />
      </div>

      {/* Header ad space */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 pt-4 sm:px-6">
        <AdSlot
          id="header-ad"
          label="728×90 · Header"
          className="min-h-[60px] sm:min-h-[90px]"
        />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-800/70 bg-slate-950/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <a href="#top" className="group flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-600/30 transition-transform group-hover:scale-105">
              <Sparkles className="h-5 w-5 text-white" />
            </span>
            <span className="text-lg font-extrabold tracking-tight">
              <span className="animate-gradient-x bg-gradient-to-r from-blue-500 via-sky-400 to-indigo-400 bg-clip-text text-transparent">
                Clickpdf
              </span>
              <span className="text-slate-300">.online</span>
            </span>
          </a>

          <nav className="hidden items-center gap-1 lg:flex">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <a
              href="#tools"
              onClick={() => triggerAdsterraPopunder()}
              className="hidden items-center gap-1.5 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 transition-all hover:bg-blue-500 hover:shadow-blue-500/40 sm:inline-flex"
            >
              <Zap className="h-4 w-4" />
              Quick Convert
            </a>
            <button
              type="button"
              aria-label="Toggle menu"
              onClick={() => setMenuOpen((v) => !v)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-800 text-slate-300 transition-colors hover:bg-white/5 lg:hidden"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav className="border-t border-slate-800/70 px-4 py-3 lg:hidden">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-white"
              >
                {link.label}
              </a>
            ))}
          </nav>
        )}
      </header>

      {/* Hero */}
      <section className="relative mx-auto max-w-7xl px-4 pb-14 pt-16 sm:px-6 sm:pt-20">
        <div className="mx-auto max-w-4xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-xs font-semibold text-blue-300">
            <Sparkles className="h-3.5 w-3.5" />
            100% Free · No Registration · No Watermarks
          </span>

          <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
            Unlock, Convert &amp; Compress PDFs{" "}
            <span className="animate-gradient-x bg-gradient-to-r from-blue-500 via-sky-400 to-indigo-400 bg-clip-text text-transparent">
              Instantly
            </span>{" "}
            - 100% Free &amp; Secure
          </h1>

          <h2 className="mx-auto mt-5 max-w-3xl text-base leading-relaxed text-slate-400 sm:text-lg">
            Remove PDF passwords with no limit, unlock password protected PDF online
            fast, compress PDF file size under 100KB online, merge PDF files free
            without registration, convert scanned PDF to Word editable free, and use
            the instant image to PDF converter online free — all in your browser.
          </h2>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {[
              { icon: ShieldCheck, label: "256-bit secure" },
              { icon: Zap, label: "Processed in seconds" },
              { icon: Globe, label: "Works on any device" },
            ].map((b) => (
              <span
                key={b.label}
                className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/60 px-4 py-1.5 text-xs font-medium text-slate-300"
              >
                <b.icon className="h-4 w-4 text-blue-400" />
                {b.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive workflow hub */}
      <WorkflowHub key={selectedWorkflow.id} workflow={selectedWorkflow} />

      {/* All 30 workflows */}
      <WorkflowGrid selectedId={selectedId} onSelect={handleSelect} />

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-6 backdrop-blur transition-colors hover:border-blue-500/40"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600/15 text-blue-400">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-bold text-white">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                {f.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* SEO content */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            The all-in-one PDF toolkit that runs right in your browser
          </h2>
          <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-slate-400">
            <p>
              Clickpdf.online is a complete, free online PDF toolkit built for speed
              and privacy. Whether you need to unlock password protected PDF online
              fast, compress PDF file size under 100KB online, or merge PDF files
              free without registration, every tool runs directly in your browser.
              There is no software to install, no account to create, and no hidden
              subscription. Upload your files, process them in seconds, and download
              the finished result instantly.
            </p>
            <p>
              Our free online PDF password remover no limit is the fastest way to
              open a locked document. It removes both open and owner passwords
              without watermarks or file size caps, so you stay in full control of
              your files. For documents that are scanned or image-based, use the
              built-in OCR to convert scanned PDF to Word editable free. The
              converter keeps your layout intact and produces a clean DOCX you can
              edit in Microsoft Word or Google Docs.
            </p>
            <p>
              Beyond unlocking and conversion, the platform helps you get documents
              ready to share. Use the instant image to PDF converter online free to
              turn JPG, PNG, and WebP images into a polished PDF, or merge PDF files
              free without registration to combine contracts, invoices, and reports
              into a single file. Compression is just as simple — drop in a large PDF
              and reduce it to well under 100KB for email and web uploads.
            </p>
          </div>
          <ul className="mt-6 space-y-2.5">
            {KEYWORD_LIST.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm text-slate-400">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center text-2xl font-bold text-white sm:text-3xl">
            Frequently Asked Questions
          </h2>
          <p className="mt-2 text-center text-sm text-slate-400">
            Everything you need to know about Clickpdf.online
          </p>
          <div className="mt-8 space-y-3">
            {FAQS.map((item, i) => {
              const open = openFaq === i;
              return (
                <div
                  key={item.q}
                  className={`overflow-hidden rounded-2xl border transition-colors ${
                    open
                      ? "border-blue-500/40 bg-slate-900/60"
                      : "border-slate-800/80 bg-slate-900/40"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(open ? null : i)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                  >
                    <span className="text-sm font-semibold text-white sm:text-base">
                      {item.q}
                    </span>
                    <ChevronDown
                      className={`h-5 w-5 shrink-0 text-blue-400 transition-transform ${
                        open ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {open && (
                    <div className="px-5 pb-5 text-sm leading-relaxed text-slate-400">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/70 bg-slate-950/60">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="md:col-span-2">
              <a href="#top" className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600">
                  <Sparkles className="h-5 w-5 text-white" />
                </span>
                <span className="text-lg font-extrabold tracking-tight text-white">
                  <span className="animate-gradient-x bg-gradient-to-r from-blue-500 via-sky-400 to-indigo-400 bg-clip-text text-transparent">
                    Clickpdf
                  </span>
                  <span className="text-slate-300">.online</span>
                </span>
              </a>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">
                Free, fast, and secure PDF tools. Unlock, convert, compress, and
                merge PDFs without registration — right from your browser.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Tools</h4>
              <ul className="mt-3 space-y-2 text-sm text-slate-400">
                {WORKFLOWS.slice(0, 5).map((w) => (
                  <li key={w.id}>
                    <a href="#all-tools" className="transition-colors hover:text-white">
                      {w.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Company</h4>
              <ul className="mt-3 space-y-2 text-sm text-slate-400">
                <li>
                  <a href="#" className="transition-colors hover:text-white">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="transition-colors hover:text-white">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="transition-colors hover:text-white">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="transition-colors hover:text-white">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-10 border-t border-slate-800/70 pt-6 text-center text-xs text-slate-500">
            &copy; 2026 Clickpdf.online · All processing happens in your browser.
          </div>
        </div>
      </footer>

      {/* Sticky bottom ad / social bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-800/70 bg-slate-950/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="hidden text-xs font-medium text-slate-400 sm:inline">
              Follow us
            </span>
            <div className="flex items-center gap-1.5">
              {["X", "Telegram", "LinkedIn"].map((s) => (
                <a
                  key={s}
                  href="#"
                  className="rounded-full border border-slate-800 px-3 py-1 text-[11px] font-semibold text-slate-300 transition-colors hover:border-blue-500/50 hover:text-white"
                >
                  {s}
                </a>
              ))}
            </div>
          </div>
          <AdSlot
            id="sticky-social-ad"
            label="320×50 · Sticky"
            className="min-h-[40px] min-w-[180px] sm:min-w-[320px]"
          />
        </div>
      </div>
    </div>
  );
}