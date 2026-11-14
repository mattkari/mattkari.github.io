import type { MetadataRoute } from 'next';
import { sortedArticles } from '@/lib/articles';
import { projects } from '@/lib/projects';
import { SITE_URL } from '@/lib/site';

// Written to /sitemap.xml at build time (the site is a static export).
export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const latest = sortedArticles[0].date;
  return [
    { url: `${SITE_URL}/`, lastModified: latest, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/writing`, lastModified: latest, changeFrequency: 'weekly', priority: 0.8 },
    ...projects.map((project) => ({
      url: `${SITE_URL}/projects/${project.slug}`,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    ...sortedArticles.map((article) => ({
      url: `${SITE_URL}/articles/${article.slug}/`,
      lastModified: article.date,
      changeFrequency: 'yearly' as const,
      priority: 0.7,
    })),
  ];
}
