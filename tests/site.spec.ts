import { expect, test, type Page } from '@playwright/test';
import { articles, formatDate } from '../src/lib/articles';
import { projects } from '../src/lib/projects';
import { SITE_URL } from '../src/lib/site';

// Every address the site publishes, taken from the same registries the site
// itself is built from, so a new article or project is covered automatically.
const articlePaths = articles.map((article) => `/articles/${article.slug}/`);
const projectPaths = projects.map((project) => `/projects/${project.slug}`);
const allPaths = ['/', '/writing', ...projectPaths, ...articlePaths];

const isLocal = (url: URL) => url.hostname === 'localhost' || url.hostname === '127.0.0.1';

test.beforeEach(async ({ page }) => {
  // Nothing leaves the machine: third-party requests (web fonts) get an empty reply.
  await page.route(
    (url) => !isLocal(url),
    (route) => route.fulfill({ status: 200, contentType: 'text/css', body: '' }),
  );
});

/** Scroll the whole page so lazy images load, then return to the top. */
async function loadWholePage(page: Page) {
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 600) {
      window.scrollTo({ top: y, behavior: 'instant' });
      await new Promise((resolve) => setTimeout(resolve, 30));
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  });
  await page.waitForFunction(() => Array.from(document.images).every((image) => image.complete));
}

const activeNavLinks = (page: Page) => page.locator('nav [aria-current="location"]');

