'use client';

import { ArrowRight, ChevronDown } from 'lucide-react';
import { ArticleRow } from '@/components/article-row';
import { formatDate, sortedArticles } from '@/lib/articles';

// Home-page Writing section: a featured latest essay, then a collapsible,
// scrollable list of every essay. `open` lives in the page so the nav's
// "Writing" link can expand the list as it scrolls here.
export function WritingShowcase({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  const latest = sortedArticles[0];
  const totalMinutes = sortedArticles.reduce((sum, a) => sum + a.readingMinutes, 0);

  return (
    <section
      id="writing"
      aria-labelledby="writing-heading"
      className="relative overflow-hidden bg-slate-950 px-4 py-24 sm:px-6 lg:px-8 scroll-mt-16"
    >
      {/* Decorative light: a hairline at the top and two soft glows */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-300/50 to-transparent" />
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-24 h-[28rem] w-[28rem] rounded-full bg-amber-400/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-5xl">
        <header className="mb-12 max-w-3xl">
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.35em] text-amber-300/80">
            Journal
          </p>
          <h2 id="writing-heading" className="font-display text-4xl leading-tight text-white sm:text-5xl">
            Writing <span className="italic text-slate-400">from the workbench</span>
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-slate-300">
            Tested, step-by-step essays on AI quality, AI agents and test automation. Everything
            described was built and measured by me, and the limits are stated.
          </p>
          <p className="mt-6 text-xs uppercase tracking-[0.2em] text-slate-500">
            {sortedArticles.length} essays
            <span aria-hidden="true" className="mx-3 text-slate-700">
              ◆
            </span>
            {totalMinutes} minutes of reading
            <span aria-hidden="true" className="mx-3 text-slate-700">
              ◆
            </span>
            Latest {formatDate(latest.date)}
          </p>
        </header>

        {/* Featured: the latest essay, with a thin gold-to-blue frame */}
        <a
          href={`/articles/${latest.slug}/`}
          className="group block rounded-2xl bg-gradient-to-br from-amber-300/50 via-white/10 to-blue-500/50 p-px transition-shadow duration-500 hover:shadow-[0_0_60px_-12px_rgba(251,191,36,0.35)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-300"
        >
          <div className="rounded-2xl bg-slate-900/95 p-7 sm:p-10">
            <p className="mb-4 flex flex-wrap items-center gap-3 text-[0.7rem] font-medium uppercase tracking-[0.2em]">
              <span className="rounded-full bg-amber-300 px-3 py-1 text-slate-950">Latest</span>
              <span className="text-slate-400">
                <time dateTime={latest.date}>{formatDate(latest.date)}</time> / {latest.readingMinutes} min
                read
              </span>
            </p>
            <h3 className="font-display text-2xl leading-snug text-white transition-colors group-hover:text-amber-100 sm:text-3xl">
              {latest.title}
            </h3>
            <p className="mt-4 max-w-3xl leading-relaxed text-slate-300">{latest.summary}</p>
            <span className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-amber-300">
              Read the essay
              <ArrowRight
                size={16}
                aria-hidden="true"
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </span>
          </div>
        </a>

        {/* Toggle for the full list */}
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls="writing-list"
          className="group mt-6 flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-5 text-left transition-colors duration-300 hover:border-amber-300/40 hover:bg-white/[0.06] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300"
        >
          <span>
            <span className="block font-display text-xl text-white">
              {open ? 'Hide the essays' : `Browse all ${sortedArticles.length} essays`}
            </span>
            <span className="mt-1 block text-sm text-slate-400">
              {open ? 'Scroll the list, then choose one to read' : 'Open the full list'}
            </span>
          </span>
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/15 text-amber-300 transition-colors group-hover:border-amber-300/60">
            <ChevronDown
              size={20}
              aria-hidden="true"
              className={`transition-transform duration-500 ${open ? 'rotate-180' : ''}`}
            />
          </span>
        </button>

        {/* Collapsible, scrollable list. The grid-rows trick animates height;
            visibility keeps hidden links out of the tab order when closed. */}
        <div
          id="writing-list"
          role="region"
          aria-label="All essays"
          className={`grid transition-[grid-template-rows,opacity,visibility] duration-500 ease-out motion-reduce:transition-none ${
            open ? 'visible grid-rows-[1fr] opacity-100' : 'invisible grid-rows-[0fr] opacity-0'
          }`}
        >
          <div className="overflow-hidden">
            <div className="mt-4 rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-sm">
              <ul className="writing-scroll fade-y max-h-[34rem] divide-y divide-white/5 overflow-y-auto overscroll-contain px-1 py-3 sm:px-3">
                {sortedArticles.map((a, i) => (
                  <li key={a.slug}>
                    <ArticleRow article={a} index={i} />
                  </li>
                ))}
              </ul>
              <div className="flex items-center justify-between border-t border-white/10 px-6 py-4 text-sm">
                <span className="text-slate-500">Newest first</span>
                <a
                  href="/writing"
                  className="inline-flex items-center gap-2 font-medium text-amber-300 hover:text-amber-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-300"
                >
                  Open the archive page
                  <ArrowRight size={16} aria-hidden="true" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
