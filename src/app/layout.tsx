import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

const SITE_URL = "https://mattkari.github.io";
const GITHUB_URL = "https://github.com/mattkari";
const LINKEDIN_URL = "https://www.linkedin.com/in/mattkari";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Matt Karimov | AI Engineering with Source-Grounded Evidence",
  description:
    "Test Automation Engineer at Barclays Investment Bank moving into AI engineering. Source-grounded RAG research assistant with page-level citations and honest refusal, presented at ITCC-2026. PhD, Durham University. Based in Manchester.",
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
    "Manchester",
  ],
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "Matt Karimov — Portfolio",
    title: "Matt Karimov | AI Engineering with Source-Grounded Evidence",
    description:
      "Banking test automation (API, Kafka, DB, UI) + hands-on LLM engineering: a source-grounded RAG research assistant with page-level citations and honest refusal. PhD, Durham. Presented at ITCC-2026.",
    locale: "en_GB",
  },
  twitter: {
    card: "summary",
    title: "Matt Karimov | AI Engineering with Source-Grounded Evidence",
    description:
      "Banking QA + source-grounded RAG with page-level citations and honest refusal. PhD, Durham. ITCC-2026.",
  },
};

const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Matt Karimov",
  url: SITE_URL,
  email: "mailto:mattkarimov@outlook.com",
  jobTitle: "Test Automation Engineer",
  description:
    "Test Automation Engineer at Barclays Investment Bank moving into AI engineering. Builds source-grounded LLM systems with page-level citations and honest refusal.",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Manchester",
    addressCountry: "GB",
  },
  alumniOf: {
    "@type": "CollegeOrUniversity",
    name: "Durham University",
  },
  knowsAbout: [
    "Source-Grounded RAG",
    "LLM Evaluation",
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
      <body className={inter.className}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />
        {children}
      </body>
    </html>
  );
}
