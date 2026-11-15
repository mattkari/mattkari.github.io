// One frame for every project image: a dark window with a title bar, set on a
// dark matte, holding a 2:1 crop. It gives light and dark captures the same
// outline, so a bright page no longer breaks the dark card grid.
export function ScreenshotFrame({ src, alt, label }: { src: string; alt: string; label: string }) {
  return (
    <div className="border-b border-white/10 bg-slate-950/70 px-4 pt-4 sm:px-5 sm:pt-5">
      <div className="overflow-hidden rounded-t-lg border border-b-0 border-white/10 bg-slate-900">
        <div className="flex h-8 items-center gap-1.5 border-b border-white/10 px-3">
          <span aria-hidden="true" className="h-2 w-2 rounded-full bg-slate-600" />
          <span aria-hidden="true" className="h-2 w-2 rounded-full bg-slate-600" />
          <span aria-hidden="true" className="h-2 w-2 rounded-full bg-slate-600" />
          <span className="ml-2 truncate text-[0.7rem] tracking-wide text-slate-300">{label}</span>
        </div>
        <div className="overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            width={1400}
            height={700}
            loading="lazy"
            className="aspect-[2/1] w-full object-cover object-top transition-transform duration-700 group-hover:scale-[1.02]"
          />
        </div>
      </div>
    </div>
  );
}
