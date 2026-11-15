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
| `src/app/projects/[slug]/page.tsx` | One case-study page per project |
| `src/app/not-found.tsx` | The 404 page (GitHub Pages serves it for any unknown address) |
| `src/app/layout.tsx` | Fonts, metadata, Open Graph tags and the JSON-LD person schema |
| `src/lib/articles.ts` | The registry of articles: the one list the home page, the archive, the feed, the sitemap and the scripts read |
| `src/app/sitemap.ts`, `robots.ts`, `feed.xml/route.ts` | Build `/sitemap.xml`, `/robots.txt` and the RSS feed at `/feed.xml` |
| `src/lib/projects.ts` | The registry of projects: the home-page cards and the case-study pages both read it |
| `src/lib/site.ts` | Site URL, profile links and contact email |
| `src/components/` | The writing section, article rows, shared footer and small UI primitives |
| `public/articles/<slug>/index.html` | Each article, as a standalone static HTML page |
| `public/articles/_article.css` | The one stylesheet every article shares |
| `scripts/` | Python helpers that generate the article chrome, OG cards, icons and CV PDF |
| `tests/` | Playwright tests and the small static server they run against |

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
npm run lint     # ESLint with the Next.js rules
npm run build    # static export to ./out
npm test         # browser tests against ./out (build first)
```

## Tests

`tests/site.spec.ts` runs in Playwright against the built site, served the way
GitHub Pages serves it, at a desktop and a phone width. It takes its list of
pages from the article and project registries, so new content is covered
without touching the tests. It checks that:

- every page loads with no console errors, failed requests, broken images or
  sideways scrolling;
- every internal link resolves, including its `#fragment`;
- every article has its page, its social card and a byline that matches the
  registry, and the sitemap and feed list everything;
- the nav highlight, the mobile menu, the 404 page and the case-study links
  behave;
- the contact form validates, confirms a sent message and reports failures.
  The mail service is answered by the tests, so nothing is sent.

### Colour contrast

`tests/contrast.spec.ts` treats colour as a test target, following the method in
the article [A Contrast Audit That Could Not Fail](https://mattkari.github.io/articles/contrast-audit-that-could-not-fail/):

- **Thresholds.** 4.5:1 for text and 3:1 for large text and for the edge of
  anything a person taps or types in (WCAG 2.2). Text under 16px must reach
  7:1: the site is light text on a dark page, and the research finds that
  polarity costs the most at small sizes.
- **The palette on paper.** Each pairing the design relies on is checked, with
  the colours read from `globals.css`, Tailwind and `_article.css`.
- **The pages on screen.** Every piece of text and every control edge on every
  page is measured in the browser against the pixels actually behind it, so
  glows, cards and images are counted.
- **The audit itself.** One test plants faint text and a faint field edge and
  requires the audit to report them. A check that has never failed proves
  nothing.

Decoration marked `aria-hidden` and disabled controls are exempt, as they are
in WCAG.

The form tests need the form enabled, so build with a placeholder key:

```bash
NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY=test-key npm run build && npm test
```

To run all of this on every pull request, copy `tests/ci.workflow.yml` to
`.github/workflows/ci.yml`. It runs the article check, lint, the build and
these tests. To make a failing check block a merge, add a branch protection
rule for `main` in the repository settings and require the "Checks" workflow.

## Adding an article

1. Put the article at `public/articles/<slug>/index.html` (images in an `img/`
   folder beside it).
2. Add its entry to `src/lib/articles.ts`.
3. Run `python3 scripts/apply-article-chrome.py`. It adds the shared header,
   footer and stylesheet, writes the byline (date and reading time) under the
   title, and adds the search-engine metadata, all from the registry entry.
4. Run `python3 scripts/generate-og-images.py` to render its social card.

The sitemap and RSS feed pick the new article up from the registry on the next
build.

## Adding or editing a project

Edit `src/lib/projects.ts`. Each entry feeds both the card on the home page and
the case-study page at `/projects/<slug>`. Every statement in a case study
should be backed by something public or verified, and `source` (shown on the
page) says what that is.

Articles use the same Inter and Playfair Display files as the rest of the site,
served from `public/fonts`. If the fonts in `src/app/layout.tsx` ever change,
run `npm run build` and then `python3 scripts/copy-article-fonts.py` to copy the
new files and rewrite the `@font-face` rules in `_article.css`.

The other two scripts are run only when their source changes:
`scripts/generate-icons.py` (favicon and app icons from `public/icon-master.svg`)
and `scripts/build-cv-pdf.py` (the downloadable CV; keep `CV_VERSION` in the
script and in `src/app/page.tsx` in step).

## Moving to a custom domain

The site address is defined once, in `src/lib/site.ts`. To move the site to a
domain of its own:

1. Register the domain and point it at GitHub Pages, then set it as the custom
   domain under the repository's Settings → Pages. GitHub's guide:
   https://docs.github.com/pages/configuring-a-custom-domain-for-your-github-pages-site
2. Change `SITE_URL` in `src/lib/site.ts`. The metadata, sitemap, feed and
   structured data all follow it.
3. Run `python3 scripts/apply-article-chrome.py`, which rewrites the canonical
   and social-card addresses in every article to the new address.
4. Update the address printed on the social cards and the CV
   (`scripts/generate-og-images.py`, `scripts/build-cv-pdf.py`) and re-run them.
5. `public/etsy-callback/` is the return address of a private Etsy login flow.
   If the domain changes, register the new address with the Etsy app and
   update the address quoted on that page. Do not remove the page while the
   flow is in use.

GitHub redirects the old `mattkari.github.io` addresses to the custom domain.

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
