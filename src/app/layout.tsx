import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Matt Karimov | AI Engineering with Source-Grounded Evidence",
  description:
    "Test Automation Engineer at Barclays Investment Bank moving into AI engineering. Source-grounded RAG research assistant with page-level citations and honest refusal, presented at ITCC-2026. PhD, Durham University. Based in Manchester.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
