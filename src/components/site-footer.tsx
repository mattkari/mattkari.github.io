import { Github, Linkedin, Mail, Rss } from 'lucide-react';
import { EMAIL, GITHUB_URL, LINKEDIN_URL } from '@/lib/site';

const linkClass =
  'inline-flex min-h-11 items-center gap-2 transition-colors hover:text-amber-300';

// Shared by the home page, the /writing archive, the case studies and the 404 page.
export function SiteFooter() {
  return (
    <footer className="relative border-t border-white/10 bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-x-10 gap-y-4 lg:flex-row">
          <div className="flex items-center gap-4">
            <span
              aria-hidden="true"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-amber-300/50 font-display text-lg text-amber-300"
            >
              MK
            </span>
            <div>
              <p className="font-display text-lg leading-tight text-white">Matt Karimov</p>
              <p className="mt-0.5 text-sm text-slate-400">Test automation · AI engineering</p>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-x-7 text-sm text-slate-400">
            <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer" className={linkClass}>
              <Linkedin size={15} aria-hidden="true" /> LinkedIn
            </a>
            <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className={linkClass}>
              <Github size={15} aria-hidden="true" /> GitHub
            </a>
            <a href={`mailto:${EMAIL}`} className={linkClass}>
              <Mail size={15} aria-hidden="true" /> {EMAIL}
            </a>
            <a href="/feed.xml" className={linkClass}>
              <Rss size={15} aria-hidden="true" /> RSS
            </a>
          </div>
        </div>
        <p className="mt-6 border-t border-white/10 pt-5 text-center text-xs text-slate-400 lg:text-left">
          © {new Date().getFullYear()} Matt Karimov. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
