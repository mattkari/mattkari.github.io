import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

// The slim header used on every page except the home page: the monogram on
// the left and, optionally, one link back to where the reader came from.
export function SubpageHeader({ back }: { back?: { href: string; label: string } }) {
  return (
    <nav aria-label="Primary" className="relative border-b border-line/10">
      <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex min-h-11 items-center space-x-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-brand/50 font-display text-lg text-brand">
            MK
          </span>
          <span className="hidden text-lg font-semibold text-ink sm:block">Matt Karimov</span>
        </Link>
        <div className="flex items-center gap-4">
          {back && (
          <Link
            href={back.href}
            className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-ink-body transition-colors hover:text-brand"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            {back.label}
          </Link>
          )}
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
