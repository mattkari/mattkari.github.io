import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { SiteFooter } from '@/components/site-footer';
import { SubpageHeader } from '@/components/subpage-header';

export const metadata: Metadata = {
  title: 'Page not found | Matt Karimov',
  robots: { index: false },
};

// GitHub Pages serves this (as 404.html) for every unknown address, including
// old or mistyped article links, so it points back to the two useful places.
export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-page">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 -top-40 h-[30rem] w-[30rem] rounded-full bg-glow-a/20 blur-3xl" />
        <div className="absolute -right-32 top-1/2 h-[26rem] w-[26rem] rounded-full bg-glow-b/10 blur-3xl" />
      </div>

      <SubpageHeader />

      <main className="relative mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center px-4 py-24 sm:px-6">
        <p className="mb-4 text-xs font-medium uppercase tracking-[0.35em] text-kicker">
          Error 404
        </p>
        <h1 className="font-display text-4xl leading-tight text-ink sm:text-6xl">
          Page <span className="italic text-ink-muted">not found</span>
        </h1>
        <div aria-hidden="true" className="mt-6 h-px w-16 bg-brand/60" />
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-body">
          Nothing lives at this address. The link may be out of date, or the address may have
          been mistyped.
        </p>
        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center rounded-md bg-brand-fill px-8 text-base font-semibold text-brand-ink transition-colors hover:bg-brand-fill-hover"
          >
            Back to home
          </Link>
          <Link
            href="/writing"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-input px-8 text-base font-medium text-ink transition-colors hover:border-brand/60 hover:bg-line/5"
          >
            Browse the writing
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
