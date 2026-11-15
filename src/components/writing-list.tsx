'use client';

import { useState } from 'react';
import { ArticleRow } from '@/components/article-row';
import { type Article, TOPICS, type Topic } from '@/lib/articles';

// The archive list with one simple filter. There are too few essays for search
// or several filters to earn their place; one row of topics is enough.
export function WritingList({ articles }: { articles: Article[] }) {
  const [topic, setTopic] = useState<Topic | null>(null);
  const shown = topic ? articles.filter((article) => article.topic === topic) : articles;
  const count = (t: Topic) => articles.filter((article) => article.topic === t).length;

  const chip = (label: string, total: number, value: Topic | null) => {
    const active = topic === value;
    return (
      <button
        key={label}
        type="button"
        aria-pressed={active}
        onClick={() => setTopic(value)}
        className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors ${
          active
            ? 'border-brand-fill bg-brand-fill text-brand-ink'
            : 'border-input text-ink-soft hover:border-brand/60 hover:text-brand'
        }`}
      >
        {label}
        <span className={active ? 'text-brand-ink' : 'text-ink-muted'}>{total}</span>
      </button>
    );
  };

  return (
    <>
      <div role="group" aria-label="Filter essays by topic" className="mt-10 flex flex-wrap gap-2.5">
        {chip('All', articles.length, null)}
        {TOPICS.map((t) => chip(t, count(t), t))}
      </div>

      <p aria-live="polite" className="mt-5 text-sm text-ink-muted">
        {topic ? `${shown.length} of ${articles.length} essays, on ${topic}` : `${articles.length} essays, newest first`}
      </p>

      <ul className="mt-4 divide-y divide-line/5 rounded-2xl border border-line/10 bg-surface/60 px-1 py-3 backdrop-blur-sm sm:px-3">
        {shown.map((article, i) => (
          <li key={article.slug}>
            <ArticleRow article={article} index={i} />
          </li>
        ))}
      </ul>
    </>
  );
}
