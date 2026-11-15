import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test } from '@playwright/test';
import { articles } from '../src/lib/articles';
import { projects } from '../src/lib/projects';
import {
  auditContrast,
  contrast,
  describeFinding,
  EDGE_MIN,
  over,
  parseColor,
  type Rgb,
  SMALL_TEXT_MIN,
} from './contrast';

// ---------------------------------------------------------------------------
// 1. The palette on paper: each pairing the design relies on, with its
//    threshold. The colours are read from where the site defines them, so an
//    edit that drifts one below the line fails here before anyone sees it.
// ---------------------------------------------------------------------------

const root = join(__dirname, '..');
const rgb = (value: string): Rgb => parseColor(value).slice(0, 3) as Rgb;
const mix = (top: Rgb, alpha: number, base: Rgb): Rgb => over([...top, alpha], base);

type Scheme = 'light' | 'dark';
const schemes: Scheme[] = ['light', 'dark'];

/** The custom properties declared in one rule of a stylesheet. */
function block(file: string, opening: string): Record<string, string> {
  const css = readFileSync(join(root, file), 'utf8');
  const start = css.indexOf(opening);
  if (start < 0) throw new Error(`"${opening}" not found in ${file}`);
  const body = css.slice(start + opening.length, css.indexOf('}', start));
  const vars: Record<string, string> = {};
  for (const [, name, value] of body.matchAll(/(--[\w-]+):\s*([^;]+);/g)) vars[name] = value.trim();
  return vars;
}

/** `251 248 243` */
const triple = (value: string): Rgb => value.split(/\s+/).map(Number) as Rgb;

/** `218 30% 22%` */
function hsl(value: string): Rgb {
  const [h, s, l] = value.split(/\s+/).map(parseFloat);
  const a = (s / 100) * Math.min(l / 100, 1 - l / 100);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    return 255 * (l / 100 - a * Math.max(-1, Math.min(k - 3, 9 - k, 1)));
  };
  return [f(0), f(8), f(4)];
}

// Each stylesheet states the dark values twice: for the system setting and for
// the toggle. `forSystem` is only used to check that the two copies agree.
const app = {
  light: block('src/app/globals.css', ':root {'),
  dark: block('src/app/globals.css', ":root[data-theme='dark'] {"),
  forSystem: block('src/app/globals.css', ":root:not([data-theme='light']) {"),
};
const articleCss = {
  light: block('public/articles/_article.css', ':root {'),
  dark: block('public/articles/_article.css', ':root[data-theme="dark"] {'),
  forSystem: block('public/articles/_article.css', ':root:not([data-theme="light"]) {'),
};

function pairings(scheme: Scheme): { name: string; fg: Rgb; bg: Rgb; min: number }[] {
  const t = app[scheme];
  const a = articleCss[scheme];
  const page = triple(t['--page']);
  const card = mix(triple(t['--surface']), 0.6, page);
  const field = mix(page, 0.6, card);
  const fill = triple(t['--brand-fill']);
  return [
    // the app
    { name: 'headings on the page', fg: triple(t['--ink']), bg: page, min: SMALL_TEXT_MIN },
    { name: 'body text on the page', fg: triple(t['--ink-body']), bg: page, min: SMALL_TEXT_MIN },
    { name: 'body text on a card', fg: triple(t['--ink-body']), bg: card, min: SMALL_TEXT_MIN },
    { name: 'small muted text on the page', fg: triple(t['--ink-muted']), bg: page, min: SMALL_TEXT_MIN },
    { name: 'small muted text on a card', fg: triple(t['--ink-muted']), bg: card, min: SMALL_TEXT_MIN },
    { name: 'links on the page', fg: triple(t['--brand']), bg: page, min: SMALL_TEXT_MIN },
    { name: 'links on a card', fg: triple(t['--brand']), bg: card, min: SMALL_TEXT_MIN },
    { name: 'small gold labels on the page', fg: triple(t['--kicker']), bg: page, min: SMALL_TEXT_MIN },
    { name: 'small gold labels on a card', fg: triple(t['--kicker']), bg: card, min: SMALL_TEXT_MIN },
    { name: 'text on a solid button', fg: triple(t['--brand-ink']), bg: fill, min: SMALL_TEXT_MIN },
    { name: 'edge of a solid button on the page', fg: fill, bg: page, min: EDGE_MIN },
    { name: 'typed text in a form field', fg: triple(t['--ink']), bg: field, min: SMALL_TEXT_MIN },
    { name: 'placeholder text in a form field', fg: hsl(t['--muted-foreground']), bg: field, min: SMALL_TEXT_MIN },
    { name: 'edge of a control on the page', fg: hsl(t['--input']), bg: page, min: EDGE_MIN },
    { name: 'edge of a control on a card', fg: hsl(t['--input']), bg: card, min: EDGE_MIN },
    { name: 'focus ring on the page', fg: hsl(t['--ring']), bg: page, min: EDGE_MIN },
    { name: '"message sent" notice', fg: triple(t['--ok']), bg: triple(t['--ok-bg']), min: SMALL_TEXT_MIN },
    { name: '"message not sent" notice', fg: triple(t['--bad']), bg: triple(t['--bad-bg']), min: SMALL_TEXT_MIN },
    { name: '"form unavailable" notice', fg: triple(t['--warn']), bg: triple(t['--warn-bg']), min: SMALL_TEXT_MIN },
    // the articles
    { name: 'article body text', fg: rgb(a['--text']), bg: rgb(a['--bg']), min: SMALL_TEXT_MIN },
    { name: 'article headings', fg: rgb(a['--text-strong']), bg: rgb(a['--bg']), min: SMALL_TEXT_MIN },
    { name: 'article captions and bylines', fg: rgb(a['--muted']), bg: rgb(a['--bg']), min: SMALL_TEXT_MIN },
    { name: 'article links', fg: rgb(a['--accent']), bg: rgb(a['--bg']), min: SMALL_TEXT_MIN },
    { name: 'article table headings on the raised surface', fg: rgb(a['--text-strong']), bg: rgb(a['--surface']), min: SMALL_TEXT_MIN },
    { name: 'article code on the raised surface', fg: rgb(a['--code-text']), bg: rgb(a['--surface']), min: SMALL_TEXT_MIN },
    { name: 'edge of the article theme toggle', fg: rgb(a['--edge']), bg: rgb(a['--bg']), min: EDGE_MIN },
  ];
}

