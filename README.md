# mattkari.github.io

Personal site for Matt Karimov: a single-page portfolio, a writing archive and
a set of standalone articles. Built with Next.js 15 (static export), React 18,
TypeScript and Tailwind CSS, and published to GitHub Pages.

**Live site:** https://mattkari.github.io

## How it is put together

| Path | What it is |
| --- | --- |
| `src/app/page.tsx` | The home page: hero, about, projects, writing, experience, stack, contact |
| `src/app/writing/page.tsx` | The `/writing` archive, listing every article |
| `src/app/not-found.tsx` | The 404 page (GitHub Pages serves it for any unknown address) |
| `src/app/layout.tsx` | Fonts, metadata, Open Graph tags and the JSON-LD person schema |
| `src/lib/articles.ts` | The registry of articles: the one list the home page, the archive and the OG script read |
| `src/lib/site.ts` | Site URL, profile links and contact email |
| `src/components/` | The writing section, article rows, shared footer and small UI primitives |
| `public/articles/<slug>/index.html` | Each article, as a standalone static HTML page |
| `public/articles/_article.css` | The one stylesheet every article shares |
| `scripts/` | Python helpers that generate the article chrome, OG cards, icons and CV PDF |

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
npm run lint     # ESLint with the Next.js rules
npm run build    # static export to ./out
```

## Adding an article

1. Put the article at `public/articles/<slug>/index.html` (images in an `img/`
   folder beside it).
2. Add its entry to `src/lib/articles.ts`.
3. Run `python3 scripts/apply-article-chrome.py` to give it the shared header,
   footer and stylesheet.
4. Run `python3 scripts/generate-og-images.py` to render its social card.

The other two scripts are run only when their source changes:
`scripts/generate-icons.py` (favicon and app icons from `public/icon-master.svg`)
and `scripts/build-cv-pdf.py` (the downloadable CV; keep `CV_VERSION` in the
script and in `src/app/page.tsx` in step).

## Contact form

The contact form posts directly to [Web3Forms](https://web3forms.com) from the
browser, since the site is a static export with no backend. It needs an access
key, supplied as `NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY`:

- **Locally:** add it to `.env.local` (gitignored).
- **In CI:** stored as the `WEB3FORMS_ACCESS_KEY` repository secret and injected
  at build time by `.github/workflows/nextjs.yml`.

Without the key the form renders in a disabled state pointing at the email
address, rather than silently discarding messages.

## Deployment

Pushes to `main` trigger `.github/workflows/nextjs.yml`, which builds a static
export (`output: 'export'` in `next.config.js`) and publishes it to GitHub Pages.

## License

This project is for demonstration purposes.
