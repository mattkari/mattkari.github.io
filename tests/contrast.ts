// A contrast audit that measures what is on the screen, not what is on a
// colour list. It follows the method in the article "A Contrast Audit That
// Could Not Fail" (/articles/contrast-audit-that-could-not-fail/):
//
//   1. decide the thresholds from the evidence,
//   2. measure every piece of text against the background it actually sits on,
//   3. make each rule a test, and
//   4. prove the audit can see a failure before trusting its silence.
//
// The background is read from rendered pixels (a screenshot with the text made
// transparent), so glows, panels and images behind text are all counted.

import type { Page } from '@playwright/test';
import { PNG } from 'pngjs';

// ---------------------------------------------------------------------------
// Thresholds
// ---------------------------------------------------------------------------

/** WCAG 2.2 minimum for normal text. */
export const TEXT_MIN = 4.5;
/** WCAG 2.2 minimum for large text (24px, or 18.66px bold). */
export const LARGE_TEXT_MIN = 3;
/** WCAG 2.2 minimum for the edge of a control, such as a form field. */
export const EDGE_MIN = 3;
/**
 * This site is light text on a dark page. The research the article cites finds
 * that polarity costs the most at small sizes, so small text is held to the
 * stricter WCAG level instead of the minimum.
 */
export const SMALL_TEXT_MIN = 7;
export const SMALL_TEXT_BELOW_PX = 16;

export function requiredRatio(fontSizePx: number, fontWeight: number): number {
  if (fontSizePx >= 24 || (fontSizePx >= 18.66 && fontWeight >= 700)) return LARGE_TEXT_MIN;
  if (fontSizePx < SMALL_TEXT_BELOW_PX) return SMALL_TEXT_MIN;
  return TEXT_MIN;
}

// ---------------------------------------------------------------------------
// Colour maths
// ---------------------------------------------------------------------------

export type Rgb = [number, number, number];
export type Rgba = [number, number, number, number];

