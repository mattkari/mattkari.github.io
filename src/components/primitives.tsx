import React from 'react';
import { Check } from 'lucide-react';

// Small shared pieces so every page speaks the same design language:
// dark navy, one gold accent, Playfair Display for display type.

export function Kicker({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-4 text-xs font-medium uppercase tracking-[0.35em] text-amber-300/80">{children}</p>
  );
}

export function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-white/15 px-2.5 py-0.5 text-[0.72rem] tracking-wide text-slate-300">
      {children}
    </span>
  );
}

export function CheckItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <Check size={16} aria-hidden="true" className="mt-1 shrink-0 text-amber-300" />
      <span className="text-sm leading-relaxed text-slate-300">{children}</span>
    </li>
  );
}
