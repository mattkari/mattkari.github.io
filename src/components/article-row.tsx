import { ArrowUpRight } from 'lucide-react';
import { type Article, formatDate } from '@/lib/articles';

// One essay in the dark "journal" list. Shared by the home-page Writing section
// and the /writing archive, so both stay identical. The whole row is the link.
export function ArticleRow({ article, index }: { article: Article; index: number }) {
  return (
    <a
      href={`/articles/${article.slug}/`}
      className="group grid grid-cols-[auto,1fr,auto] items-start gap-4 sm:gap-6 rounded-xl px-3 sm:px-5 py-6 transition-colors duration-300 hover:bg-white/[0.04] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300"
    >
      <span
        aria-hidden="true"
        className="font-display text-2xl sm:text-3xl leading-none text-amber-300/60 tabular-nums transition-colors group-hover:text-amber-300"
      >
        {String(index + 1).padStart(2, '0')}
      </span>

      <div className="min-w-0">
        <p className="mb-2 text-[0.7rem] font-medium uppercase tracking-[0.18em] text-slate-400">
          <time dateTime={article.date}>{formatDate(article.date)}</time>
          <span aria-hidden="true" className="mx-2 text-slate-600">
            /
          </span>
          {article.readingMinutes} min read
        </p>
        <h3 className="font-display text-lg sm:text-xl leading-snug text-white transition-colors group-hover:text-amber-100">
          {article.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-400">{article.summary}</p>
        <ul className="mt-4 flex flex-wrap gap-2" aria-label="Topics">
          {article.tags.map((t) => (
            <li
              key={t}
              className="rounded-full border border-white/10 px-2.5 py-0.5 text-[0.7rem] tracking-wide text-slate-300"
            >
              {t}
            </li>
          ))}
        </ul>
      </div>

      <ArrowUpRight
        aria-hidden="true"
        size={20}
        className="mt-1 text-slate-600 transition duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-amber-300"
      />
    </a>
  );
}
