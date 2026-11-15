import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ArticleRow } from '@/components/article-row';
import { SectionHeading } from '@/components/primitives';
import { formatDate, sortedArticles } from '@/lib/articles';

const SHOWN = 3;

// Home-page Writing section: the latest essays as rows, and one link to the
// archive for the rest. The heading sits beside the rows on wide screens, the
// same two-column rhythm as About and Experience.
export function WritingShowcase() {
  const latest = sortedArticles.slice(0, SHOWN);
  const totalMinutes = sortedArticles.reduce((sum, a) => sum + a.readingMinutes, 0);

  return (
    <section
      id="writing"
      aria-labelledby="writing-heading"
      className="relative overflow-hidden border-t border-line/5 px-4 py-10 sm:px-6 sm:py-14 lg:px-8 scroll-mt-16"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-glow-a/20 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        <div className="grid gap-x-12 gap-y-2 lg:grid-cols-[1fr,2fr]">
          <div>
            <SectionHeading
              id="writing-heading"
              kicker="Journal"
              title="Writing"
              italic="from the workbench"
              sub="Tested, step-by-step essays on AI quality, AI agents and test automation. Everything described was built and measured by me, and the limits are stated."
            />
            <p className="mb-6 text-xs uppercase leading-relaxed tracking-[0.2em] text-ink-muted max-sm:hidden lg:mb-0">
              {sortedArticles.length} essays
              <span aria-hidden="true" className="mx-3 text-ink-faint">
                ◆
              </span>
              {totalMinutes} minutes of reading
              <span aria-hidden="true" className="mx-3 text-ink-faint">
                ◆
              </span>
              Latest {formatDate(latest[0].date)}
            </p>
          </div>

          <div>
            <ul className="divide-y divide-line/5 rounded-2xl border border-line/10 bg-surface/60 px-1 py-1 sm:px-2">
              {latest.map((article, i) => (
                <li key={article.slug}>
                  <ArticleRow article={article} index={i} compact />
                </li>
              ))}
            </ul>
            <Link
              href="/writing"
              className="group mt-4 flex min-h-14 items-center justify-between gap-4 rounded-2xl border border-input bg-line/[0.03] px-5 text-sm font-medium text-brand transition-colors hover:border-brand/40 hover:text-brand-hover sm:px-6"
            >
              All {sortedArticles.length} essays
              <ArrowRight
                size={16}
                aria-hidden="true"
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
