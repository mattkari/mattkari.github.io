import type { Metadata } from 'next';
import { ArrowLeft, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDate, sortedArticles } from '@/lib/articles';

const SITE_URL = 'https://mattkari.github.io';

export const metadata: Metadata = {
  title: 'Writing | Matt Karimov',
  description:
    'Practical, tested guides on AI quality, LLM evaluation, AI agents and test automation by Matt Karimov.',
  alternates: { canonical: `${SITE_URL}/writing` },
  openGraph: {
    type: 'website',
    url: `${SITE_URL}/writing`,
    title: 'Writing | Matt Karimov',
    description: 'Practical, tested guides on AI quality, LLM evaluation, AI agents and test automation.',
    locale: 'en_GB',
  },
};

export default function WritingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-background">
      <nav aria-label="Primary" className="bg-white/95 border-b border-blue-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center space-x-2">
            <span className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
              MK
            </span>
            <span className="font-semibold text-lg text-blue-900 hidden sm:block">Matt Karimov</span>
          </a>
          <a href="/" className="inline-flex items-center gap-2 text-blue-800 hover:text-blue-600 font-medium">
            <ArrowLeft size={18} />
            Home
          </a>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
        <h1 className="text-4xl sm:text-5xl font-bold text-blue-900 mb-4">Writing</h1>
        <p className="text-lg text-blue-800/80 mb-12 max-w-2xl">
          Practical guides from my own projects on AI quality, LLM evaluation, AI agents and test
          automation. Everything described was built and tested by me, and the limits are stated.
        </p>

        <ul className="space-y-6">
          {sortedArticles.map((a) => (
            <li key={a.slug}>
              <a
                href={`/articles/${a.slug}/`}
                className="block bg-white border border-blue-200 rounded-xl p-6 hover:shadow-lg hover:border-blue-400 transition"
              >
                <p className="text-sm text-blue-600 mb-2 flex items-center gap-2">
                  <time dateTime={a.date}>{formatDate(a.date)}</time>
                  <span aria-hidden="true">·</span>
                  <Clock size={14} aria-hidden="true" />
                  {a.readingMinutes} min read
                </p>
                <h2 className="text-xl sm:text-2xl font-semibold text-blue-900 mb-3">{a.title}</h2>
                <p className="text-blue-800 leading-relaxed mb-4">{a.summary}</p>
                <div className="flex flex-wrap gap-2">
                  {a.tags.map((t) => (
                    <Badge key={t} variant="secondary" className="bg-blue-100 text-blue-800 font-normal">
                      {t}
                    </Badge>
                  ))}
                </div>
              </a>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
