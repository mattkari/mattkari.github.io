import { sortedArticles } from '@/lib/articles';
import { EMAIL, SITE_URL } from '@/lib/site';

// RSS 2.0 feed of every article, written to /feed.xml at build time.
export const dynamic = 'force-static';

const escapeXml = (text: string) =>
  text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const rfc822 = (iso: string) => new Date(`${iso}T00:00:00Z`).toUTCString();

export function GET() {
  const items = sortedArticles
    .map((article) => {
      const url = `${SITE_URL}/articles/${article.slug}/`;
      return `    <item>
      <title>${escapeXml(article.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${rfc822(article.date)}</pubDate>
      <author>${EMAIL} (Matt Karimov)</author>
      <description>${escapeXml(article.summary)}</description>
${article.tags.map((tag) => `      <category>${escapeXml(tag)}</category>`).join('\n')}
    </item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Matt Karimov: Writing</title>
    <link>${SITE_URL}/writing</link>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
    <description>Practical, tested guides on AI quality, LLM evaluation, AI agents and test automation.</description>
    <language>en-GB</language>
    <lastBuildDate>${rfc822(sortedArticles[0].date)}</lastBuildDate>
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  });
}
