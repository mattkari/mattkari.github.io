import type { Metadata } from 'next';
import { ArticleRow } from '@/components/article-row';
import { SiteFooter } from '@/components/site-footer';
import { SubpageHeader } from '@/components/subpage-header';
import { formatDate, sortedArticles } from '@/lib/articles';
import { SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Writing | Matt Karimov',
  description:
    'Practical, tested guides on AI quality, LLM evaluation, AI agents and test automation by Matt Karimov.',
  alternates: {
    canonical: `${SITE_URL}/writing`,
    types: {
      'application/rss+xml': [{ url: `${SITE_URL}/feed.xml`, title: 'Matt Karimov: Writing' }],
    },
  },
  openGraph: {
    type: 'website',
    url: `${SITE_URL}/writing`,
    title: 'Writing | Matt Karimov',
    description: 'Practical, tested guides on AI quality, LLM evaluation, AI agents and test automation.',
    locale: 'en_GB',
    images: [
      {
        url: `${SITE_URL}/og/default.png`,
        width: 1200,
        height: 630,
        alt: 'Matt Karimov — answers that show their evidence',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Writing | Matt Karimov',
    description: 'Practical, tested guides on AI quality, LLM evaluation, AI agents and test automation.',
    images: [`${SITE_URL}/og/default.png`],
  },
};

export default function WritingPage() {
  const totalMinutes = sortedArticles.reduce((sum, a) => sum + a.readingMinutes, 0);

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 -top-40 h-[30rem] w-[30rem] rounded-full bg-blue-600/20 blur-3xl" />
        <div className="absolute -right-32 top-1/2 h-[26rem] w-[26rem] rounded-full bg-amber-400/10 blur-3xl" />
      </div>

      <SubpageHeader back={{ href: '/', label: 'Home' }} />

      <main className="relative mx-auto max-w-4xl px-4 py-20 sm:px-6">
        <p className="mb-4 text-xs font-medium uppercase tracking-[0.35em] text-amber-300/80">Journal</p>
        <h1 className="font-display text-4xl leading-tight text-white sm:text-6xl">
          Writing <span className="italic text-slate-400">from the workbench</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-300">
          Practical guides from my own projects on AI quality, LLM evaluation, AI agents and test
          automation. Everything described was built and tested by me, and the limits are stated.
        </p>
        <p className="mt-6 text-xs uppercase tracking-[0.2em] text-slate-400">
          {sortedArticles.length} essays
          <span aria-hidden="true" className="mx-3 text-slate-700">
            ◆
          </span>
          {totalMinutes} minutes of reading
          <span aria-hidden="true" className="mx-3 text-slate-700">
            ◆
          </span>
          Latest {formatDate(sortedArticles[0].date)}
        </p>

        <ul className="mt-14 divide-y divide-white/5 rounded-2xl border border-white/10 bg-slate-900/60 px-1 py-3 backdrop-blur-sm sm:px-3">
          {sortedArticles.map((a, i) => (
            <li key={a.slug}>
              <ArticleRow article={a} index={i} />
            </li>
          ))}
        </ul>
      </main>

      <SiteFooter />
    </div>
  );
}