export function parseColor(value: string): Rgba {
  const hex = value.trim().match(/^#([0-9a-f]{3,8})$/i);
  if (hex) {
    let h = hex[1];
    if (h.length <= 4) h = [...h].map((c) => c + c).join('');
    const n = (i: number) => parseInt(h.slice(i, i + 2), 16);
    return [n(0), n(2), n(4), h.length === 8 ? n(6) / 255 : 1];
  }
  const parts = value.match(/[\d.]+%?/g);
  if (!parts || parts.length < 3) throw new Error(`cannot read colour "${value}"`);
  const num = (part: string) => parseFloat(part);
  const alpha = parts[3] === undefined ? 1 : parts[3].endsWith('%') ? num(parts[3]) / 100 : num(parts[3]);
  return [num(parts[0]), num(parts[1]), num(parts[2]), alpha];
}

/** Lay a colour with some transparency over an opaque one. */
export function over(top: Rgba, bottom: Rgb): Rgb {
  const a = top[3];
  return [0, 1, 2].map((i) => top[i] * a + bottom[i] * (1 - a)) as Rgb;
}

export function luminance([r, g, b]: Rgb | Rgba): number {
  const channel = (v: number) => {
    const s = v / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

export function contrast(a: Rgb | Rgba, b: Rgb | Rgba): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const toHex = (c: Rgb) => '#' + c.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');

// ---------------------------------------------------------------------------
// What the browser reports
// ---------------------------------------------------------------------------

type Rect = { x: number; y: number; w: number; h: number };

type TextSample = {
  text: string;
  where: string;
  color: string;
  opacity: number;
  fontSize: number;
  fontWeight: number;
  rects: Rect[];
};

type ControlSample = {
  where: string;
  rect: Rect;
  hasBorder: boolean;
  /** It paints its own background, so its fill is what marks its edge. */
  hasFill: boolean;
};

export type Finding = {
  kind: 'text' | 'placeholder' | 'edge';
  where: string;
  text: string;
  ratio: number;
  required: number;
  detail: string;
};

/** Runs in the page: every visible piece of text, with where its glyphs sit. */
function collect(): { texts: TextSample[]; placeholders: TextSample[]; controls: ControlSample[]; height: number } {
  const describe = (el: Element) => {
    const id = el.id ? `#${el.id}` : '';
    const cls =
      typeof el.className === 'string' && el.className ? '.' + el.className.split(/\s+/).slice(0, 2).join('.') : '';
    const section = el.closest('section[id], nav, header, footer, article, main');
    const place = section ? `${section.tagName.toLowerCase()}${section.id ? '#' + section.id : ''} ` : '';
    return `${place}${el.tagName.toLowerCase()}${id}${cls}`.slice(0, 90);
  };

  // The part of the page an element may paint in: clipped by every ancestor
  // that hides its overflow (line clamps, collapsed panels, rounded cards).
  const clipOf = (el: Element) => {
    let box = { l: -Infinity, t: -Infinity, r: Infinity, b: Infinity };
    for (let p: Element | null = el; p && p !== document.documentElement; p = p.parentElement) {
      const style = getComputedStyle(p);
      if (style.overflowX !== 'visible' || style.overflowY !== 'visible') {
        const r = p.getBoundingClientRect();
        box = {
          l: Math.max(box.l, r.left),
          t: Math.max(box.t, r.top),
          r: Math.min(box.r, r.right),
          b: Math.min(box.b, r.bottom),
        };
      }
    }
    return box;
  };

  const opacityOf = (el: Element) => {
    let value = 1;
    for (let p: Element | null = el; p; p = p.parentElement) value *= parseFloat(getComputedStyle(p).opacity);
    return value;
  };

  const skipped = (el: Element) =>
    // decoration by declaration, text a control cannot be used through, and non-text
    el.closest('[aria-hidden="true"], :disabled, svg, script, style, noscript, template') !== null;

  const byElement = new Map<Element, Rect[]>();
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const range = document.createRange();
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (!node.nodeValue || !node.nodeValue.trim()) continue;
    const el = node.parentElement;
    if (!el || skipped(el)) continue;
    const style = getComputedStyle(el);
    if (style.visibility !== 'visible') continue;
    const clip = clipOf(el);
    range.selectNodeContents(node);
    for (const r of Array.from(range.getClientRects())) {
      const l = Math.max(r.left, clip.l);
      const t = Math.max(r.top, clip.t);
      const w = Math.min(r.right, clip.r) - l;
      const h = Math.min(r.bottom, clip.b) - t;
      // visually hidden text (the skip link) is a 1px box
      if (w < 2 || h < 2) continue;
      const list = byElement.get(el) ?? [];
      list.push({ x: l + window.scrollX, y: t + window.scrollY, w, h });
      byElement.set(el, list);
    }
  }

  const texts: TextSample[] = [];
  for (const [el, rects] of byElement) {
    const style = getComputedStyle(el);
    const opacity = opacityOf(el);
    if (opacity < 0.02) continue;
    texts.push({
      text: (el.textContent ?? '').trim().replace(/\s+/g, ' ').slice(0, 60),
      where: describe(el),
      color: style.color,
      opacity,
      fontSize: parseFloat(style.fontSize),
      fontWeight: parseInt(style.fontWeight, 10) || 400,
      rects,
    });
  }

  const placeholders: TextSample[] = [];
  for (const el of Array.from(document.querySelectorAll<HTMLInputElement>('input[placeholder], textarea[placeholder]'))) {
    if (skipped(el) || !el.checkVisibility() || el.value) continue;
    const style = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    const padX = parseFloat(style.paddingLeft) + 1;
    const padY = parseFloat(style.paddingTop) + 1;
    placeholders.push({
      text: el.placeholder,
      where: describe(el),
      color: getComputedStyle(el, '::placeholder').color,
      opacity: opacityOf(el),
      fontSize: parseFloat(style.fontSize),
      fontWeight: 400,
      rects: [{ x: r.left + padX + window.scrollX, y: r.top + padY + window.scrollY, w: r.width - 2 * padX, h: Math.min(r.height - 2 * padY, 24) }],
    });
  }

  // Anything a person taps that draws its own box.
  const controls: ControlSample[] = [];
  for (const el of Array.from(document.querySelectorAll('input, textarea, select, button, summary, a[href]'))) {
    if (skipped(el) || !(el as HTMLElement).checkVisibility()) continue;
    const style = getComputedStyle(el);
    if (style.visibility !== 'visible' || opacityOf(el) < 0.02) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 8 || r.height < 8) continue;
    const hasBorder =
      style.borderTopStyle !== 'none' && parseFloat(style.borderTopWidth) > 0 && !/, 0\)$/.test(style.borderTopColor);
    const hasFill = !/, 0\)$/.test(style.backgroundColor) && style.backgroundColor !== 'transparent';
    controls.push({
      where: describe(el),
      rect: { x: r.left + window.scrollX, y: r.top + window.scrollY, w: r.width, h: r.height },
      hasBorder,
      hasFill,
    });
  }

  return { texts, placeholders, controls, height: document.documentElement.scrollHeight };
}

