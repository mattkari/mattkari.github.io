import { formatDate, sortedArticles } from '@/lib/articles';
import { projects } from '@/lib/projects';
import { EMAIL, GITHUB_URL, LINKEDIN_URL, SITE_DESCRIPTION, SITE_URL } from '@/lib/site';

// /llms.txt: a short, plain-Markdown map of the site for AI assistants, in the
// format proposed at https://llmstxt.org. It is built from the same registries
// as the pages, so it never lists something the site does not have.
//
// No major AI provider has said it reads this file, and Google says it needs no
// such file. It costs nothing to offer and gives an assistant one clean page
// to start from.
export const dynamic = 'force-static';

// one line per link, so a stray line break cannot split an entry
const line = (text: string) => text.replace(/\s+/g, ' ').trim();

export function GET() {
  const body = `# Matt Karimov

> ${SITE_DESCRIPTION}

Personal site of Matt Karimov, a Test Automation Engineer based in Liverpool, UK. It holds case studies of systems he has built, and essays on AI quality, AI agents and test automation. Every page is static HTML and can be read without JavaScript.

## About

- [Home](${SITE_URL}/): profile, projects, experience, skills, education and contact
- [LinkedIn](${LINKEDIN_URL})
- [GitHub](${GITHUB_URL})
- Email: ${EMAIL}

## Projects

${projects
  .map((project) => `- [${line(project.name)}](${SITE_URL}/projects/${project.slug}): ${line(project.caseStudy.summary)}`)
  .join('\n')}

## Writing

${sortedArticles
  .map(
    (article) =>
      `- [${line(article.title)}](${SITE_URL}/articles/${article.slug}/): ${line(article.summary)} (${formatDate(article.date)}, ${article.readingMinutes} min read)`,
  )
  .join('\n')}

## Optional

- [All writing](${SITE_URL}/writing): the full list of essays
- [RSS feed](${SITE_URL}/feed.xml)
- [Sitemap](${SITE_URL}/sitemap.xml)
`;

  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