test.describe('every page', () => {
  for (const path of allPaths) {
    test(`${path} renders cleanly`, async ({ page }) => {
      const problems: string[] = [];
      page.on('console', (message) => {
        if (message.type() === 'error') problems.push(`console: ${message.text()}`);
      });
      page.on('pageerror', (error) => problems.push(`exception: ${error.message}`));
      page.on('response', (response) => {
        if (response.status() >= 400) problems.push(`${response.status()} ${response.url()}`);
      });
      // Fonts, styles and scripts are all served by the site itself.
      page.on('request', (request) => {
        if (!isLocal(new URL(request.url()))) problems.push(`third-party request: ${request.url()}`);
      });

      await page.goto(path);
      await loadWholePage(page);

      await expect(page.locator('h1')).toHaveCount(1);
      expect(await page.title()).not.toBe('');

      const fontsLoaded = await page.evaluate(async () => {
        await document.fonts.ready;
        return ['Inter', 'Playfair Display'].filter(
          (family) =>
            !Array.from(document.fonts).some(
              (face) => face.family.replace(/["']/g, '').includes(family) && face.status === 'loaded',
            ),
        );
      });
      expect(fontsLoaded, 'font families that did not load').toEqual([]);

      const brokenImages = await page.evaluate(() =>
        Array.from(document.images)
          .filter((image) => image.naturalWidth === 0)
          .map((image) => image.src),
      );
      expect(brokenImages, 'images that failed to load').toEqual([]);

      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow, 'pixels of sideways scrolling').toBe(0);

      expect(problems).toEqual([]);
    });
  }
});

test.describe('links and registries', () => {
  // These do not depend on the viewport, so one project is enough.
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'viewport-independent');
  });

  test('every internal link resolves, including its #fragment', async ({ page, request }) => {
    test.setTimeout(120_000);
    const idsByPath = new Map<string, Set<string>>();
    const links: { from: string; path: string; hash: string }[] = [];

    for (const path of allPaths) {
      await page.goto(path);
      const found = await page.evaluate(() => ({
        ids: Array.from(document.querySelectorAll('[id]'), (element) => element.id),
        hrefs: Array.from(document.querySelectorAll<HTMLAnchorElement>('a[href]'), (a) => a.href),
      }));
      idsByPath.set(path, new Set(found.ids));
      for (const href of found.hrefs) {
        const url = new URL(href);
        if (url.protocol.startsWith('http') && isLocal(url)) {
          links.push({ from: path, path: url.pathname, hash: decodeURIComponent(url.hash.slice(1)) });
        }
      }
    }

    const broken: string[] = [];
    const statusByPath = new Map<string, number>();
    for (const link of links) {
      if (!statusByPath.has(link.path)) {
        statusByPath.set(link.path, (await request.get(link.path)).status());
      }
      if (statusByPath.get(link.path) !== 200) {
        broken.push(`${link.from} -> ${link.path} (${statusByPath.get(link.path)})`);
      } else if (link.hash && idsByPath.has(link.path) && !idsByPath.get(link.path)!.has(link.hash)) {
        broken.push(`${link.from} -> ${link.path}#${link.hash} (no such id)`);
      }
    }
    expect(broken).toEqual([]);
  });

  test('every article has its page, social card and a byline matching the registry', async ({ request }) => {
    for (const article of articles) {
      const page = await request.get(`/articles/${article.slug}/`);
      expect(page.status(), article.slug).toBe(200);
      const html = await page.text();
      expect(html, `${article.slug} byline`).toContain(
        `· ${formatDate(article.date)} · ${article.readingMinutes} min read</p>`,
      );
      expect(html, `${article.slug} structured data`).toContain('"@type": "BlogPosting"');
      expect((await request.get(`/og/${article.slug}.png`)).status(), `${article.slug} card`).toBe(200);
    }
  });

  test('the sitemap lists every page and the feed lists every article', async ({ request }) => {
    const sitemap = await (await request.get('/sitemap.xml')).text();
    for (const path of allPaths) {
      expect(sitemap).toContain(`<loc>${SITE_URL}${path}</loc>`);
    }
    const feed = await (await request.get('/feed.xml')).text();
    for (const path of articlePaths) {
      expect(feed).toContain(`<link>${SITE_URL}${path}</link>`);
    }
    expect(await (await request.get('/robots.txt')).text()).toContain(`${SITE_URL}/sitemap.xml`);
  });

  test('an unknown address shows the branded 404 page', async ({ page }) => {
    const response = await page.goto('/no-such-page');
    expect(response?.status()).toBe(404);
    await expect(page.locator('h1')).toHaveText('Page not found');
    await page.getByRole('link', { name: 'Browse the writing' }).click();
    await expect(page).toHaveURL(/\/writing$/);
    await expect(page.locator('h1')).toContainText('Writing');
  });

  test('a project card opens its case study', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: `${projects[0].name}: read the case study` }).click();
    await expect(page).toHaveURL(new RegExp(`/projects/${projects[0].slug}$`));
    await expect(page.locator('h1')).toHaveText(projects[0].name);
    await page.getByRole('link', { name: 'All projects' }).click();
    await expect(page).toHaveURL(/\/#projects$/);
  });

  test('the nav highlights the section in view and clears at the top', async ({ page }) => {
    await page.goto('/');
    await expect(activeNavLinks(page)).toHaveCount(0);

    for (const [id, label] of [
      ['projects', 'Projects'],
      ['skills', 'Experience'],
      ['contact', 'Contact'],
    ]) {
      await page.evaluate((sectionId) => {
        const top = document.getElementById(sectionId)!.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({ top: top - 64, behavior: 'instant' });
      }, id);
      await expect(activeNavLinks(page)).toHaveText(label);
    }

    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await expect(activeNavLinks(page)).toHaveCount(0);
  });

  test('the home page lists the latest three essays and links to the archive', async ({ page }) => {
    await page.goto('/#writing');
    const rows = page.locator('#writing a[href^="/articles/"]');
    await expect(rows).toHaveCount(3);
    const latest = [...articles].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);
    for (const [i, article] of latest.entries()) {
      await expect(rows.nth(i)).toHaveAttribute('href', `/articles/${article.slug}/`);
    }
    await page.locator('#writing').getByRole('link', { name: `All ${articles.length} essays` }).click();
    await expect(page).toHaveURL(/\/writing$/);
  });
});

test.describe('light and dark themes', () => {
  const pageColour = (page: Page) => page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  const LIGHT = 'rgb(251, 248, 243)';
  const DARK = 'rgb(2, 6, 23)';
  // a theme change reaches the page a moment after it is asked for
  const expectColour = (page: Page, colour: string) => expect.poll(() => pageColour(page)).toBe(colour);

  test('the page follows the system setting, and follows it when it changes', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/');
    await expectColour(page, DARK);
    await page.emulateMedia({ colorScheme: 'light' });
    await expectColour(page, LIGHT);
  });

  test('the toggle overrides the system setting and the choice carries across pages', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/');
    await expectColour(page, LIGHT);
    await page.locator('[data-theme-toggle]:visible').click();
    await expectColour(page, DARK);

    // an article is a separate static page; it must open in the chosen theme
    await page.goto(articlePaths[0]);
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expectColour(page, DARK);

    await page.locator('[data-theme-toggle]:visible').click();
    await expectColour(page, LIGHT);
    await page.goto('/writing');
    await expectColour(page, LIGHT);
  });
});

