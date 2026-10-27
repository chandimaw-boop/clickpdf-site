import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SmartTabunder from "@/components/SmartTabunder";

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
      <body className="min-h-full bg-slate-950 font-sans text-slate-50 antialiased">
        {/* Adsterra Background Smart Tabunder Component එක (උඹේ Adsterra Direct Link එක මෙතනට දාන්න) */}
        <SmartTabunder directLink="https://www.highrevenuegate.com/YOUR_ACTUAL_ADSTERRA_LINK" />

        {children}
      </body>
    </html>
  );
}