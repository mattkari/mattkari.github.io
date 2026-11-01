import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });
const display = Playfair_Display({ subsets: ["latin"], variable: "--font-display", display: "swap" });

const SITE_URL = "https://mattkari.github.io";
const GITHUB_URL = "https://github.com/mattkari";
const LINKEDIN_URL = "https://www.linkedin.com/in/mattkari";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Matt Karimov | AI Engineering with Source-Grounded Evidence",
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
  },
  manifest: "/site.webmanifest",
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
    title: "Matt Karimov | AI Engineering with Source-Grounded Evidence",
    description:
      "Banking test automation (API, Kafka, DB, UI) + hands-on LLM engineering: a source-grounded RAG research assistant with page-level citations and honest refusal. PhD, Durham. Presented at ITCC-2026.",
    locale: "en_GB",
  },
  twitter: {
    card: "summary_large_image",
    images: [`${SITE_URL}/og/default.png`],
    title: "Matt Karimov | AI Engineering with Source-Grounded Evidence",
    description:
      "Banking QA + source-grounded RAG with page-level citations and honest refusal. PhD, Durham. ITCC-2026.",
  },
};

export const viewport: Viewport = {
  themeColor: "#020617",
};

const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Matt Karimov",
  url: SITE_URL,
  email: "mailto:mattkarimov@outlook.com",
  jobTitle: "Test Automation Engineer",
  description:
    "Builds source-grounded AI tools for banking test teams. They cite their sources, refuse when the evidence runs out, and prove what they claim.",
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
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} ${display.variable}`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />
        {children}
      </body>
    </html>
  );
}
