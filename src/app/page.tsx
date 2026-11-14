'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Bot,
  Briefcase,
  ChevronDown,
  Cloud,
  Database,
  Download,
  GitBranch,
  Github,
  Globe,
  Layers,
  Linkedin,
  Loader2,
  Lock,
  Mail,
  MapPin,
  Menu,
  Monitor,
  Terminal,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert } from '@/components/ui/alert';
import { CheckItem, Kicker, Tag } from '@/components/primitives';
import { SiteFooter } from '@/components/site-footer';
import { WritingShowcase } from '@/components/writing-showcase';
import { sortedArticles } from '@/lib/articles';
import { projects } from '@/lib/projects';
import { EMAIL, GITHUB_URL, LINKEDIN_URL } from '@/lib/site';

const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit';
// Rebuild with: python3 scripts/build-cv-pdf.py
// Keep CV_VERSION in step with CV_VERSION in that script.
const CV_URL = '/cv/matt-karimov-cv.pdf';
const CV_VERSION = 'November 2026';
const LOCATION = 'Liverpool, UK';
const LOCATION_LONG = 'Liverpool, UK \u00b7 North West England';

type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

function SectionHeading({
  kicker,
  title,
  italic,
  sub,
}: {
  kicker: string;
  title: string;
  italic?: string;
  sub?: string;
}) {
  return (
    <div className="mb-6 max-w-3xl sm:mb-8">
      <Kicker>{kicker}</Kicker>
      <h2 className="font-display text-3xl leading-tight text-white sm:text-4xl">
        {title} {italic && <span className="italic text-slate-400">{italic}</span>}
      </h2>
      <div aria-hidden="true" className="mt-4 h-px w-16 bg-amber-300/60 sm:mt-5" />
      {sub && <p className="mt-4 leading-relaxed text-slate-300 sm:mt-5 sm:text-lg">{sub}</p>}
    </div>
  );
}

