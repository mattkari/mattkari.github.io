import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test } from '@playwright/test';
import colors from 'tailwindcss/colors';
import { articles } from '../src/lib/articles';
import { projects } from '../src/lib/projects';
import {
  auditContrast,
  contrast,
  describeFinding,
  EDGE_MIN,
  LARGE_TEXT_MIN,
  over,
  parseColor,
  type Rgb,
  SMALL_TEXT_MIN,
  TEXT_MIN,
} from './contrast';

// ---------------------------------------------------------------------------
// 1. The palette on paper: each pairing the design relies on, with its
//    threshold. The colours are read from where the site defines them, so an
//    edit that drifts one below the line fails here before anyone sees it.
// ---------------------------------------------------------------------------

const root = join(__dirname, '..');
const rgb = (value: string): Rgb => parseColor(value).slice(0, 3) as Rgb;
const tint = (value: string, alpha: number, base: Rgb): Rgb => over([...rgb(value), alpha], base);

/** A custom property from a stylesheet, e.g. `--muted: #94a3b8;`. */
function cssVar(file: string, name: string): string {
  const css = readFileSync(join(root, file), 'utf8');
  const match = css.match(new RegExp(`${name}:\\s*([^;]+);`));
  if (!match) throw new Error(`${name} not found in ${file}`);
  return match[1].replace(/\/\*.*\*\//, '').trim();
}

/** The app keeps its tokens as HSL triples: `--input: 218 30% 22%;`. */
function hslVar(name: string): Rgb {
  const [h, s, l] = cssVar('src/app/globals.css', name).split(/\s+/).map(parseFloat);
  const a = (s / 100) * Math.min(l / 100, 1 - l / 100);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    return 255 * (l / 100 - a * Math.max(-1, Math.min(k - 3, 9 - k, 1)));
  };
  return [f(0), f(8), f(4)];
}

const page = rgb(colors.slate[950]);
const card = tint(colors.slate[900], 0.6, page);
const field = tint(colors.slate[950], 0.6, card);
const gold = rgb(colors.amber[300]);
const article = {
  bg: rgb(cssVar('public/articles/_article.css', '--bg')),
  surface: rgb(cssVar('public/articles/_article.css', '--surface')),
  text: rgb(cssVar('public/articles/_article.css', '--text')),
  strong: rgb(cssVar('public/articles/_article.css', '--text-strong')),
  muted: rgb(cssVar('public/articles/_article.css', '--muted')),
  accent: rgb(cssVar('public/articles/_article.css', '--accent')),
};

const pairings: { name: string; fg: Rgb; bg: Rgb; min: number }[] = [
  // the app
  { name: 'headings (white) on the page', fg: rgb('#ffffff'), bg: page, min: SMALL_TEXT_MIN },
  { name: 'body text (slate-300) on the page', fg: rgb(colors.slate[300]), bg: page, min: SMALL_TEXT_MIN },
  { name: 'body text (slate-300) on a card', fg: rgb(colors.slate[300]), bg: card, min: SMALL_TEXT_MIN },
  { name: 'small muted text (slate-400) on the page', fg: rgb(colors.slate[400]), bg: page, min: SMALL_TEXT_MIN },
  { name: 'small muted text (slate-400) on a card', fg: rgb(colors.slate[400]), bg: card, min: SMALL_TEXT_MIN },
  { name: 'gold links on the page', fg: gold, bg: page, min: SMALL_TEXT_MIN },
  { name: 'gold links on a card', fg: gold, bg: card, min: SMALL_TEXT_MIN },
  { name: 'small gold kickers (80%) on the page', fg: tint(colors.amber[300], 0.8, page), bg: page, min: SMALL_TEXT_MIN },
  { name: 'dark text on a gold button', fg: page, bg: gold, min: SMALL_TEXT_MIN },
  { name: 'italic heading accent (slate-400) on the page', fg: rgb(colors.slate[400]), bg: page, min: LARGE_TEXT_MIN },
  { name: 'typed text (white) in a form field', fg: rgb('#ffffff'), bg: field, min: SMALL_TEXT_MIN },
  { name: 'placeholder text in a form field', fg: hslVar('--muted-foreground'), bg: field, min: SMALL_TEXT_MIN },
  { name: 'edge of a control on the page', fg: hslVar('--input'), bg: page, min: EDGE_MIN },
  { name: 'edge of a control on a card', fg: hslVar('--input'), bg: card, min: EDGE_MIN },
  { name: 'focus ring on the page', fg: hslVar('--ring'), bg: page, min: EDGE_MIN },
  // the articles
  { name: 'article body text', fg: article.text, bg: article.bg, min: SMALL_TEXT_MIN },
  { name: 'article headings', fg: article.strong, bg: article.bg, min: SMALL_TEXT_MIN },
  { name: 'article captions and bylines (muted, 15px)', fg: article.muted, bg: article.bg, min: SMALL_TEXT_MIN },
  { name: 'article links', fg: article.accent, bg: article.bg, min: SMALL_TEXT_MIN },
  { name: 'article table headings on the raised surface', fg: article.strong, bg: article.surface, min: SMALL_TEXT_MIN },
  { name: 'article code on the raised surface', fg: rgb('#e2e8f0'), bg: article.surface, min: SMALL_TEXT_MIN },
];

test.describe('palette pairings', () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'no browser needed, so one run is enough');
  });

  for (const pairing of pairings) {
    test(`${pairing.name} is at least ${pairing.min}:1`, () => {
      expect(contrast(pairing.fg, pairing.bg)).toBeGreaterThanOrEqual(pairing.min);
    });
  }

  test('the articles and the app share one palette', () => {
    expect(article.bg).toEqual(page);
    expect(article.text).toEqual(rgb(colors.slate[300]));
    expect(article.muted).toEqual(rgb(colors.slate[400]));
    expect(article.accent).toEqual(gold);
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

test.describe('contrast on screen', () => {
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
      const result = await auditContrast(browserPage);
      test.info().annotations.push({
        type: 'measured',
        description: `${result.textCount} pieces of text, ${result.controlCount} controls`,
      });
      expect(result.textCount, 'pieces of text measured').toBeGreaterThan(0);
      expect(result.findings.map(describeFinding)).toEqual([]);
    });
  }

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
