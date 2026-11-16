import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });
const display = Playfair_Display({ subsets: ["latin"], variable: "--font-display", display: "swap" });

import {
  BING_SITE_VERIFICATION,
  EMAIL,
  GITHUB_URL,
  GOOGLE_SITE_VERIFICATION,
  LINKEDIN_URL,
  SITE_DESCRIPTION,
  SITE_URL,
} from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Matt Karimov | Test Automation Engineer and AI Engineering: RAG, LLM Evaluation, MCP",
  description:
    "Source-grounded AI tools for banking test teams: page-level citations, honest refusal and measured results. Test automation engineer based in Liverpool, UK.",
  keywords: [
    "AI Engineer",
    "LLM Engineering",
    "Source-Grounded RAG",
    "Retrieval-Augmented Generation",
    "Test Automation Engineer",
    "Java",
    "Python",
    "Playwright",
    "Karate",
    "Kafka",
    "Banking QA",
    "Liverpool",
    "North West England",
  ],
  alternates: {
    canonical: SITE_URL,
    types: {
      "application/rss+xml": [{ url: `${SITE_URL}/feed.xml`, title: "Matt Karimov: Writing" }],
    },
  },
  manifest: "/site.webmanifest",
  // Proves ownership to Google Search Console and Bing Webmaster Tools once
  // the codes are filled in (src/lib/site.ts).
  verification: {
    ...(GOOGLE_SITE_VERIFICATION ? { google: GOOGLE_SITE_VERIFICATION } : {}),
    ...(BING_SITE_VERIFICATION ? { other: { "msvalidate.01": BING_SITE_VERIFICATION } } : {}),
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "Matt Karimov — Portfolio",
    images: [
      {
        url: `${SITE_URL}/og/default.png`,
        width: 1200,
        height: 630,
        alt: "Matt Karimov — answers that show their evidence",
      },
    ],
    title: "Matt Karimov | Test Automation Engineer and AI Engineering: RAG, LLM Evaluation, MCP",
    description:
      "Banking test automation (API, Kafka, DB, UI) + hands-on LLM engineering: a source-grounded RAG research assistant with page-level citations and honest refusal. PhD, Durham. Presented at ITCC-2026.",
    locale: "en_GB",
  },
  twitter: {
    card: "summary_large_image",
    images: [`${SITE_URL}/og/default.png`],
    title: "Matt Karimov | Test Automation Engineer and AI Engineering: RAG, LLM Evaluation, MCP",
    description:
      "Banking QA + source-grounded RAG with page-level citations and honest refusal. PhD, Durham. ITCC-2026.",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbf8f3" },
    { media: "(prefers-color-scheme: dark)", color: "#020617" },
  ],
  colorScheme: "light dark",
};

// Inlined into <head> so the theme is settled before the first paint.
const themeInit = readFileSync(join(process.cwd(), "src/lib/theme-init.js"), "utf8");

// Tells search engines what the site is called and who it is by.
const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Matt Karimov",
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  inLanguage: "en-GB",
  author: { "@type": "Person", name: "Matt Karimov", url: SITE_URL },
};

const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Matt Karimov",
  url: SITE_URL,
  image: `${SITE_URL}/images/matt-karimov.jpg`,
  email: `mailto:${EMAIL}`,
  jobTitle: "Test Automation Engineer",
  worksFor: { "@type": "Organization", name: "Barclays Investment Bank" },
  description: SITE_DESCRIPTION,
  address: {
    "@type": "PostalAddress",
    addressLocality: "Liverpool",
    addressCountry: "GB",
  },
  alumniOf: {
    "@type": "CollegeOrUniversity",
    name: "Durham University",
  },
  knowsAbout: [
    "Source-Grounded RAG",
    "LLM Evaluation",
    "Model Context Protocol",
    "AI Quality Assurance",
    "Retrieval-Augmented Generation",
    "Test Automation",
    "API Testing",
    "Kafka",
    "Playwright",
    "Java",
    "Python",
  ],
  sameAs: [GITHUB_URL, LINKEDIN_URL],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // The script below sets data-theme on <html> before React starts, which
    // React would otherwise report as a mismatch.
    <html lang="en-GB" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body className={`${inter.className} ${display.variable}`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />
        {children}
      </body>
    </html>
  );
}
