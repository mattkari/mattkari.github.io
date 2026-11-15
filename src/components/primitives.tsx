import React from 'react';
import { Check } from 'lucide-react';

// Small shared pieces so every page speaks the same design language:
// dark navy, one gold accent, Playfair Display for display type.

export function Kicker({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-4 text-xs font-medium uppercase tracking-[0.35em] text-kicker">{children}</p>
  );
}

export function SectionHeading({
  kicker,
  title,
  italic,
  sub,
  id,
}: {
  kicker: string;
  title: string;
  italic?: string;
  sub?: string;
  id?: string;
}) {
  return (
    <div className="mb-6 max-w-3xl sm:mb-8">
      <Kicker>{kicker}</Kicker>
      <h2 id={id} className="font-display text-3xl leading-tight text-ink sm:text-4xl">
        {title} {italic && <span className="italic text-ink-muted">{italic}</span>}
      </h2>
      <div aria-hidden="true" className="mt-4 h-px w-16 bg-brand/60 sm:mt-5" />
      {sub && <p className="mt-4 leading-relaxed text-ink-body sm:mt-5 sm:text-lg">{sub}</p>}
    </div>
  );
}

export function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-line/15 px-2.5 py-0.5 text-[0.72rem] tracking-wide text-ink-body">
      {children}
    </span>
  );
}

export function CheckItem({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <li className={`flex items-start gap-3 ${className}`}>
      <Check size={16} aria-hidden="true" className="mt-1 shrink-0 text-brand" />
      <span className="text-sm leading-relaxed text-ink-body">{children}</span>
    </li>
  );
}
