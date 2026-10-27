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
      <body className="min-h-full bg-slate-950 font-sans text-slate-50 antialiased flex flex-col justify-between">
        
        {/* Top Header Banner Ad Area (Desktop: 728x90 | Mobile: 320x50) */}
        <header className="w-full flex flex-col items-center py-3 bg-slate-900/80 backdrop-blur border-b border-slate-800 sticky top-0 z-50">
          
          {/* Desktop Banner (728x90) */}
          <div className="hidden md:flex flex-col items-center justify-center min-h-[90px]">
            <Script
              id="adsterra-728x90-config"
              strategy="afterInteractive"
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
            <Script
              id="adsterra-728x90-src"
              src="https://bauval.org/22/1dd11752bf2ceba9ddd9909d8775aaed"
              strategy="afterInteractive"
            />
          </div>

          {/* Mobile Banner (320x50) */}
          <div className="flex md:hidden flex-col items-center justify-center min-h-[50px]">
            <Script
              id="adsterra-320x50-config"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  atOptions = {
                    'key' : '8e2718801e3ad6350116ce85f026474c',
                    'format' : 'iframe',
                    'height' : 50,
                    'width' : 320,
                    'params' : {}
                  };
                `,
              }}
            />
            <Script
              id="adsterra-320x50-src"
              src="https://bauval.org/22/8e2718801e3ad6350116ce85f026474c"
              strategy="afterInteractive"
            />
          </div>

        </header>

        {/* Main Content Area */}
        <main className="flex-grow">
          {children}
        </main>

        {/* Bottom Footer Banner Ad Area */}
        <footer className="w-full flex flex-col items-center py-4 bg-slate-900 border-t border-slate-800">
          
          {/* Desktop Footer Ad */}
          <div className="hidden md:flex flex-col items-center justify-center min-h-[90px] mb-2">
            <Script
              id="adsterra-728x90-footer-config"
              strategy="afterInteractive"
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
            <Script
              id="adsterra-728x90-footer-src"
              src="https://bauval.org/22/1dd11752bf2ceba9ddd9909d8775aaed"
              strategy="afterInteractive"
            />
          </div>

          {/* Mobile Footer Ad */}
          <div className="flex md:hidden flex-col items-center justify-center min-h-[50px] mb-2">
            <Script
              id="adsterra-320x50-footer-config"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  atOptions = {
                    'key' : '8e2718801e3ad6350116ce85f026474c',
                    'format' : 'iframe',
                    'height' : 50,
                    'width' : 320,
                    'params' : {}
                  };
                `,
              }}
            />
            <Script
              id="adsterra-320x50-footer-src"
              src="https://bauval.org/22/8e2718801e3ad6350116ce85f026474c"
              strategy="afterInteractive"
            />
          </div>

          <p className="text-xs text-slate-400">© {new Date().getFullYear()} Clickpdf.online - All Rights Reserved.</p>
        </footer>

      </body>
    </html>
  );
}