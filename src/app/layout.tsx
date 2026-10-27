import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const SITE_URL = "https://clickpdf.online";
const SITE_NAME = "Clickpdf.online";

const TITLE =
  "Clickpdf.online - Free Online PDF Password Remover No Limit & Fast Converter";
const DESCRIPTION =
  "Unlock password protected PDF online fast, compress PDF under 100KB, merge files without registration, and convert image to PDF instantly for free.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "free online pdf password remover no limit",
    "unlock password protected pdf online fast",
    "compress pdf file size under 100kb online",
    "merge pdf files free without registration",
    "convert scanned pdf to word editable free",
    "instant image to pdf converter online free",
  ],
  applicationName: SITE_NAME,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <head>
        {/* Adsterra Social Bar Code (User Friendly + High CPM) */}
        <Script
          id="adsterra-social-bar"
          src="//www.highperformanceformat.com/YOUR_SOCIAL_BAR_KEY/invoke.js"
          strategy="afterInteractive"
        />
      </head>
      <body className="min-h-full bg-slate-950 font-sans text-slate-50 antialiased">
        {/* Top Native Banner Container */}
        <div className="w-full flex justify-center py-2 bg-slate-900 border-b border-slate-800">
          <div id="container-adsterra-top">
            {/* Adsterra 728x90 Banner Code එක මෙතනට */}
          </div>
        </div>

        {children}

        {/* Bottom Banner Container */}
        <div className="w-full flex justify-center py-2 bg-slate-900 border-t border-slate-800">
          <div id="container-adsterra-bottom">
            {/* Adsterra 320x50 Banner Code එක මෙතනට */}
          </div>
        </div>
      </body>
    </html>
  );
}