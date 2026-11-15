import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

// Written to /robots.txt at build time.
export const dynamic = 'force-static';

// The crawlers that decide whether a page can be found and cited in AI search:
// ChatGPT search, Claude and Perplexity. Each obeys robots.txt, so they are
// named here to make the invitation explicit. Everything is already open to
// every crawler through the `*` rule; this list changes no access.
const AI_SEARCH_CRAWLERS = [
  'OAI-SearchBot', // ChatGPT search results
  'ChatGPT-User', // a ChatGPT user asking about a page
  'Claude-SearchBot', // Claude search results
  'Claude-User', // a Claude user asking about a page
  'PerplexityBot', // Perplexity search results
  'Perplexity-User', // a Perplexity user asking about a page
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/' },
      { userAgent: AI_SEARCH_CRAWLERS, allow: '/' },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
