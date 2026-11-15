import { Moon, Sun } from 'lucide-react';

// Switches between the light and dark themes. The work is done by the small
// script in <head> (src/lib/theme-init.js), which listens for clicks on any
// [data-theme-toggle]; the stylesheet shows the icon for the theme the button
// switches to, and hides the button if that script has not run.
export function ThemeToggle({ className = '' }: { className?: string }) {
  return (
    <button
      type="button"
      data-theme-toggle
      aria-label="Switch between light and dark theme"
      title="Switch between light and dark theme"
      className={`theme-toggle h-11 w-11 shrink-0 items-center justify-center rounded-full border border-input text-ink-soft transition-colors hover:border-brand/60 hover:text-brand ${className}`}
    >
      <Moon size={18} aria-hidden="true" className="to-dark" />
      <Sun size={18} aria-hidden="true" className="to-light" />
    </button>
  );
}