// ---------------------------------------------------------------------------
// The audit
// ---------------------------------------------------------------------------

const PREPARE = `
  html { scroll-behavior: auto !important; }
  *, *::before, *::after { transition: none !important; animation: none !important; }
  /* a sticky header would cover whatever scrolls under it */
  nav[aria-label="Primary"], .site-header { position: static !important; }
  /* so would the floating "Back to top" button: put it in the flow, always
     shown, so that it is measured once and covers nothing */
  .to-top { position: static !important; display: inline-flex !important; }
`;

// Everything that is text or drawn in the text colour disappears, leaving
// only what the text sits on.
const HIDE_TEXT = `
  *, *::before, *::after, ::marker, ::placeholder {
    color: transparent !important;
    -webkit-text-fill-color: transparent !important;
    text-decoration-color: transparent !important;
    text-shadow: none !important;
    caret-color: transparent !important;
  }
`;

type Shot = { top: number; png: PNG };

function pixel(shots: Shot[], x: number, y: number): Rgb | null {
  const shot = shots.find((s) => y >= s.top && y < s.top + s.png.height);
  if (!shot) return null;
  const px = Math.round(x);
  const py = Math.round(y - shot.top);
  if (px < 0 || px >= shot.png.width || py < 0 || py >= shot.png.height) return null;
  const i = (py * shot.png.width + px) * 4;
  return [shot.png.data[i], shot.png.data[i + 1], shot.png.data[i + 2]];
}

/**
 * The backgrounds a piece of text sits on: every colour that covers at least
 * 5% of the area behind it. Ignoring thinner slivers keeps colour emoji, which
 * cannot be made transparent, from being read as background.
 */
function backgrounds(shots: Shot[], rects: Rect[]): Rgb[] {
  const counts = new Map<string, { color: Rgb; n: number }>();
  let total = 0;
  for (const r of rects) {
    const stepX = Math.max(1, Math.floor(r.w / 40));
    const stepY = Math.max(1, Math.floor(r.h / 8));
    for (let y = r.y + 1; y < r.y + r.h - 1; y += stepY) {
      for (let x = r.x + 1; x < r.x + r.w - 1; x += stepX) {
        const c = pixel(shots, x, y);
        if (!c) continue;
        // group near-identical shades so a soft gradient counts as one surface
        const key = c.map((v) => v >> 3).join(',');
        const entry = counts.get(key) ?? { color: c, n: 0 };
        entry.n += 1;
        counts.set(key, entry);
        total += 1;
      }
    }
  }
  return [...counts.values()].filter((entry) => entry.n / total >= 0.05).map((entry) => entry.color);
}

async function capture(page: Page, height: number): Promise<Shot[]> {
  const viewport = page.viewportSize()!;
  const shots: Shot[] = [];
  for (let top = 0; top < height; top += viewport.height) {
    // the last step cannot scroll a full viewport, so read back where it landed
    const landed = await page.evaluate((y) => {
      window.scrollTo(0, y);
      return window.scrollY;
    }, top);
    shots.push({ top: landed, png: PNG.sync.read(await page.screenshot()) });
  }
  return shots;
}

