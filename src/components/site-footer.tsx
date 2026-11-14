import { Github, Linkedin, Mail } from 'lucide-react';
import { EMAIL, GITHUB_URL, LINKEDIN_URL } from '@/lib/site';

const linkClass =
  'inline-flex items-center gap-2 py-2 transition-colors hover:text-amber-300';

// Shared by the home page, the /writing archive and the 404 page.
export function SiteFooter() {
  return (
    <footer className="relative border-t border-white/10 bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-6 text-center">
          <span
            aria-hidden="true"
            className="flex h-12 w-12 items-center justify-center rounded-full border border-amber-300/50 font-display text-lg text-amber-300"
          >
            MK
          </span>
          <div>
            <p className="font-display text-xl text-white">Matt Karimov</p>
            <p className="mt-1 text-sm text-slate-400">Test automation · AI engineering</p>
          </div>
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-1 text-sm text-slate-400">
            <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer" className={linkClass}>
              <Linkedin size={15} aria-hidden="true" /> LinkedIn
            </a>
            <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className={linkClass}>
              <Github size={15} aria-hidden="true" /> GitHub
            </a>
            <a href={`mailto:${EMAIL}`} className={linkClass}>
              <Mail size={15} aria-hidden="true" /> {EMAIL}
            </a>
          </div>
          <div className="w-full border-t border-white/10 pt-6">
            <p className="text-xs text-slate-400">
              © {new Date().getFullYear()} Matt Karimov. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
