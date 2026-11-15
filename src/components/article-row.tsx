import { ArrowUpRight } from 'lucide-react';
import { type Article, formatDate } from '@/lib/articles';

// One essay in the dark "journal" list. Shared by the home-page Writing section
// and the /writing archive, so both stay identical. The whole row is the link.
//
// `compact` is for the short list on the home page: it tightens the row and,
// on phones, leaves the topic tags to the article itself.
export function ArticleRow({
  article,
  index,
  compact = false,
}: {
  article: Article;
  index: number;
  compact?: boolean;
}) {
  return (
    <a
      href={`/articles/${article.slug}/`}
      className={`group grid grid-cols-[auto,1fr,auto] items-start gap-4 sm:gap-6 rounded-xl px-3 sm:px-5 ${
        compact ? 'py-4 sm:py-5' : 'py-6'
      } transition-colors duration-300 hover:bg-line/[0.04] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand`}
    >
      <span
        aria-hidden="true"
        className="font-display text-2xl sm:text-3xl leading-none text-brand/60 tabular-nums transition-colors group-hover:text-brand"
      >
        {String(index + 1).padStart(2, '0')}
      </span>

      <div className="min-w-0">
        <p className="mb-2 text-[0.7rem] font-medium uppercase tracking-[0.18em] text-ink-body">
          <time dateTime={article.date}>{formatDate(article.date)}</time>
          <span aria-hidden="true" className="mx-2 text-ink-faint">
            /
          </span>
          {article.readingMinutes} min read
        </p>
        <h3 className="font-display text-lg sm:text-xl leading-snug text-ink transition-colors group-hover:text-ink-hover">
          {article.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink-muted">{article.summary}</p>
        <ul
          className={`flex flex-wrap gap-2 ${compact ? 'mt-3 max-sm:hidden' : 'mt-4'}`}
          aria-label="Topics"
        >
          {article.tags.map((t) => (
            <li
              key={t}
              className="rounded-full border border-line/10 px-2.5 py-0.5 text-[0.7rem] tracking-wide text-ink-body"
            >
              {t}
            </li>
          ))}
        </ul>
      </div>

      <ArrowUpRight
        aria-hidden="true"
        size={20}
        className="mt-1 text-ink-faint transition duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand"
      />
    </a>
  );
}
