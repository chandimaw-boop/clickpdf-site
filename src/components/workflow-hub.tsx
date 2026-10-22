"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ChangeEvent, DragEvent } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Download,
  FileText,
  Lock,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { formatBytes, runWorkflow } from "@/lib/pdf-workflows";
import type { ProgressUpdate, Workflow } from "@/lib/pdf-workflows";

type Phase = "idle" | "processing" | "done" | "error";

export function WorkflowHub({ workflow }: { workflow: Workflow }) {
  const [files, setFiles] = useState<File[]>([]);
  const [password, setPassword] = useState("");
  const [pageRange, setPageRange] = useState("");
  const [dragging, setDragging] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<{
    url: string;
    filename: string;
    kind: "real" | "demo";
    note: string;
  } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Clean up object URLs
  useEffect(() => {
    return () => {
      if (result?.url) URL.revokeObjectURL(result.url);
    };
  }, [result]);

  const addFiles = useCallback(
    (list: FileList | null) => {
      if (!list || list.length === 0) return;
      setFiles((prev) =>
        [...prev, ...Array.from(list)].slice(0, workflow.multiple ? 20 : 1)
      );
    },
    [workflow.multiple]
  );

  const handleInput = (e: ChangeEvent<HTMLInputElement>) => {
    addFiles(e.target.files);
    e.target.value = "";
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const removeFile = (index: number) =>
    setFiles((prev) => prev.filter((_, i) => i !== index));

  const canRun = workflow.needsFile ? files.length > 0 : true;

  const handleRun = async () => {
    if (workflow.needsFile && files.length === 0) {
      setError("Please add at least one file first.");
      setPhase("error");
      return;
    }
    if (workflow.needsPassword && !password.trim()) {
      setError("Please enter a password to continue.");
      setPhase("error");
      return;
    }

    setPhase("processing");
    setProgress(0);
    setStatus("Starting…");
    setError("");
    setResult(null);

    const res = await runWorkflow(
      workflow,
      files,
      { password: password || undefined, pageRange: pageRange || undefined },
      (p: ProgressUpdate) => {
        setProgress(p.percent);
        setStatus(p.status);
      }
    );

    if (res.error) {
      setError(res.error);
      setPhase("error");
      return;
    }

    setResult(
      res.blob
        ? {
            url: URL.createObjectURL(res.blob),
            filename: res.filename,
            kind: res.kind,
            note: res.note,
          }
        : null
    );
    setProgress(100);
    setStatus("Complete");
    setPhase("done");
  };

  return (
    <section id="tools" className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-3xl overflow-hidden rounded-3xl border border-slate-800/70 bg-slate-900/50 shadow-2xl shadow-blue-950/40 backdrop-blur-xl">
        {/* Card header */}
        <div className="flex items-center gap-3 border-b border-slate-800/70 p-4 sm:p-5">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600/15 text-blue-400">
            <workflow.icon className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-base font-bold text-white sm:text-lg">
              {workflow.title}
            </h2>
            <p className="text-xs text-slate-400">{workflow.tagline}</p>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          {/* Dropzone */}
          {workflow.needsFile ? (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              className={`animate-glow-pulse rounded-2xl bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-500 p-px transition ${
                dragging ? "ring-2 ring-blue-400/70" : ""
              }`}
            >
              <div className="flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-[15px] bg-slate-950/80 px-6 py-8 text-center backdrop-blur-xl">
                <input
                  ref={inputRef}
                  type="file"
                  multiple={workflow.multiple}
                  accept={workflow.accept}
                  className="hidden"
                  onChange={handleInput}
                />
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600/15 text-blue-400">
                  <Upload className="h-7 w-7" />
                </div>
                <p className="mt-4 text-sm font-semibold text-white">
                  {dragging ? "Drop files here" : `Drop ${workflow.acceptLabel} here`}
                </p>
                <p className="mt-1.5 text-xs text-slate-400">
                  or{" "}
                  <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    className="font-semibold text-blue-400 hover:text-blue-300"
                  >
                    browse files
                  </button>
                </p>
                <p className="mt-2 text-[11px] text-slate-500">
                  {workflow.multiple ? "Multiple files supported" : "Single file"} ·
                  processed locally
                </p>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-6 text-center">
              <p className="text-sm text-slate-400">
                No upload needed — generate a document instantly.
              </p>
            </div>
          )}

          {/* Options */}
          {workflow.needsPassword && (
            <div className="mt-4">
              <label
                htmlFor={`pw-${workflow.id}`}
                className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-400"
              >
                <Lock className="h-3.5 w-3.5" /> Password
              </label>
              <input
                id={`pw-${workflow.id}`}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter the PDF password"
                className="w-full rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:border-blue-500/60 focus:outline-none"
              />
            </div>
          )}

          {workflow.needsPageRange && (
            <div className="mt-4">
              <label
                htmlFor={`range-${workflow.id}`}
                className="mb-1.5 block text-xs font-semibold text-slate-400"
              >
                Page range
              </label>
              <input
                id={`range-${workflow.id}`}
                type="text"
                value={pageRange}
                onChange={(e) => setPageRange(e.target.value)}
                placeholder="e.g. 1-3 or 2,4"
                className="w-full rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:border-blue-500/60 focus:outline-none"
              />
            </div>
          )}

          {/* Selected files */}
          {files.length > 0 && (
            <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-300">
                  {files.length} file{files.length > 1 ? "s" : ""} ready
                </p>
                <button
                  type="button"
                  onClick={() => setFiles([])}
                  className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 transition-colors hover:text-red-400"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Clear all
                </button>
              </div>
              <ul className="mt-3 space-y-2">
                {files.map((f, i) => (
                  <li
                    key={`${f.name}-${i}`}
                    className="flex items-center gap-3 rounded-xl border border-slate-800/80 bg-slate-950/50 px-3 py-2"
                  >
                    <FileText className="h-4 w-4 shrink-0 text-blue-400" />
                    <span className="min-w-0 flex-1 truncate text-sm text-slate-300">
                      {f.name}
                    </span>
                    <span className="text-xs text-slate-500">
                      {formatBytes(f.size)}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      aria-label={`Remove ${f.name}`}
                      className="text-slate-500 transition-colors hover:text-red-400"
                    >
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
            disabled={phase === "processing" || !canRun}
            className="group mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 text-base font-bold text-white shadow-xl shadow-blue-600/30 transition-all hover:shadow-blue-500/50 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {phase === "processing" ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                Processing…
              </>
            ) : (
              <>
                {workflow.title}
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>

          {/* Progress */}
          {phase === "processing" && (
            <div className="mt-5">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>{status}</span>
                <span>{progress}%</span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-600 to-sky-400 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Error */}
          {phase === "error" && error && (
            <p className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </p>
          )}

          {/* Result */}
          {phase === "done" && result && (
            <div className="mt-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
                <span className="text-sm font-semibold text-white">
                  Ready to download
                </span>
                <span
                  className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                    result.kind === "real"
                      ? "bg-emerald-500/20 text-emerald-300"
                      : "bg-amber-500/20 text-amber-300"
                  }`}
                >
                  {result.kind === "real" ? "Real" : "Demo"}
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-400">{result.note}</p>
              <a
                href={result.url}
                download={result.filename}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
              >
                <Download className="h-4 w-4" />
                Download {result.filename}
              </a>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}