import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PdfToolEngine from "@/components/PdfToolEngine";
import { TOOL_SLUGS, buildToolMetadata, getToolSeo } from "@/lib/tools-seo";

export function generateStaticParams() {
  return TOOL_SLUGS.map((slug) => ({ tool: slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tool: string }>;
}): Promise<Metadata> {
  const { tool } = await params;
  const seo = getToolSeo(tool);
  if (!seo) {
    return {
      title: "Clickpdf.online — Free Online PDF Tools",
      description: "Free online PDF tools: unlock, compress, merge, convert, and more — 100% in your browser.",
    };
  }
  return buildToolMetadata(seo);
}

function AdBanner({ id, size }: { id: string; size: "728x90" | "320x50" }) {
  const desktop = size === "728x90";
  return (
    <div
      id={id}
      data-adsterra={size}
      className={`${desktop ? "hidden md:flex" : "flex md:hidden"} items-center justify-center ${
        desktop ? "min-h-[90px]" : "min-h-[50px]"
      } w-full rounded border border-dashed border-slate-800 bg-slate-950/40 text-slate-600`}
    >
      <span className="text-[10px] font-semibold uppercase tracking-[0.2em]">Adsterra {size}</span>
    </div>
  );
}

export default async function ToolPage({
  params,
}: {
  params: Promise<{ tool: string }>;
}) {
  const { tool } = await params;
  const seo = getToolSeo(tool);
  if (!seo) notFound();

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Sticky top ad */}
      <div className="sticky top-0 z-40 border-b border-slate-800 bg-slate-900/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-center py-2">
          <AdBanner id="ad-top-desktop" size="728x90" />
          <AdBanner id="ad-top-mobile" size="320x50" />
        </div>
      </div>

      <PdfToolEngine initialTool={seo.toolId} showAds={false} />

      {/* Sticky bottom ad */}
      <div className="sticky bottom-0 z-40 border-t border-slate-800 bg-slate-900/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-center py-2">
          <AdBanner id="ad-bottom-desktop" size="728x90" />
          <AdBanner id="ad-bottom-mobile" size="320x50" />
        </div>
      </div>
    </div>
  );
}