import type { Metadata } from 'next';
import { SiteFooter } from '@/components/site-footer';
import { SubpageHeader } from '@/components/subpage-header';
import { WritingList } from '@/components/writing-list';
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
    <div className="relative min-h-screen overflow-hidden bg-page">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 -top-40 h-[30rem] w-[30rem] rounded-full bg-glow-a/20 blur-3xl" />
        <div className="absolute -right-32 top-1/2 h-[26rem] w-[26rem] rounded-full bg-glow-b/10 blur-3xl" />
      </div>

      <SubpageHeader back={{ href: '/', label: 'Home' }} />

      <main className="relative mx-auto max-w-4xl px-4 py-20 sm:px-6">
        <p className="mb-4 text-xs font-medium uppercase tracking-[0.35em] text-kicker">Journal</p>
        <h1 className="font-display text-4xl leading-tight text-ink sm:text-6xl">
          Writing <span className="italic text-ink-muted">from the workbench</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-body">
          Practical guides from my own projects on AI quality, LLM evaluation, AI agents and test
          automation. Everything described was built and tested by me, and the limits are stated.
        </p>
        <p className="mt-6 text-xs uppercase tracking-[0.2em] text-ink-muted">
          {sortedArticles.length} essays
          <span aria-hidden="true" className="mx-3 text-ink-faint">
            ◆
          </span>
          {totalMinutes} minutes of reading
          <span aria-hidden="true" className="mx-3 text-ink-faint">
            ◆
          </span>
          Latest {formatDate(sortedArticles[0].date)}
        </p>

        <WritingList articles={sortedArticles} />
      </main>

      <SiteFooter />
    </div>
  );
}
