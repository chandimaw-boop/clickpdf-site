"use client";

import { useMemo, useState } from "react";
import { Search, Smartphone } from "lucide-react";
import { CATEGORIES, WORKFLOWS } from "@/lib/pdf-workflows";

export function WorkflowGrid({
  selectedId,
  onSelect,
}: {
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return WORKFLOWS.filter((w) => {
      const inCategory = category === "all" || w.category === category;
      const inQuery =
        !q ||
        w.title.toLowerCase().includes(q) ||
        w.tagline.toLowerCase().includes(q);
      return inCategory && inQuery;
    });
  }, [query, category]);

  return (
    <section id="all-tools" className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            Every PDF tool you need, in one place
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            30 free workflows — pick one to load it instantly.
          </p>
        </div>

        {/* Search + filters */}
        <div className="sticky top-16 z-30 mt-6 space-y-3 border-b border-slate-800/70 bg-slate-950/80 py-3 backdrop-blur-xl">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search 30 PDF tools…"
              className="w-full rounded-xl border border-slate-800 bg-slate-900/60 py-2.5 pl-9 pr-3 text-sm text-white placeholder:text-slate-500 focus:border-blue-500/60 focus:outline-none"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setCategory("all")}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                category === "all"
                  ? "bg-blue-600 text-white"
                  : "border border-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              All
            </button>
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategory(c.id)}
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                  category === c.id
                    ? "bg-blue-600 text-white"
                    : "border border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((w) => {
            const selected = w.id === selectedId;
            return (
              <button
                key={w.id}
                type="button"
                onClick={() => onSelect(w.id)}
                className={`group flex items-start gap-3 rounded-2xl border p-4 text-left transition-all ${
                  selected
                    ? "border-blue-500/60 bg-blue-500/10"
                    : "border-slate-800/80 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/60"
                }`}
              >
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                    selected
                      ? "bg-blue-600 text-white"
                      : "bg-blue-600/15 text-blue-400"
                  }`}
                >
                  <w.icon className="h-5 w-5" />
                </span>
                <span className="min-w-0">
                  <span className="flex items-center gap-1.5 text-sm font-semibold text-white">
                    {w.title}
                    {w.mobile && (
                      <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-400">
                        <Smartphone className="h-3 w-3" />
                        Mobile
                      </span>
                    )}
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-slate-400">
                    {w.tagline}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <p className="mt-8 text-center text-sm text-slate-500">
            No tools match your search.
          </p>
        )}
      </div>
    </section>
  );
}