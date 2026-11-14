import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

// The slim header used on every page except the home page: the monogram on
// the left and, optionally, one link back to where the reader came from.
export function SubpageHeader({ back }: { back?: { href: string; label: string } }) {
  return (
    <nav aria-label="Primary" className="relative border-b border-white/10">
      <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center space-x-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-amber-300/50 font-display text-lg text-amber-300">
            MK
          </span>
          <span className="hidden text-lg font-semibold text-white sm:block">Matt Karimov</span>
        </Link>
        {back && (
          <Link
            href={back.href}
            className="inline-flex items-center gap-2 py-2 text-sm font-medium text-slate-300 transition-colors hover:text-amber-300"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            {back.label}
          </Link>
        )}
      </div>
    </nav>
  );
}