export default function Home() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [isWritingOpen, setIsWritingOpen] = useState(false);
  const [status, setStatus] = useState<FormStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [expandedRoles, setExpandedRoles] = useState<string[]>([]);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  // Injected at build time from the WEB3FORMS_ACCESS_KEY repo secret. Without it
  // there is nowhere for submissions to go, so the form renders in a disabled
  // state pointing at the email address instead of failing silently.
  const accessKey = process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY;
  const isFormEnabled = Boolean(accessKey);

  const navLinks = [
    { name: 'About', href: '#about' },
    { name: 'Projects', href: '#projects' },
    { name: 'Writing', href: '#writing' },
    { name: 'Experience', href: '#experience' },
    { name: 'Contact', href: '#contact' },
  ];

  // Highlight the nav link for whichever section is currently in view. The hero
  // is observed too, so the highlight clears again on the way back to the top.
  useEffect(() => {
    const ids = ['home', 'about', 'projects', 'writing', 'experience', 'skills', 'contact'];
    const nodes = ids
      .map((id) => document.getElementById(id))
      .filter((n): n is HTMLElement => n !== null);
    if (!nodes.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveSection(visible[0].target.id);
      },
      // a band across the upper-middle of the viewport, so the active link
      // changes when a section genuinely occupies the reading area
      { rootMargin: '-20% 0px -70% 0px', threshold: 0 },
    );
    nodes.forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, []);

  // Arriving at /#writing (or clicking the Writing nav link) opens the essay list.
  useEffect(() => {
    const openIfWriting = () => {
      if (window.location.hash === '#writing') setIsWritingOpen(true);
    };
    openIfWriting();
    window.addEventListener('hashchange', openIfWriting);
    return () => window.removeEventListener('hashchange', openIfWriting);
  }, []);

  // The mobile menu closes on Escape (focus returns to its button) and when
  // the viewport grows past the breakpoint where the desktop links take over.
  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setIsMobileMenuOpen(false);
      menuButtonRef.current?.focus();
    };
    const desktop = window.matchMedia('(min-width: 768px)');
    const onBreakpoint = () => desktop.matches && setIsMobileMenuOpen(false);
    window.addEventListener('keydown', onKeyDown);
    desktop.addEventListener('change', onBreakpoint);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      desktop.removeEventListener('change', onBreakpoint);
    };
  }, [isMobileMenuOpen]);

  const scrollTo = (id: string) => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.getElementById(id)?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
  };

  // "The stack" has no nav link of its own; it reads as part of Experience.
  const activeNavSection = activeSection === 'skills' ? 'experience' : activeSection;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!accessKey) return;

    const botcheck = new FormData(e.currentTarget).get('botcheck');
    setStatus('submitting');
    setErrorMessage('');

    try {
      const response = await fetch(WEB3FORMS_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_key: accessKey,
          name: formData.name,
          email: formData.email,
          message: formData.message,
          subject: `Portfolio contact from ${formData.name}`,
          from_name: 'Portfolio Site',
          botcheck,
        }),
      });
      const result = await response.json();

      if (result.success) {
        setStatus('success');
        setFormData({ name: '', email: '', message: '' });
      } else {
        setStatus('error');
        setErrorMessage(result.message || 'Something went wrong sending your message.');
      }
    } catch {
      setStatus('error');
      setErrorMessage('Could not reach the mail service. Please check your connection.');
    }
  };

  const differentiators = [
    'Source-grounded RAG with page-level citations',
    'LLM tooling wired to real systems over MCP',
    'LLM evaluation and grounding checks',
    'Banking QA: API, Kafka, database and UI',
    'Payments domain (SEPA and instant payments)',
    'CI/CD, Docker and self-hosting on ARM',
  ];

  const skillGroups = [
    {
      icon: Bot,
      title: 'AI and LLM engineering',
      items: ['Python', 'RAG pipelines', 'Embeddings and vector retrieval', 'pgvector', 'Prompt design', 'MCP integration', 'Claude / Anthropic API', 'Streamlit', 'LLM evaluation'],
    },
    {
      icon: Terminal,
      title: 'Programming and frameworks',
      items: ['Java (OOP)', 'Ruby', 'TestNG', 'JUnit', 'Cucumber BDD', 'JBehave'],
    },
    {
      icon: Layers,
      title: 'API and integration testing',
      items: ['REST Assured', 'Karate', 'Postman', 'REST APIs', 'JSON / XML', 'Kafka event validation'],
    },
    {
      icon: Monitor,
      title: 'Test and UI automation',
      items: ['Selenium WebDriver', 'Playwright', 'Page Object Model', 'BDD / TDD', 'E2E and exploratory'],
    },
    {
      icon: Database,
      title: 'Database testing',
      items: ['SQL', 'MongoDB'],
    },
    {
      icon: GitBranch,
      title: 'CI/CD and version control',
      items: ['Jenkins', 'GitLab CI/CD', 'Maven', 'Docker', 'Kubernetes', 'Git', 'GitLab', 'Bitbucket'],
    },
    {
      icon: Cloud,
      title: 'Cloud and architecture',
      items: ['AWS (EC2)', 'Microservices', 'Distributed systems'],
    },
    {
      icon: Briefcase,
      title: 'Domain and methodology',
      items: ['Financial services', 'Payments and banking', 'Agile Scrum', 'SDLC / STLC', 'Jira'],
    },
  ];

  const experience = [
    {
      title: 'Test Automation Engineer',
      company: 'Barclays Investment Bank, UK',
      period: 'Feb 2026 – Present',
      highlights: [
        'Connected LLM tooling to internal systems over the Model Context Protocol, running Atlassian, GitLab and SQL MCP servers in Docker with read-only access, plus the Playwright MCP and CLI',
        'Built a Karate Test Assistant RAG tool grounded in framework docs and test code to support API test authoring and debugging',
        'Architected UI test automation using Playwright with Java for a global investment bank platform',
        'Built the Karate Framework for API testing, streamlining backend and service-level test coverage',
      ],
      technologies: ['Playwright', 'Java', 'Karate', 'MCP', 'RAG', 'SQL', 'GitLab'],
    },
    {
      title: 'Quality Automation Specialist',
      company: 'NatWest Group, UK',
      period: 'Feb 2022 – Jan 2026',
      highlights: [
        "Led testing of NatWest's ICON IPF platform for 3+ years, becoming the subject-matter expert in integration framework testing and payment processing workflows",
        'Enhanced the IPF test framework with REST Assured and the Strategy Pattern, improving maintainability and reuse',
        'Built automation covering backend, API and database testing for SEPA and instant payment systems',
        'Spearheaded BDD automation with JBehave and Cucumber, turning JIRA requirements into executable scenarios',
        'Integrated tests into CI/CD with Jenkins and GitLab CI/CD for continuous testing and rapid feedback',
        'Pioneered Docker and Kubernetes integration for consistent, containerised test environments',
      ],
      technologies: ['ICON IPF', 'Java', 'Selenium', 'JBehave', 'Cucumber', 'REST Assured', 'SQL', 'Docker', 'Kubernetes', 'Jenkins', 'GitLab CI'],
    },
    {
      title: 'QA Automation Engineer',
      company: 'Amplience, UK',
      period: 'Apr 2021 – Jan 2022',
      highlights: [
        'Designed and implemented a test automation framework using Java, Selenium WebDriver, Cucumber BDD, TestNG and the Page Object Model',
        'Integrated automated tests into CI/CD builds using Jenkins on AWS EC2',
        'Validated REST APIs and JSON schemas with REST Assured and Postman, and verified data consistency in MongoDB',
      ],
      technologies: ['Java', 'Ruby', 'Selenium', 'Cucumber', 'TestNG', 'REST Assured', 'Postman', 'MongoDB', 'Jenkins', 'AWS EC2'],
    },
  ];

  // Kept, not deleted: removing them would leave an unexplained gap in the
  // timeline. Compact because neither role is automation or AI work.
  const earlierRoles = [
    {
      title: 'Complaints Manager (Testing and Validation Focus)',
      company: 'Lloyds Banking Group, UK',
      period: 'Nov 2017 – Jan 2021',
      scope: 'Manual and automated testing of banking redress calculators, with SQL data validation',
    },
    {
      title: 'Quality Assurance Representative',
      company: 'HSBC, Leeds, UK',
      period: 'May 2017 – Nov 2017',
      scope: 'Manual verification and SQL database testing of financial complaint calculators',
    },
  ];

  // "2017 to 2021" spans the two periods above.
  const EARLIER_ROLES_SUMMARY = `2017 to 2021 · ${earlierRoles
    .map((role) => role.company.split(',')[0])
    .join(', ')}`;

  // How many highlights each role shows on a phone before "Show more".
  const HIGHLIGHTS_ON_PHONES = 2;

  const contactRows: {
    icon: typeof Mail;
    label: string;
    value: string;
    href?: string;
    external?: boolean;
  }[] = [
    { icon: Mail, label: 'Email', value: EMAIL, href: `mailto:${EMAIL}` },
    { icon: Linkedin, label: 'LinkedIn', value: 'linkedin.com/in/mattkari', href: LINKEDIN_URL, external: true },
    { icon: Github, label: 'GitHub', value: 'github.com/mattkari', href: GITHUB_URL, external: true },
    { icon: MapPin, label: 'Location', value: LOCATION_LONG },
  ];

  // Three parallel counts. The PhD moved into the About copy: a credential in
  // a numeric slot read as an inconsistency, and it is already stated below.
  const stats = [
    { value: '8+', label: 'Years in UK financial services' },
    { value: String(sortedArticles.length), label: 'Technical essays' },
    { value: String(projects.length), label: 'Systems running' },
  ];

  const education = [
    { program: 'Full Stack Automation Tester (SDET) Program', school: 'Cydeo, Virginia, USA', year: '2020' },
    { program: 'PhD in Governance and International Affairs', school: 'Durham University, UK', year: '2018 (thesis submitted 2017)' },
    { program: 'MA in Public Administration', school: 'JMI Central University, New Delhi, India', year: '2006' },
    { program: 'BA in Legal Studies', school: 'TIU University, Tashkent, Uzbekistan', year: '2003' },
  ];

  return (
    <div className="min-h-screen bg-slate-950">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:bg-amber-300 focus:text-slate-950 focus:px-4 focus:py-2 focus:rounded-md"
      >
        Skip to main content
      </a>

      {/* Navigation */}
      <nav
        aria-label="Primary"
        className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/90 backdrop-blur-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <a href="#home" className="flex items-center space-x-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-amber-300/50 font-display text-lg text-amber-300">
                MK
              </span>
              <span className="hidden text-lg font-semibold text-white sm:block">Matt Karimov</span>
            </a>

            <div className="hidden md:flex items-center space-x-7">
              {navLinks.map((link) => {
                const isActive = link.href === `#${activeNavSection}`;
                return (
                  <a
                    key={link.name}
                    href={link.href}
                    aria-current={isActive ? 'location' : undefined}
                    onClick={() => link.href === '#writing' && setIsWritingOpen(true)}
                    className={`border-b-2 pb-0.5 text-sm font-medium transition-colors ${
                      isActive
                        ? 'border-amber-300 text-amber-300'
                        : 'border-transparent text-slate-300 hover:text-amber-300'
                    }`}
                  >
                    {link.name}
                  </a>
                );
              })}
              <Button
                size="sm"
                onClick={() => scrollTo('contact-form')}
                className="bg-amber-300 text-slate-950 hover:bg-amber-200"
              >
                Get in touch
              </Button>
            </div>

            <button
              ref={menuButtonRef}
              className="-mr-2 flex h-11 w-11 items-center justify-center rounded-md text-slate-200 hover:text-amber-300 md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div id="mobile-menu" className="md:hidden border-t border-white/10 bg-slate-950">
            <div className="px-4 pt-2 pb-4 space-y-1">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  aria-current={link.href === `#${activeNavSection}` ? 'location' : undefined}
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    if (link.href === '#writing') setIsWritingOpen(true);
                  }}
                  className="block px-3 py-2.5 rounded-md text-base font-medium text-slate-200 hover:text-amber-300 hover:bg-white/5 aria-[current]:text-amber-300"
                >
                  {link.name}
                </a>
              ))}
              <div className="px-3 pt-2">
                <Button
                  className="w-full bg-amber-300 text-slate-950 hover:bg-amber-200"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    scrollTo('contact-form');
                  }}
                >
                  Get in touch
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>

      <main id="main-content" tabIndex={-1} className="outline-none">
        {/* Hero */}
        <section
          id="home"
          className="relative overflow-hidden px-4 py-10 sm:px-6 sm:py-16 lg:px-8 scroll-mt-16"
        >
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            <div className="absolute -left-32 -top-40 h-[32rem] w-[32rem] rounded-full bg-blue-600/20 blur-3xl" />
            <div className="absolute -right-24 top-1/3 h-96 w-96 rounded-full bg-amber-400/10 blur-3xl" />
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          </div>

          <div className="relative mx-auto max-w-5xl text-center">
            <p className="mb-6 text-xs font-medium uppercase leading-relaxed tracking-[0.22em] text-slate-400 sm:tracking-[0.3em]">
              Matt Karimov · Test Automation Engineer · PhD, Durham
            </p>
            <h1 className="font-display text-4xl leading-[1.15] text-white sm:text-6xl">
              Answers that <span className="italic text-amber-300">show their evidence.</span>
            </h1>
            <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-slate-300">
              I build source-grounded AI tools for banking test teams. They cite their sources,
              refuse when the evidence runs out, and prove what they claim.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:mt-10 sm:gap-4">
              <Button
                size="lg"
                className="bg-amber-300 px-6 text-base font-semibold text-slate-950 hover:bg-amber-200 sm:px-8"
                onClick={() => scrollTo('contact-form')}
              >
                Get in touch
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 px-6 text-base text-white hover:border-amber-300/60 hover:bg-white/5 sm:px-8"
                onClick={() => {
                  setIsWritingOpen(true);
                  scrollTo('writing');
                }}
              >
                Read the writing
              </Button>
            </div>

            <div className="mx-auto mt-10 grid max-w-3xl grid-cols-3 gap-6 border-t border-white/10 pt-8 sm:mt-14 sm:pt-10">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="font-display text-3xl text-amber-300 sm:text-4xl">{stat.value}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.15em] text-slate-400 sm:text-sm sm:normal-case sm:tracking-normal">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* About */}
        <section id="about" className="border-t border-white/5 px-4 py-10 sm:px-6 sm:py-16 lg:px-8 scroll-mt-16">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-x-12 gap-y-2 lg:grid-cols-[1fr,2fr]">
              <div className="flex items-start justify-between gap-5 lg:block">
                <SectionHeading kicker="About" title="Evidence is" italic="the discipline" />
                <figure className="w-24 shrink-0 sm:w-40 lg:mt-2 lg:w-auto lg:max-w-[15rem]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/images/matt-karimov.jpg"
                    srcSet="/images/matt-karimov-sm.jpg 440w, /images/matt-karimov.jpg 880w"
                    sizes="(max-width: 640px) 96px, (max-width: 1024px) 160px, 240px"
                    alt="Matt Karimov"
                    width={880}
                    height={1100}
                    loading="lazy"
                    className="w-full rounded-2xl border border-white/10 object-cover shadow-2xl shadow-slate-950/60"
                  />
                  <figcaption className="mt-3 text-sm text-slate-400 max-lg:hidden">
                    Matt Karimov, {LOCATION}
                  </figcaption>
                </figure>
              </div>
              <div className="max-w-2xl">
                <p className="leading-relaxed text-slate-300 sm:text-lg">
                  My path to AI engineering runs through evidence. A PhD in governance and
                  international affairs (Durham, 2018) trained me to work the way a
                  trustworthy LLM system must: read sources closely, separate what a source
                  says from what I infer, and defend every claim. More than eight years in UK
                  financial services taught me what regulated systems demand: traceability,
                  reconciliation, and claims you can verify.
                </p>
                <p className="mt-5 leading-relaxed text-slate-300 sm:mt-6 sm:text-lg">
                  Day to day I am a Test Automation Engineer at Barclays Investment Bank,
                  connecting LLM tooling to internal systems over MCP and building a RAG test
                  assistant for API test authoring. Outside work I build and self-host my own
                  systems on a Raspberry Pi 5. I am looking for an AI engineering role where
                  source grounding, evaluation and honesty about limits are the product.
                </p>
                {/* Pills from the small breakpoint up; a plain list on phones, where
                    six pills would take six full rows. */}
                <ul
                  className="mt-6 flex flex-col gap-1.5 sm:mt-8 sm:flex-row sm:flex-wrap sm:gap-2.5"
                  aria-label="What I bring"
                >
                  {differentiators.map((item) => (
                    <li
                      key={item}
                      className="text-sm text-slate-300 max-sm:before:mr-2 max-sm:before:text-slate-500 max-sm:before:content-['·'] sm:rounded-full sm:border sm:border-white/15 sm:px-3.5 sm:py-1.5"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="mt-6 flex flex-wrap gap-6 text-sm font-medium sm:mt-8">
                  <a
                    href={LINKEDIN_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-amber-300 underline decoration-amber-300/40 underline-offset-4 hover:text-amber-200"
                  >
                    <Linkedin size={16} aria-hidden="true" /> LinkedIn
                  </a>
                  <a
                    href={GITHUB_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-amber-300 underline decoration-amber-300/40 underline-offset-4 hover:text-amber-200"
                  >
                    <Github size={16} aria-hidden="true" /> GitHub
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Projects */}
        <section
          id="projects"
          className="border-t border-white/5 px-4 py-10 sm:px-6 sm:py-16 lg:px-8 scroll-mt-16"
        >
          <div className="mx-auto max-w-7xl">
            <SectionHeading
              kicker="Portfolio"
              title="Selected work —"
              italic="systems with evidence"
              sub="Every claim below is backed by a repo, a verified run, or a public presentation: the standard I apply to the systems themselves."
            />

            <div className="grid gap-5 sm:gap-6 lg:grid-cols-2">
              {projects.map((project) => (
                <article
                  key={project.name}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60 transition-colors duration-300 hover:border-amber-300/30"
                >
                  <div className="overflow-hidden border-b border-white/10">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={project.image}
                      alt={project.imageAlt}
                      loading="lazy"
                      className="aspect-[16/10] w-full object-cover object-top transition-transform duration-700 group-hover:scale-[1.02]"
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-5 sm:p-6">
                    <p className="mb-3 text-[0.7rem] font-medium uppercase tracking-[0.2em] text-amber-300/90">
                      {project.tag}
                    </p>
                    <h3 className="font-display text-xl leading-snug text-white sm:text-2xl">
                      <Link
                        href={`/projects/${project.slug}`}
                        className="transition-colors hover:text-amber-100"
                      >
                        {project.name}
                      </Link>
                    </h3>
                    {/* Phones show the opening lines; the case study carries the detail. */}
                    <p className="mt-3 max-w-prose text-sm leading-relaxed text-slate-300 max-sm:line-clamp-4">
                      {project.description}
                    </p>
                    {/* One proof line here; every other line is on the case-study page. */}
                    <ul className="mt-4 max-w-prose">
                      <CheckItem>{project.evidence[0]}</CheckItem>
                    </ul>
                    <ul className="mt-5 flex flex-wrap gap-2 max-sm:hidden">
                      {project.technologies.map((tech) => (
                        <li key={tech}>
                          <Tag>{tech}</Tag>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-auto pt-5">
                      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-white/10 pt-4">
                        <Link
                          href={`/projects/${project.slug}`}
                          aria-label={`${project.name}: read the case study`}
                          className="group/link inline-flex items-center gap-2 py-1 text-sm font-medium text-amber-300 hover:text-amber-200"
                        >
                          Read the case study
                          <ArrowRight
                            size={16}
                            aria-hidden="true"
                            className="transition-transform duration-300 group-hover/link:translate-x-1"
                          />
                        </Link>
                        {project.repo ? (
                          <a
                            href={project.repo}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`${project.name}: repository on GitHub`}
                            className="inline-flex items-center gap-1.5 whitespace-nowrap py-1 text-sm font-medium text-amber-300 hover:text-amber-200"
                          >
                            <Github size={15} aria-hidden="true" /> Repo
                          </a>
                        ) : project.liveUrl ? (
                          <a
                            href={project.liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`${project.name}: visit the live site`}
                            className="inline-flex items-center gap-1.5 whitespace-nowrap py-1 text-sm font-medium text-amber-300 hover:text-amber-200"
                          >
                            <Globe size={15} aria-hidden="true" /> Visit
                          </a>
                        ) : (
                          <span className="inline-flex items-center gap-2 text-xs text-slate-400">
                            <Lock size={13} aria-hidden="true" className="shrink-0" />
                            {project.status}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Writing */}
        <WritingShowcase open={isWritingOpen} onToggle={() => setIsWritingOpen((o) => !o)} />

        {/* Experience */}
        <section
          id="experience"
          className="border-t border-white/5 px-4 py-10 sm:px-6 sm:py-16 lg:px-8 scroll-mt-16"
        >
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-x-12 gap-y-2 lg:grid-cols-[1fr,2fr]">
              <div className="lg:sticky lg:top-28 lg:self-start">
                <SectionHeading kicker="Career" title="Professional" italic="experience" />
                <a
                  href={CV_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  type="application/pdf"
                  download
                  className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-2.5 text-sm font-medium text-slate-200 transition-colors hover:border-amber-300/60 hover:text-amber-300 lg:mb-0"
                >
                  <Download size={15} aria-hidden="true" />
                  Download CV (PDF, {CV_VERSION})
                </a>
              </div>

              <div className="space-y-4">
                {experience.map((role) => {
                  const roleKey = role.title + role.company;
                  const isExpanded = expandedRoles.includes(roleKey);
                  return (
                    <article
                      key={roleKey}
                      className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 transition-colors duration-300 hover:border-white/20 sm:p-6"
                    >
                      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h3 className="font-display text-xl text-white">{role.title}</h3>
                          <p className="mt-1 text-sm font-medium text-amber-300/90">{role.company}</p>
                        </div>
                        <span className="rounded-full border border-white/15 px-3 py-1 text-xs tracking-wide text-slate-300">
                          {role.period}
                        </span>
                      </div>
                      {/* Phones show the first highlights, with the rest and the
                          technologies behind "Show more"; wider screens show it all. */}
                      <ul className="max-w-[46rem] space-y-2">
                        {role.highlights.map((item, i) => (
                          <CheckItem
                            key={item}
                            className={
                              i >= HIGHLIGHTS_ON_PHONES && !isExpanded ? 'max-sm:hidden' : undefined
                            }
                          >
                            {item}
                          </CheckItem>
                        ))}
                      </ul>
                      {!isExpanded && (
                        <button
                          type="button"
                          onClick={() => setExpandedRoles((keys) => [...keys, roleKey])}
                          className="mt-1 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-amber-300 hover:text-amber-200 sm:hidden"
                        >
                          Show more
                          <ChevronDown size={16} aria-hidden="true" />
                        </button>
                      )}
                      <ul
                        className={`mt-5 flex flex-wrap gap-2 border-t border-white/10 pt-5 ${
                          isExpanded ? '' : 'max-sm:hidden'
                        }`}
                      >
                        {role.technologies.map((tech) => (
                          <li key={tech}>
                            <Tag>{tech}</Tag>
                          </li>
                        ))}
                      </ul>
                    </article>
                  );
                })}

                <details className="group rounded-2xl border border-white/10 bg-slate-900/40">
                  <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-6 py-3 sm:px-7 [&::-webkit-details-marker]:hidden">
                    <span className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                      <span className="text-xs font-medium uppercase tracking-[0.2em] text-slate-300">
                        Earlier roles
                      </span>
                      <span className="text-sm text-slate-400">{EARLIER_ROLES_SUMMARY}</span>
                    </span>
                    <ChevronDown
                      size={18}
                      aria-hidden="true"
                      className="shrink-0 text-amber-300 transition-transform duration-300 group-open:rotate-180"
                    />
                  </summary>
                  <ul className="space-y-5 px-6 pb-6 pt-1 sm:px-7">
                    {earlierRoles.map((role) => (
                      <li
                        key={role.company}
                        className="grid gap-x-6 gap-y-1 sm:grid-cols-[1fr,auto] sm:items-baseline"
                      >
                        <p className="font-medium text-slate-200">
                          {role.title}
                          <span className="font-normal text-slate-400"> · {role.company}</span>
                        </p>
                        <span className="whitespace-nowrap text-xs tracking-wide text-slate-400">
                          {role.period}
                        </span>
                        <p className="max-w-prose text-sm text-slate-400 sm:col-span-2">
                          {role.scope}
                        </p>
                      </li>
                    ))}
                  </ul>
                </details>
              </div>
            </div>
          </div>
        </section>

        {/* Stack and education */}
        <section id="skills" className="border-t border-white/5 px-4 py-10 sm:px-6 sm:py-16 lg:px-8 scroll-mt-16">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-x-12 gap-y-12 lg:grid-cols-[2fr,1fr]">
              <div>
                <SectionHeading kicker="Capabilities" title="The stack" />
                <dl className="divide-y divide-white/10 rounded-2xl border border-white/10 bg-slate-900/60 px-6">
                  {skillGroups.map((group) => (
                    <div
                      key={group.title}
                      className="py-2.5 text-sm leading-relaxed sm:grid sm:grid-cols-[14.5rem,1fr] sm:gap-x-6 sm:py-3"
                    >
                      {/* Label and list run on as one paragraph on phones. */}
                      <dt className="inline font-semibold text-white sm:flex sm:items-center sm:gap-2.5">
                        <group.icon
                          size={16}
                          aria-hidden="true"
                          className="hidden shrink-0 text-amber-300 sm:block"
                        />
                        {group.title}
                        <span className="sm:hidden">: </span>
                      </dt>
                      <dd className="inline text-slate-300 sm:block">{group.items.join(' · ')}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div>
                <SectionHeading kicker="Background" title="Education" />
                <ul className="divide-y divide-white/10 rounded-2xl border border-white/10 bg-slate-900/60 px-6">
                  {education.map((item) => (
                    <li key={item.program} className="py-3 sm:py-3.5">
                      <p className="text-sm font-semibold text-white">{item.program}</p>
                      <p className="mt-1 text-sm text-slate-400">
                        {item.school} · {item.year}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section
          id="contact"
          className="relative overflow-hidden border-t border-white/5 px-4 py-10 sm:px-6 sm:py-16 lg:px-8 scroll-mt-16"
        >
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-amber-400/10 blur-3xl" />
          </div>
          <div className="relative mx-auto max-w-7xl">
            <div className="grid gap-x-12 gap-y-8 lg:grid-cols-[1fr,1.15fr]">
              <div>
                <SectionHeading
                  kicker="Contact"
                  title="Start a"
                  italic="conversation"
                  sub="Open to conversations about AI engineering and AI quality roles. The form goes straight to my inbox."
                />
                <ul className="divide-y divide-white/10 rounded-2xl border border-white/10 bg-slate-900/60">
                  {contactRows.map((row) => {
                    const body = (
                      <>
                        <row.icon size={18} aria-hidden="true" className="shrink-0 text-slate-400" />
                        <span className="w-20 shrink-0 text-xs uppercase tracking-[0.18em] text-slate-400">
                          {row.label}
                        </span>
                        <span
                          className={`min-w-0 break-words text-sm ${
                            row.href
                              ? 'font-medium text-amber-300 underline decoration-amber-300/40 underline-offset-4 group-hover:text-amber-200'
                              : 'text-slate-300'
                          }`}
                        >
                          {row.value}
                        </span>
                      </>
                    );
                    return (
                      <li key={row.label}>
                        {row.href ? (
                          <a
                            href={row.href}
                            {...(row.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                            className="group flex min-h-14 items-center gap-4 px-5 py-2"
                          >
                            {body}
                          </a>
                        ) : (
                          <div className="flex min-h-14 items-center gap-4 px-5 py-2">{body}</div>
                        )}
                      </li>
                    );
                  })}
                </ul>
                <p className="mt-5 text-sm leading-relaxed text-slate-400">
                  Typically replies within 24 hours. For anything sensitive, email is best.
                </p>
              </div>

              <Card
                id="contact-form"
                className="scroll-mt-24 rounded-2xl border-white/10 bg-slate-900/60"
              >
                <CardHeader>
                  <CardTitle className="font-display text-2xl text-white">Get in touch</CardTitle>
                  <CardDescription className="text-slate-400">
                    All three fields are required.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {status === 'success' && (
                    <Alert
                      role="status"
                      aria-live="polite"
                      className="mb-6 border-emerald-800 bg-emerald-950/50 text-emerald-200"
                    >
                      <p className="font-medium">Message sent</p>
                      <p>Thanks for getting in touch — I&apos;ll reply to you by email.</p>
                    </Alert>
                  )}

                  {status === 'error' && (
                    <Alert
                      aria-live="assertive"
                      className="mb-6 border-red-900 bg-red-950/50 text-red-200"
                    >
                      <p className="font-medium">Message not sent</p>
                      <p>
                        {errorMessage} You can email me directly at{' '}
                        <a href={`mailto:${EMAIL}`} className="underline font-medium">
                          {EMAIL}
                        </a>
                        .
                      </p>
                    </Alert>
                  )}

                  {!isFormEnabled && (
                    <Alert
                      aria-live="polite"
                      className="mb-6 border-amber-800 bg-amber-950/40 text-amber-200"
                    >
                      <p className="font-medium">Contact form unavailable</p>
                      <p>
                        Please email me directly at{' '}
                        <a href={`mailto:${EMAIL}`} className="underline font-medium">
                          {EMAIL}
                        </a>
                        .
                      </p>
                    </Alert>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Honeypot: hidden from people, filled by bots — Web3Forms rejects those. */}
                    <input
                      type="checkbox"
                      name="botcheck"
                      className="hidden"
                      tabIndex={-1}
                      autoComplete="off"
                    />
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-slate-300">
                        Name *
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        autoComplete="name"
                        disabled={!isFormEnabled || status === 'submitting'}
                        placeholder="Your name"
                        className="border-white/15 bg-slate-950/60 text-white placeholder:text-slate-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-slate-300">
                        Email *
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        autoComplete="email"
                        disabled={!isFormEnabled || status === 'submitting'}
                        placeholder="you@example.com"
                        className="border-white/15 bg-slate-950/60 text-white placeholder:text-slate-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message" className="text-slate-300">
                        Message *
                      </Label>
                      <Textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        required
                        disabled={!isFormEnabled || status === 'submitting'}
                        rows={3}
                        className="resize-none border-white/15 bg-slate-950/60 text-white placeholder:text-slate-500"
                        placeholder="Your message..."
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={!isFormEnabled || status === 'submitting'}
                      className="w-full bg-amber-300 py-6 text-base font-semibold text-slate-950 hover:bg-amber-200"
                    >
                      {status === 'submitting' ? (
                        <>
                          <Loader2 className="animate-spin" />
                          Sending...
                        </>
                      ) : (
                        'Send message'
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