test.describe('tap targets on a phone', () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'measured at phone width');
  });

  // One of each page type. Links inside article prose are exempt, as inline
  // text links are in WCAG 2.5.8; everything else must be 44px tall.
  const samples = ['/', '/writing', projectPaths[0], articlePaths[0], '/no-such-page'];

  for (const path of samples) {
    test(`${path} has no link, button or field under 44px tall`, async ({ page }) => {
      await page.goto(path);
      const tooSmall = await page.evaluate(() =>
        Array.from(document.querySelectorAll('a[href], button, summary, input, textarea'))
          .filter((element) => {
            const box = element.getBoundingClientRect();
            const style = getComputedStyle(element);
            // not rendered, or visually hidden until focused (the skip link)
            if (box.width <= 1 || box.height <= 1 || style.visibility === 'hidden') return false;
            if (style.display === 'inline' && element.closest('article p, article li, article td')) {
              return false;
            }
            return box.height < 44;
          })
          .map((element) => `${element.textContent?.trim().slice(0, 30)} (${Math.round(element.getBoundingClientRect().height)}px)`),
      );
      expect(tooSmall).toEqual([]);
    });
  }
});

test.describe('mobile menu', () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'the menu button only exists on small screens');
  });

  test('opens, closes on Escape and closes after choosing a link', async ({ page }) => {
    await page.goto('/');
    const button = page.locator('button[aria-controls="mobile-menu"]');
    const menu = page.locator('#mobile-menu');

    await button.click();
    await expect(menu).toBeVisible();
    await expect(button).toHaveAttribute('aria-expanded', 'true');

    await page.keyboard.press('Escape');
    await expect(menu).toHaveCount(0);
    await expect(button).toBeFocused();

    await button.click();
    await menu.getByRole('link', { name: 'Projects' }).click();
    await expect(menu).toHaveCount(0);
    await expect(page).toHaveURL(/#projects$/);
  });
});

test.describe('contact form', () => {
  const ENDPOINT = 'https://api.web3forms.com/submit';

  test.beforeEach(async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'viewport-independent');
    await page.goto('/');
    // Without NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY at build time the form is disabled by design.
    test.skip(await page.locator('#name').isDisabled(), 'site was built without a form key');
  });

  async function fill(page: Page) {
    await page.fill('#name', 'Test Person');
    await page.fill('#email', 'test@example.com');
    await page.fill('#message', 'Hello from the test suite.');
  }

  test('does not submit until every field is valid', async ({ page }) => {
    let requests = 0;
    await page.route(ENDPOINT, (route) => {
      requests += 1;
      return route.fulfill({ json: { success: true } });
    });
    const submit = page.locator('#contact-form button[type="submit"]');

    await submit.click();
    await fill(page);
    await page.fill('#email', 'not-an-email');
    await submit.click();
    expect(requests).toBe(0);
  });

  test('confirms a sent message and clears the fields', async ({ page }) => {
    let payload: Record<string, unknown> = {};
    await page.route(ENDPOINT, (route) => {
      payload = route.request().postDataJSON();
      return route.fulfill({ json: { success: true } });
    });

    await fill(page);
    await page.locator('#contact-form button[type="submit"]').click();

    await expect(page.getByText('Message sent')).toBeVisible();
    await expect(page.locator('#name')).toHaveValue('');
    expect(payload).toMatchObject({ name: 'Test Person', email: 'test@example.com' });
  });

  test('reports a rejected message, keeps the text and offers the email address', async ({ page }) => {
    await page.route(ENDPOINT, (route) =>
      route.fulfill({ status: 400, json: { success: false, message: 'Invalid access key.' } }),
    );

    await fill(page);
    await page.locator('#contact-form button[type="submit"]').click();

    const alert = page.locator('#contact-form [role="alert"]');
    await expect(alert).toContainText('Message not sent');
    await expect(alert).toContainText('Invalid access key.');
    await expect(alert.getByRole('link')).toHaveAttribute('href', /^mailto:/);
    await expect(page.locator('#message')).toHaveValue('Hello from the test suite.');
  });

  test('reports a network failure', async ({ page }) => {
    await page.route(ENDPOINT, (route) => route.abort());

    await fill(page);
    await page.locator('#contact-form button[type="submit"]').click();

    await expect(page.locator('#contact-form [role="alert"]')).toContainText(
      'Could not reach the mail service',
    );
  });
});