test.describe('palette pairings', () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'no browser needed, so one run is enough');
  });

  for (const scheme of schemes) {
    for (const pairing of pairings(scheme)) {
      test(`${scheme}: ${pairing.name} is at least ${pairing.min}:1`, () => {
        expect(contrast(pairing.fg, pairing.bg)).toBeGreaterThanOrEqual(pairing.min);
      });
    }

    test(`${scheme}: the articles and the app share one palette`, () => {
      const t = app[scheme];
      const a = articleCss[scheme];
      expect(rgb(a['--bg'])).toEqual(triple(t['--page']));
      expect(rgb(a['--text'])).toEqual(triple(t['--ink-body']));
      expect(rgb(a['--muted'])).toEqual(triple(t['--ink-muted']));
      expect(rgb(a['--accent'])).toEqual(triple(t['--brand']));
    });
  }

  test('the dark values for the system setting and for the toggle are the same', () => {
    expect(app.forSystem).toEqual(app.dark);
    expect(articleCss.forSystem).toEqual(articleCss.dark);
  });
});

// ---------------------------------------------------------------------------
// 2. The pages on screen: every piece of text and every control edge, measured
//    in a real browser against the pixels behind it.
// ---------------------------------------------------------------------------

const isLocal = (url: URL) => url.hostname === 'localhost' || url.hostname === '127.0.0.1';
const allPaths = [
  '/',
  '/writing',
  ...projects.map((project) => `/projects/${project.slug}`),
  ...articles.map((item) => `/articles/${item.slug}/`),
  '/no-such-page',
  '/etsy-callback/',
];

for (const scheme of schemes) {
  test.describe(`contrast on screen, ${scheme} theme`, () => {
    test.use({ colorScheme: scheme });

    test.beforeEach(async ({ page: browserPage }) => {
      await browserPage.route(
        (url) => !isLocal(url),
        (route) => route.fulfill({ status: 200, contentType: 'text/css', body: '' }),
      );
    });

    for (const path of allPaths) {
      test(`${path} has no text or control edge below its threshold`, async ({ page: browserPage }) => {
        test.setTimeout(90_000);
        await browserPage.goto(path);
        // the Etsy page has no script: it follows the system setting through CSS alone
        if (path !== '/etsy-callback/') {
          await expect(browserPage.locator('html')).toHaveAttribute('data-theme', scheme);
        }
        const result = await auditContrast(browserPage);
        test.info().annotations.push({
          type: 'measured',
          description: `${result.textCount} pieces of text, ${result.controlCount} controls`,
        });
        expect(result.textCount, 'pieces of text measured').toBeGreaterThan(0);
        expect(result.findings.map(describeFinding)).toEqual([]);
      });
    }
  });
}

test.describe('the audit itself', () => {
  // 3. A check that has never failed proves nothing. Plant text and a field
  //    that are deliberately too faint, and require the audit to report each.
  test('the audit reports faint text and a faint field edge when they are planted', async ({
    page: browserPage,
  }) => {
    // wait until the page has finished starting up, or it may discard the planted nodes
    await browserPage.goto('/', { waitUntil: 'networkidle' });
    await browserPage.evaluate(() => {
      const box = document.createElement('div');
      box.style.cssText = 'padding:24px;background:#020617';
      box.innerHTML = `
        <p id="planted-faint" style="font-size:18px;color:#475569">Deliberately faint body text.</p>
        <p id="planted-small" style="font-size:12px;color:#7c8aa0">Small text that passes 4.5:1 but not 7:1.</p>
        <p id="planted-clear" style="font-size:18px;color:#cbd5e1">Clearly readable text.</p>
        <input id="planted-field" placeholder="" style="width:240px;height:44px;background:#020617;border:1px solid rgba(255,255,255,0.1);border-radius:6px">
        <input id="planted-clear-field" placeholder="" style="width:240px;height:44px;background:#020617;border:1px solid #94a3b8;border-radius:6px">`;
      document.body.append(box);
    });
    await expect(browserPage.locator('#planted-faint')).toBeVisible();

    const { findings } = await auditContrast(browserPage);
    const planted = findings
      .map((f) => ({ kind: f.kind, id: f.where.match(/#(planted-[a-z-]+)/)?.[1] }))
      .filter((f) => f.id)
      .map((f) => `${f.kind} ${f.id}`);
    expect(planted.sort()).toEqual(['edge planted-field', 'text planted-faint', 'text planted-small']);
  });
});
