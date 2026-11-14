import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight, Github, Globe, Lock, Minus } from 'lucide-react';
import { ArticleRow } from '@/components/article-row';
import { CheckItem, Kicker, Tag } from '@/components/primitives';
import { SiteFooter } from '@/components/site-footer';
import { SubpageHeader } from '@/components/subpage-header';
import { articles } from '@/lib/articles';
import { getProject, projects } from '@/lib/projects';
import { SITE_URL } from '@/lib/site';

type Params = { params: Promise<{ slug: string }> };

// One static page per project in src/lib/projects.ts; anything else is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};

  const title = `${project.name} | Matt Karimov`;
  const description = project.caseStudy.summary;
  const url = `${SITE_URL}/projects/${project.slug}`;
  const image = { url: `${SITE_URL}/og/default.png`, width: 1200, height: 630 };
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { type: 'article', url, title, description, locale: 'en_GB', images: [image] },
    twitter: { card: 'summary_large_image', title, description, images: [image.url] },
  };
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h2 className="font-display text-2xl leading-tight text-white sm:text-3xl">{children}</h2>
      <div aria-hidden="true" className="mt-4 h-px w-16 bg-amber-300/60" />
    </div>
  );
}

export default async function ProjectPage({ params }: Params) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const study = project.caseStudy;
  const evidence = study.evidence ?? project.evidence;
  const index = projects.indexOf(project);
  const previous = projects[(index - 1 + projects.length) % projects.length];
  const next = projects[(index + 1) % projects.length];
  const related = (study.relatedArticles ?? [])
    .map((articleSlug) => articles.find((article) => article.slug === articleSlug))
    .filter((article) => article !== undefined);

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: project.name,
    description: study.summary,
    url: `${SITE_URL}/projects/${project.slug}`,
    keywords: project.technologies.join(', '),
    author: { '@type': 'Person', name: 'Matt Karimov', url: SITE_URL },
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }}
      />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 -top-40 h-[30rem] w-[30rem] rounded-full bg-blue-600/20 blur-3xl" />
        <div className="absolute -right-32 top-[40rem] h-[26rem] w-[26rem] rounded-full bg-amber-400/10 blur-3xl" />
      </div>

      <SubpageHeader back={{ href: '/#projects', label: 'All projects' }} />

      <main className="relative mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-20">
        <header>
          <Kicker>Case study · {project.tag}</Kicker>
          <h1 className="font-display text-4xl leading-tight text-white sm:text-5xl">{project.name}</h1>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-slate-300">{study.summary}</p>

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
            {project.repo && (
              <a
                href={project.repo}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center gap-2 rounded-md bg-amber-300 px-6 font-semibold text-slate-950 transition-colors hover:bg-amber-200"
              >
                <Github size={16} aria-hidden="true" /> View the repository
              </a>
            )}
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center gap-2 rounded-md bg-amber-300 px-6 font-semibold text-slate-950 transition-colors hover:bg-amber-200"
              >
                <Globe size={16} aria-hidden="true" /> Visit the live site
              </a>
            )}
            {!project.repo && !project.liveUrl && (
              <span className="inline-flex items-center gap-2 text-slate-400">
                <Lock size={14} aria-hidden="true" className="shrink-0" />
                {project.status}
              </span>
            )}
          </div>

          <ul className="mt-8 flex flex-wrap gap-2" aria-label="Technologies">
            {project.technologies.map((tech) => (
              <li key={tech}>
                <Tag>{tech}</Tag>
              </li>
            ))}
          </ul>
        </header>

        <figure className="mt-12">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={project.image}
            alt={project.imageAlt}
            className="w-full rounded-2xl border border-white/10 shadow-2xl shadow-slate-950/60"
          />
          <figcaption className="mt-3 text-sm leading-relaxed text-slate-400">
            {study.imageCaption}
          </figcaption>
        </figure>

        <section className="mt-16" aria-labelledby="background">
          <SectionTitle>
            <span id="background">What it is</span>
          </SectionTitle>
          <div className="max-w-3xl space-y-5">
            {study.background.map((paragraph) => (
              <p key={paragraph} className="text-lg leading-relaxed text-slate-300">
                {paragraph}
              </p>
            ))}
          </div>
        </section>

        {study.steps && (
          <section className="mt-16">
            <SectionTitle>{study.steps.heading}</SectionTitle>
            {study.steps.intro && (
              <p className="mb-8 max-w-3xl leading-relaxed text-slate-300">{study.steps.intro}</p>
            )}
            <ol className="max-w-3xl">
              {study.steps.items.map((step, i) => (
                <li key={step.title} className="relative flex gap-5 pb-8 last:pb-0">
                  {/* the line that joins one step to the next */}
                  {i < study.steps!.items.length - 1 && (
                    <span aria-hidden="true" className="absolute left-[1.0625rem] top-9 h-full w-px bg-white/10" />
                  )}
                  <span
                    aria-hidden="true"
                    className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-amber-300/40 bg-slate-950 font-display text-sm text-amber-300"
                  >
                    {i + 1}
                  </span>
                  <div className="pt-1">
                    <h3 className="font-semibold text-white">{step.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-slate-300">{step.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        )}

        {study.layers && (
          <section className="mt-16">
            <SectionTitle>{study.layers.heading}</SectionTitle>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {study.layers.items.map((layer) => (
                <div key={layer.label} className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
                  <h3 className="text-xs font-medium uppercase tracking-[0.2em] text-amber-300/90">
                    {layer.label}
                  </h3>
                  <ul className="mt-3 space-y-1.5">
                    {layer.items.map((item) => (
                      <li key={item} className="text-sm leading-relaxed text-slate-200">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}

        {study.details?.map((group) => (
          <section key={group.heading} className="mt-16">
            <SectionTitle>{group.heading}</SectionTitle>
            <ul className="max-w-3xl space-y-3">
              {group.items.map((item) => (
                <CheckItem key={item}>{item}</CheckItem>
              ))}
            </ul>
          </section>
        ))}

        {study.figures && (
          <section className="mt-16">
            <SectionTitle>From the running system</SectionTitle>
            <div className="grid items-start gap-6 sm:grid-cols-2">
              {study.figures.map((figure) => (
                <figure key={figure.src}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={figure.src}
                    alt={figure.alt}
                    loading="lazy"
                    className="w-full rounded-xl border border-white/10"
                  />
                  <figcaption className="mt-3 text-sm leading-relaxed text-slate-400">
                    {figure.caption}
                  </figcaption>
                </figure>
              ))}
            </div>
          </section>
        )}

        {evidence.length > 0 && (
          <section className="mt-16">
            <SectionTitle>Evidence</SectionTitle>
            <ul className="max-w-3xl space-y-3">
              {evidence.map((item) => (
                <CheckItem key={item}>{item}</CheckItem>
              ))}
            </ul>
          </section>
        )}

        {study.limits && (
          <section className="mt-16">
            <SectionTitle>Limits, stated</SectionTitle>
            <ul className="max-w-3xl space-y-3">
              {study.limits.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <Minus size={16} aria-hidden="true" className="mt-1 shrink-0 text-slate-500" />
                  <span className="text-sm leading-relaxed text-slate-300">{item}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {related.length > 0 && (
          <section className="mt-16">
            <SectionTitle>The full write-up</SectionTitle>
            <ul className="divide-y divide-white/5 rounded-2xl border border-white/10 bg-slate-900/60 px-1 py-1 sm:px-3">
              {related.map((article, i) => (
                <li key={article.slug}>
                  <ArticleRow article={article} index={i} />
                </li>
              ))}
            </ul>
          </section>
        )}

        <p className="mt-12 border-t border-white/10 pt-6 text-sm text-slate-400">
          Source for this page: {study.source}
        </p>

        <section className="mt-12 rounded-2xl border border-amber-300/30 bg-amber-300/5 p-7 sm:p-9">
          <h2 className="font-display text-2xl text-white">Want the detail?</h2>
          <p className="mt-3 max-w-2xl leading-relaxed text-slate-300">
            I am happy to walk through the architecture, the trade-offs and the evidence behind
            any of this.
          </p>
          <Link
            href="/#contact"
            className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-amber-300 hover:text-amber-200"
          >
            Get in touch <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </section>

        <nav aria-label="More projects" className="mt-12 grid gap-4 sm:grid-cols-2">
          <Link
            href={`/projects/${previous.slug}`}
            className="group rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-colors hover:border-amber-300/40"
          >
            <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-400">
              <ArrowLeft size={14} aria-hidden="true" /> Previous
            </span>
            <span className="mt-2 block font-display text-lg text-white group-hover:text-amber-100">
              {previous.name}
            </span>
          </Link>
          <Link
            href={`/projects/${next.slug}`}
            className="group rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-colors hover:border-amber-300/40 sm:text-right"
          >
            <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-400">
              Next <ArrowRight size={14} aria-hidden="true" />
            </span>
            <span className="mt-2 block font-display text-lg text-white group-hover:text-amber-100">
              {next.name}
            </span>
          </Link>
        </nav>
      </main>

      <SiteFooter />
    </div>
  );
}
