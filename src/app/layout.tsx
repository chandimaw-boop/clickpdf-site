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

const softwareApplicationJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: SITE_NAME,
  url: SITE_URL,
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Any",
  description: DESCRIPTION,
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How can I remove a password from a PDF online for free with no limit?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Use the free online PDF password remover with no limit on Clickpdf.online. Upload your locked file, enter the password to unlock it, and download the unprotected PDF instantly — no account or file size cap required.",
      },
    },
    {
      "@type": "Question",
      name: "Can I unlock a password protected PDF online fast?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Unlock password protected PDF online fast by uploading your file to Clickpdf.online. The browser-based tool removes the open or owner password in seconds while keeping your document private.",
      },
    },
    {
      "@type": "Question",
      name: "How do I compress a PDF file size under 100KB online?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "To compress PDF file size under 100KB online, upload your PDF to Clickpdf.online and choose the maximum compression level. The tool optimizes images and streams without requiring signup.",
      },
    },
    {
      "@type": "Question",
      name: "Can I merge PDF files free without registration?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, you can merge PDF files free without registration on Clickpdf.online. Drag and drop multiple PDFs, arrange them in order, and download a single combined file in one click.",
      },
    },
    {
      "@type": "Question",
      name: "How do I convert a scanned PDF to an editable Word document for free?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Convert scanned PDF to Word editable free by uploading your scanned file to Clickpdf.online. The OCR engine recognizes the text and produces an editable DOCX you can download at no cost.",
      },
    },
    {
      "@type": "Question",
      name: "Is there an instant image to PDF converter online free?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Clickpdf.online offers an instant image to PDF converter online free. Upload JPG, PNG, or WebP images and turn them into a single, shareable PDF in seconds.",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <head>
        {/* Adsterra Popunder Ad Script */}
        <Script
          id="adsterra-popunder"
          src="https://abscloud.org/1/c88cf487cd8d2bcfaa9e47782ee451bb"
          data-cfasync="false"
          strategy="afterInteractive"
        />

        {/* Adsterra Social Bar Ad Script */}
        <Script
          id="adsterra-socialbar"
          src="https://bauval.org/14/95c55355a71563c1eb4efdc6ec845564"
          data-cfasync="false"
          strategy="afterInteractive"
        />
      </head>
      <body className="min-h-full bg-slate-950 font-sans text-slate-50 antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(softwareApplicationJsonLd).replace(
              /</g,
              "\\u003c"
            ),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c"),
          }}
        />
        {children}
      </body>
    </html>
  );
}