export type AuditResult = { findings: Finding[]; textCount: number; controlCount: number };

export async function auditContrast(page: Page): Promise<AuditResult> {
  await page.addStyleTag({ content: PREPARE });
  // bring lazy images in, so nothing moves after the measurements are taken
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 600) {
      window.scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 20));
    }
    window.scrollTo(0, 0);
    await document.fonts.ready;
  });
  await page.waitForFunction(() => Array.from(document.images).every((image) => image.complete));

  const { texts, placeholders, controls, height } = await page.evaluate(collect);

  const hide = await page.addStyleTag({ content: HIDE_TEXT });
  const shots = await capture(page, height);
  await hide.evaluate((style) => (style as HTMLStyleElement).remove());
  await page.evaluate(() => window.scrollTo(0, 0));

  const findings: Finding[] = [];

  const measure = (kind: 'text' | 'placeholder', sample: TextSample) => {
    const [r, g, b, a] = parseColor(sample.color);
    const required = requiredRatio(sample.fontSize, sample.fontWeight);
    let worst = Infinity;
    let worstBg: Rgb | null = null;
    for (const bg of backgrounds(shots, sample.rects)) {
      const ratio = contrast(over([r, g, b, a * sample.opacity], bg), bg);
      if (ratio < worst) [worst, worstBg] = [ratio, bg];
    }
    if (worstBg && worst < required) {
      findings.push({
        kind,
        where: sample.where,
        text: sample.text,
        ratio: Math.round(worst * 100) / 100,
        required,
        detail: `${sample.fontSize}px text ${sample.color} on ${toHex(worstBg)}`,
      });
    }
  };
  texts.forEach((sample) => measure('text', sample));
  placeholders.forEach((sample) => measure('placeholder', sample));

  // A control's edge is compared with what lies just outside it. A control
  // with a border is read at the border; one that paints its own fill is read
  // just inside. A plain text link has no edge, so there is nothing to read.
  for (const control of controls) {
    if (!control.hasBorder && !control.hasFill) continue;
    const { x, y, w, h } = control.rect;
    const probes = [
      { edge: [x + w / 2, y] as const, inward: [0, 1] as const },
      { edge: [x + w / 2, y + h - 1] as const, inward: [0, -1] as const },
      { edge: [x, y + h / 2] as const, inward: [1, 0] as const },
      { edge: [x + w - 1, y + h / 2] as const, inward: [-1, 0] as const },
    ];
    let best = 0;
    let bestDetail = '';
    let measured = 0;
    for (const { edge, inward } of probes) {
      const outside = pixel(shots, edge[0] - inward[0] * 4, edge[1] - inward[1] * 4);
      const inside = pixel(shots, edge[0] + inward[0] * 6, edge[1] + inward[1] * 6);
      if (!outside || !inside) continue;
      measured += 1;
      // a 1px border can straddle two device pixels, so read both
      const candidates = control.hasBorder
        ? [pixel(shots, edge[0], edge[1]), pixel(shots, edge[0] + inward[0], edge[1] + inward[1])]
        : [inside];
      for (const c of candidates) {
        if (!c) continue;
        const ratio = contrast(c, outside);
        if (ratio > best) [best, bestDetail] = [ratio, `edge ${toHex(c)} against ${toHex(outside)}`];
      }
    }
    if (measured === 0) continue;
    if (best < EDGE_MIN) {
      findings.push({
        kind: 'edge',
        where: control.where,
        text: '',
        ratio: Math.round(best * 100) / 100,
        required: EDGE_MIN,
        detail: bestDetail,
      });
    }
  }

  return { findings, textCount: texts.length + placeholders.length, controlCount: controls.length };
}

export const describeFinding = (f: Finding) =>
  `${f.kind} ${f.ratio}:1 (needs ${f.required}:1) ${f.where}${f.text ? ` "${f.text}"` : ''} [${f.detail}]`;
