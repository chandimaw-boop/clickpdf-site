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
        {/* Adsterra 728x90 Banner Options */}
        <script
          type="text/javascript"
          dangerouslySetInnerHTML={{
            __html: `
              atOptions = {
                'key' : '1dd11752bf2ceba9ddd9909d8775aaed',
                'format' : 'iframe',
                'height' : 90,
                'width' : 728,
                'params' : {}
              };
            `,
          }}
        />
        {/* Adsterra 728x90 Banner Script */}
        <Script
          id="adsterra-banner"
          src="https://bauval.org/22/1dd11752bf2ceba9ddd9909d8775aaed"
          strategy="afterInteractive"
        />

        {/* Adsterra Popunder Script */}
        <Script
          id="adsterra-popunder"
          src="https://abscloud.org/1/c88cf487cd8d2bcfaa9e47782ee451bb"
          data-cfasync="false"
          strategy="afterInteractive"
        />

        {/* Adsterra Social Bar Script */}
        <Script
          id="adsterra-socialbar"
          src="https://bauval.org/14/95c55355a71563c1eb4efdc6ec845564"
          data-cfasync="false"
          strategy="afterInteractive"
        />
      </head>
      <body className="min-h-full bg-slate-950 font-sans text-slate-50 antialiased">
        {children}
      </body>
    </html>
  );
}