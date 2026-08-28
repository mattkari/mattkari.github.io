'use client';

import React, { useState } from 'react';
import {
  Menu,
  X,
  Mail,
  MapPin,
  Terminal,
  Check,
  Bot,
  Monitor,
  Globe,
  Github,
  Linkedin,
  Briefcase,
  GraduationCap,
  Database,
  GitBranch,
  Cloud,
  Layers,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert } from '@/components/ui/alert';

const LINKEDIN_URL = 'https://www.linkedin.com/in/mattkari';
const GITHUB_URL = 'https://github.com/mattkari';
const EMAIL = 'mattkarimov@outlook.com';
const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit';

type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

export default function Home() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [status, setStatus] = useState<FormStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  // Injected at build time from the WEB3FORMS_ACCESS_KEY repo secret. Without it
  // there is nowhere for submissions to go, so the form renders in a disabled
  // state pointing at the email address instead of failing silently.
  const accessKey = process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY;
  const isFormEnabled = Boolean(accessKey);

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'About', href: '#about' },
    { name: 'Projects', href: '#projects' },
    { name: 'Skills', href: '#skills' },
    { name: 'Experience', href: '#experience' },
    { name: 'Education', href: '#education' },
    { name: 'Contact', href: '#contact' },
  ];

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
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
    'Source-grounded RAG — page-level citations, honest refusal',
    'MCP servers connecting LLM tooling to real systems',
    'PhD-level source analysis (Durham, 2017)',
    'Banking QA: API, Kafka, database & UI validation',
    'Payments domain (SEPA & Instant Payments)',
    'CI/CD, Docker & self-hosted deployment on ARM',
  ];

  const skillGroups = [
    {
      icon: Bot,
      title: 'AI & LLM Engineering',
      items: ['Python', 'RAG pipelines', 'Embeddings & vector retrieval', 'pgvector', 'Prompt design', 'MCP servers', 'Claude / Anthropic API', 'Streamlit', 'LLM evaluation & grounding checks'],
    },
    {
      icon: Terminal,
      title: 'Programming & Frameworks',
      items: ['Java (OOP)', 'Ruby', 'TestNG', 'JUnit', 'Cucumber BDD', 'JBehave'],
    },
    {
      icon: Layers,
      title: 'API & Integration Testing',
      items: ['REST Assured', 'Karate', 'Postman', 'REST APIs', 'JSON / XML', 'Kafka event validation'],
    },
    {
      icon: Monitor,
      title: 'Test & UI Automation',
      items: ['Selenium WebDriver', 'Playwright', 'Page Object Model', 'BDD / TDD', 'E2E & exploratory'],
    },
    {
      icon: Database,
      title: 'Database Testing',
      items: ['SQL', 'MongoDB'],
    },
    {
      icon: GitBranch,
      title: 'CI/CD & Version Control',
      items: ['Jenkins', 'GitLab CI/CD', 'Maven', 'Docker', 'Kubernetes', 'Git', 'GitLab', 'Bitbucket'],
    },
    {
      icon: Cloud,
      title: 'Cloud & Architecture',
      items: ['AWS (EC2)', 'Microservices', 'Distributed Systems'],
    },
    {
      icon: Briefcase,
      title: 'Domain & Methodology',
      items: ['Financial Services', 'Payments & Banking', 'Agile Scrum', 'SDLC / STLC', 'Jira'],
    },
  ];

  const experience = [
    {
      title: 'Test Automation Engineer',
      company: 'Barclays Investment Bank, UK',
      period: '02/2026 – Present',
      highlights: [
        'Developed multiple MCP (Model Context Protocol) servers connecting LLM tooling to internal systems, including SQL, Atlassian, GitLab, and Playwright integrations',
        'Built a Karate Test Assistant RAG tool grounded in framework docs and test code to support API test authoring and debugging',
        'Architected UI test automation using Playwright with Java for a global investment bank platform',
        'Built the Karate Framework for API testing, streamlining backend and service-level test coverage',
      ],
      technologies: ['Playwright', 'Java', 'Karate Framework', 'MCP', 'RAG', 'SQL', 'GitLab'],
    },
    {
      title: 'Quality Automation Specialist',
      company: 'NatWest Group, UK',
      period: '02/2022 – 01/2026',
      highlights: [
        "Led testing of NatWest's ICON IPF (Integration Processing Framework) platform for 3+ years, becoming a subject matter expert in integration framework testing and payment processing workflows",
        'Enhanced the IPF test framework by introducing the REST Assured library for API testing and implementing the Strategy Pattern to improve maintainability and code reusability',
        'Built and maintained automation frameworks covering backend, API, and database testing for SEPA and instant payment systems',
        'Spearheaded a BDD automation approach using JBehave and Cucumber, translating JIRA business requirements into executable test scenarios',
        'Integrated automated tests into CI/CD pipelines using Jenkins and GitLab CI/CD for continuous testing and rapid feedback',
        'Pioneered integrating the test framework with Docker and Kubernetes for consistent, containerized test environments',
      ],
      technologies: ['ICON IPF', 'Java', 'Selenium', 'JBehave', 'Cucumber BDD', 'JUnit', 'REST Assured', 'SQL', 'Docker', 'Kubernetes', 'Jenkins', 'GitLab CI/CD'],
    },
    {
      title: 'QA Automation Engineer',
      company: 'Amplience, UK',
      period: '04/2021 – 01/2022',
      highlights: [
        'Designed and implemented a test automation framework using Java, Selenium WebDriver, Cucumber BDD, TestNG, and the Page Object Model',
        'Integrated automated tests into CI/CD build processes using Jenkins on AWS EC2',
        'Conducted API testing with REST Assured and Postman, validating REST APIs and JSON schemas',
        'Performed database testing with MongoDB, verifying data consistency and integrity across integrated systems',
        'Executed exploratory, integration, E2E, smoke, regression, and UI testing across the product',
      ],
      technologies: ['Java', 'Ruby', 'Selenium', 'Cucumber BDD', 'TestNG', 'REST Assured', 'Postman', 'MongoDB', 'Jenkins', 'AWS EC2'],
    },
    {
      title: 'Complaints Manager (Testing & Validation Focus)',
      company: 'Lloyds Banking Group, UK',
      period: '11/2017 – 01/2021',
      highlights: [
        'Led manual and automated testing of banking redress calculators for Asset Finance Payment Protection Insurance claims',
        'Performed SQL database testing and data-driven validation to improve accuracy of claim processes',
        'Served as Subject Matter Expert in redress calculations, training team members on testing best practices',
      ],
      technologies: ['Manual Testing', 'SQL', 'Financial Services', 'Outcome Testing'],
    },
    {
      title: 'Quality Assurance Representative',
      company: 'HSBC, Leeds, UK',
      period: '05/2017 – 11/2017',
      highlights: [
        'Conducted manual testing, verification, and validation on complex financial calculators for PPI complaints',
        'Performed SQL database testing and data reviews to ensure accuracy in the banking domain',
      ],
      technologies: ['Manual Testing', 'SQL', 'Banking Compliance'],
    },
  ];

  const stats = [
    { value: '5+', label: 'Years in Banking QA & Test Automation' },
    { value: 'PhD', label: 'Durham University, 2017' },
    { value: '3', label: 'LLM-Integrated Systems Built' },
    { value: `${skillGroups.reduce((total, group) => total + group.items.length, 0)}+`, label: 'Tools & Technologies' },
  ];

  const projects = [
    {
      name: 'Source-Grounded RAG Research Assistant',
      tag: 'Flagship · Open source',
      repo: 'https://github.com/mattkari/source-grounded-rag',
      repoLabel: 'github.com/mattkari/source-grounded-rag',
      liveUrl: null,
      liveLabel: '',
      description:
        'A scholarly research assistant built to reduce and expose hallucination. It answers only from an authorised corpus, cites at printed-page level, separates AI interpretation from source claims, and refuses plainly when evidence is insufficient — refusal phrased as a statement about the collection, not the world.',
      evidence: [
        'Live-verified behaviour: an answerable question returned SUFFICIENT with 7 definitions cited across 5 page ranges; an out-of-corpus question was refused as retrieval scores collapsed from 0.77 to 0.11',
        'Presented at ITCC-2026 (conference deck + speaker notes)',
        'Corpus swapped Sönmez → my own 288-page PhD thesis (294 chunks) via a branch and PR — the architecture is corpus-agnostic by design',
      ],
      status: 'In use for my own research; Medium case study in progress',
      technologies: ['Python', 'Retrieval & embeddings', 'Anthropic API', 'Streamlit', 'Docker', 'Evaluation'],
    },
    {
      name: 'Family Finance — Self-Hosted on Raspberry Pi 5',
      tag: 'Private repo · Home infrastructure',
      repo: null,
      repoLabel: '',
      liveUrl: null,
      liveLabel: '',
      description:
        'A self-hosted household finance system that replaced a Google Sheets workflow: FastAPI, PostgreSQL/pgvector, Redis + Celery, React, deployed with Docker Compose on a Raspberry Pi 5. Six bank-statement formats are parsed with each row reconciled against the statement\u2019s own totals; transfers between the household\u2019s own accounts are detected and excluded so moving money is never counted as income.',
      evidence: [
        '354 backend and 214 frontend tests green in CI (repo is private — figures from the repository)',
        'One real month verified: £9,174.62 of internal transfers correctly excluded from spending and income',
        'HTTPS from a private CA on the home network; nightly paired backups of database and statement PDFs',
      ],
      status: 'Private by design (household financial data) — happy to walk through the architecture',
      technologies: ['FastAPI', 'PostgreSQL + pgvector', 'Celery', 'React', 'Docker', 'Raspberry Pi'],
    },
    {
      name: 'AI-Assisted Crypto Trading Bot — Live on Raspberry Pi 5',
      tag: 'Private repo · Live 24/7 deployment',
      repo: null,
      repoLabel: '',
      liveUrl: null,
      liveLabel: '',
      description:
        'A position-aware trading bot for Binance Spot, dockerised and running continuously on a Raspberry Pi 5. A dual-mode strategy engine (trend-following in bull regimes, mean-reversion in bear) sits behind three mandatory macro gates and eight technical indicators, with ATR-based stops and three-tranche scaled exits. An LLM analyst (GLM via the Z.AI API) arbitrates borderline signals — but only borderline ones, and only at 80%+ stated confidence; hard RSI risk guards are rules the AI can never override. Two-way Telegram control for start/stop/status/live signals from a phone.',
      evidence: [
        'Live Docker container with auto-restart, health checks and a 256MB memory limit — verified running on the Pi',
        'Backtester mirrors the live strategy logic exactly and replays full history in under 4 seconds on the Pi',
        'The AI is confidence-gated by design: it receives a 24-candle market summary and can only move borderline rule scores (3\u20135/7), never bypass a risk guard',
      ],
      status: 'Private (live trading and API keys) — architecture walkthrough on request',
      technologies: ['Python', 'ccxt / Binance Spot', 'GLM (Z.AI API)', 'Telegram Bot API', 'Docker', 'Raspberry Pi'],
    },
    {
      name: 'EcoHaven Boots — Live E-Commerce Platform',
      tag: 'In production · Real small business',
      repo: null,
      repoLabel: '',
      liveUrl: 'https://ecohavenboots.co.uk',
      liveLabel: 'ecohavenboots.co.uk',
      description:
        'A production e-commerce platform for a handmade leather baby boots business — customer storefront with search and filtering, cart, and Stripe checkout in GBP; an admin panel for product, order and media management behind iron-session auth. Built with Next.js 14 (App Router, server components) and TypeScript over Prisma, deployed as a Docker multi-stage build behind Nginx and a Cloudflare Tunnel, running on the Raspberry Pi 5.',
      evidence: [
        'Live right now at ecohavenboots.co.uk — a real public URL, not a screenshot',
        'Payments correctness hardened in documented phases: Stripe webhook idempotency and payment_status gating, stock decrement on capture, consistent GBP pricing and shipping thresholds',
        'Security hardening shipped: upload type validation and path-traversal sanitisation, required session secret (no fallback), 50MB body limits, sameSite cookies',
        'Documented REST API surface: products, orders, admin auth, file upload, Stripe webhooks',
      ],
      status: 'Operating in production for a real business — source private',
      technologies: ['Next.js 14', 'TypeScript', 'Prisma', 'Stripe', 'Docker', 'Nginx', 'Cloudflare Tunnel', 'Raspberry Pi'],
    },
  ];

  const education = [
    {
      program: 'Full Stack Automation Tester (SDET) Program',
      school: 'Cydeo, Virginia, USA',
      year: '2020',
    },
    {
      program: 'PhD in Governance and International Affairs',
      school: 'Durham University, UK',
      year: '2018',
    },
    {
      program: 'MA in Public Administration',
      school: 'JMI Central University, New Delhi, India',
      year: '2006',
    },
    {
      program: 'BA in Legal Studies',
      school: 'TIU University, Tashkent, Uzbekistan',
      year: '2003',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-background">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:bg-blue-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-md"
      >
        Skip to main content
      </a>

      {/* Navigation */}
      <nav aria-label="Primary" className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-blue-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">MK</span>
              </div>
              <span className="font-semibold text-lg text-blue-900 hidden sm:block">
                Matt Karimov
              </span>
            </div>

            <div className="hidden md:flex items-center space-x-6">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-blue-800 hover:text-blue-600 transition-colors font-medium"
                >
                  {link.name}
                </a>
              ))}
              <Button
                onClick={() => scrollTo('contact-form')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Get In Touch
              </Button>
            </div>

            <button
              className="md:hidden text-blue-800 hover:text-blue-600"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-blue-100">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-blue-800 hover:text-blue-600 hover:bg-blue-50"
                >
                  {link.name}
                </a>
              ))}
              <div className="px-3 py-2">
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    scrollTo('contact-form');
                  }}
                >
                  Get In Touch
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>

      <main id="main-content">
      {/* Hero */}
      <section id="home" className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8 flex justify-center">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-4xl">MK</span>
            </div>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-blue-900 mb-6">
            Matt Karimov
          </h1>

          <p className="text-xl sm:text-2xl text-blue-700 mb-4 font-medium">
            Test Automation Engineer moving into AI Engineering
          </p>

          <p className="text-lg text-blue-800/80 mb-12 max-w-3xl mx-auto leading-relaxed">
            I build systems whose answers show their evidence. Five years of banking
            test automation at Barclays Investment Bank and NatWest — API, Kafka,
            database and UI validation — now combined with hands-on LLM engineering:
            a source-grounded RAG research assistant with page-level citations and
            honest refusal, presented at ITCC-2026. PhD, Durham University. Based in
            Manchester, United Kingdom.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg"
              onClick={() => scrollTo('contact-form')}
            >
              Get In Touch
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-blue-600 text-blue-700 hover:bg-blue-50 px-8 py-6 text-lg"
              onClick={() => scrollTo('experience')}
            >
              View Experience
            </Button>
          </div>

          <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl sm:text-4xl font-bold text-blue-600">{stat.value}</p>
                <p className="text-sm text-blue-800/70 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-blue-900 mb-4">About Me</h2>
            <div className="w-24 h-1 bg-blue-600 mx-auto"></div>
          </div>

          <div className="max-w-4xl mx-auto text-center space-y-6">
            <p className="text-lg text-blue-800 leading-relaxed">
              My path to AI engineering runs through evidence. A PhD on the Qur'anic
              concept of justice (Durham, 2017) trained me to separate what a source
              says from what I infer — the exact discipline a trustworthy LLM system
              needs. Five years in banking QA taught me what regulated systems demand:
              traceability, reconciliation, and claims you can verify. I am now
              building AI systems with the same standard — grounded in authorised
              sources, citing at page level, and refusing when the evidence runs out.
            </p>
            <p className="text-lg text-blue-800 leading-relaxed">
              Day to day I am a Test Automation Engineer at Barclays Investment Bank,
              building MCP servers that connect LLM tooling to internal systems and a
              RAG test assistant for API test authoring. Outside work I build and
              self-host my own systems on a Raspberry Pi 5 — including a multi-bank
              statement ingestion pipeline with per-row reconciliation. My target for
              2026: an AI engineering role where source grounding, evaluation and
              honesty about limits are the product, not an afterthought.
            </p>

            <div className="pt-4 flex flex-wrap justify-center gap-3">
              <Button
                variant="outline"
                className="border-blue-600 text-blue-700 hover:bg-blue-50"
                onClick={() => window.open(LINKEDIN_URL, '_blank', 'noopener noreferrer')}
              >
                <Linkedin size={18} className="mr-2" />
                LinkedIn Profile
              </Button>
              <Button
                variant="outline"
                className="border-blue-600 text-blue-700 hover:bg-blue-50"
                onClick={() => window.open(GITHUB_URL, '_blank', 'noopener noreferrer')}
              >
                <Github size={18} className="mr-2" />
                GitHub Profile
              </Button>
            </div>

            <div className="flex flex-wrap justify-center gap-3 pt-8">
              {differentiators.map((item) => (
                <Badge
                  key={item}
                  className="bg-blue-100 text-blue-800 hover:bg-blue-200 text-sm py-2 px-4"
                >
                  {item}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Projects */}
      <section id="projects" className="py-20 px-4 sm:px-6 lg:px-8 bg-blue-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-blue-900 mb-4">
              Selected Projects — AI Systems With Evidence
            </h2>
            <div className="w-24 h-1 bg-blue-600 mx-auto"></div>
            <p className="text-blue-800/70 mt-4 max-w-2xl mx-auto">
              Every claim below is backed by a repo, a verified run, or a public
              presentation — the standard I apply to the systems themselves.
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            {projects.map((project) => (
              <Card key={project.name} className="border-blue-200 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                    <div>
                      <CardTitle className="text-blue-900">{project.name}</CardTitle>
                      <CardDescription className="text-blue-700 font-medium">
                        {project.tag}
                      </CardDescription>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                    {project.repo && (
                      <a
                        href={project.repo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-600 font-medium text-sm whitespace-nowrap self-start sm:self-auto"
                      >
                        <Github size={16} />
                        {project.repoLabel}
                      </a>
                    )}
                    {project.liveUrl && (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-600 font-medium text-sm whitespace-nowrap self-start sm:self-auto"
                      >
                        <Globe size={16} />
                        {project.liveLabel}
                      </a>
                    )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-blue-800 leading-relaxed mb-5">{project.description}</p>
                  <ul className="space-y-3 mb-5">
                    {project.evidence.map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <Check className="text-blue-600 mt-1 flex-shrink-0" size={18} />
                        <span className="text-blue-800">{item}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-sm text-blue-600 font-medium mb-4">{project.status}</p>
                  <div className="flex flex-wrap gap-2 pt-4 border-t border-blue-100">
                    {project.technologies.map((tech) => (
                      <Badge key={tech} variant="secondary" className="bg-blue-100 text-blue-800 font-normal">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Skills */}
      <section id="skills" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-blue-900 mb-4">Core Technical Skills</h2>
            <div className="w-24 h-1 bg-blue-600 mx-auto"></div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {skillGroups.map((group) => (
              <Card key={group.title} className="border-blue-200 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <group.icon className="text-blue-600" size={24} />
                  </div>
                  <CardTitle className="text-blue-900 text-lg">{group.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {group.items.map((item) => (
                      <Badge key={item} variant="secondary" className="bg-blue-100 text-blue-800 font-normal">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Experience */}
      <section id="experience" className="py-20 px-4 sm:px-6 lg:px-8 bg-blue-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-blue-900 mb-4">Professional Experience</h2>
            <div className="w-24 h-1 bg-blue-600 mx-auto"></div>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            {experience.map((role) => (
              <Card key={role.title + role.company} className="border-blue-200 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Briefcase className="text-blue-600" size={22} />
                      </div>
                      <div>
                        <CardTitle className="text-blue-900">{role.title}</CardTitle>
                        <CardDescription className="text-blue-700 font-medium">
                          {role.company}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline" className="border-blue-300 text-blue-700 whitespace-nowrap self-start sm:self-auto">
                      {role.period}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {role.highlights.map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <Check className="text-blue-600 mt-1 flex-shrink-0" size={18} />
                        <span className="text-blue-800">{item}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex flex-wrap gap-2 pt-5 mt-5 border-t border-blue-100">
                    {role.technologies.map((tech) => (
                      <Badge key={tech} variant="secondary" className="bg-blue-50 text-blue-700 font-normal">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Education */}
      <section id="education" className="py-20 px-4 sm:px-6 lg:px-8 bg-blue-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-blue-900 mb-4">
              Education &amp; Professional Development
            </h2>
            <div className="w-24 h-1 bg-blue-600 mx-auto"></div>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {education.map((item) => (
              <Card key={item.program} className="border-blue-200 hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <GraduationCap className="text-blue-600" size={24} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-blue-900 mb-1">{item.program}</h3>
                      <p className="text-blue-700 text-sm">{item.school}</p>
                      <p className="text-blue-600 text-sm">{item.year}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-blue-900 mb-4">Contact</h2>
            <div className="w-24 h-1 bg-blue-600 mx-auto"></div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="space-y-6">
              <Card className="border-blue-200 hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Mail className="text-blue-600" size={24} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-blue-900 mb-1">Email</h3>
                      <a
                        href={`mailto:${EMAIL}`}
                        className="text-blue-700 hover:text-blue-600"
                      >
                        {EMAIL}
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-blue-200 hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Linkedin className="text-blue-600" size={24} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-blue-900 mb-1">LinkedIn</h3>
                      <a
                        href={LINKEDIN_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-700 hover:text-blue-600"
                      >
                        linkedin.com/in/mattkari
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-blue-200 hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Github className="text-blue-600" size={24} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-blue-900 mb-1">GitHub</h3>
                      <a
                        href={GITHUB_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-700 hover:text-blue-600"
                      >
                        github.com/mattkari
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-blue-200 hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin className="text-blue-600" size={24} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-blue-900 mb-1">Location</h3>
                      <p className="text-blue-700">Manchester, England</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card id="contact-form" className="border-blue-200 scroll-mt-24">
              <CardHeader>
                <CardTitle className="text-blue-900">Get In Touch</CardTitle>
                <CardDescription className="text-blue-700">
                  Send a message via the contact form — typically replies within 24 hours
                </CardDescription>
              </CardHeader>
              <CardContent>
                {status === 'success' && (
                  <Alert
                    role="status"
                    aria-live="polite"
                    className="mb-6 bg-green-50 border-green-200 text-green-800"
                  >
                    <p className="font-medium">Message sent</p>
                    <p>Thanks for getting in touch — I&apos;ll reply to you by email.</p>
                  </Alert>
                )}

                {status === 'error' && (
                  <Alert
                    aria-live="assertive"
                    className="mb-6 bg-red-50 border-red-200 text-red-800"
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
                    className="mb-6 bg-amber-50 border-amber-200 text-amber-900"
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

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Honeypot: hidden from people, filled by bots — Web3Forms rejects those. */}
                  <input
                    type="checkbox"
                    name="botcheck"
                    className="hidden"
                    tabIndex={-1}
                    autoComplete="off"
                  />
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-blue-900">Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      disabled={!isFormEnabled || status === 'submitting'}
                      placeholder="Your name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-blue-900">Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      disabled={!isFormEnabled || status === 'submitting'}
                      placeholder="you@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-blue-900">Message *</Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      disabled={!isFormEnabled || status === 'submitting'}
                      rows={5}
                      className="resize-none"
                      placeholder="Your message..."
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={!isFormEnabled || status === 'submitting'}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg"
                  >
                    {status === 'submitting' ? (
                      <>
                        <Loader2 className="animate-spin" />
                        Sending...
                      </>
                    ) : (
                      'Send Message'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      </main>

      {/* Footer */}
      <footer className="bg-blue-950 text-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-2xl">MK</span>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold mb-2">Matt Karimov</h3>
              <p className="text-blue-300">Test Automation Engineer → AI Engineer</p>
            </div>

            <div className="flex flex-wrap justify-center gap-8 text-blue-200">
              <a
                href={LINKEDIN_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-100 transition-colors inline-flex items-center gap-2"
              >
                <Linkedin size={16} />
                LinkedIn
              </a>
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-100 transition-colors inline-flex items-center gap-2"
              >
                <Github size={16} />
                GitHub
              </a>
              <a
                href={`mailto:${EMAIL}`}
                className="hover:text-blue-100 transition-colors inline-flex items-center gap-2"
              >
                <Mail size={16} />
                {EMAIL}
              </a>
            </div>

            <div className="pt-6 border-t border-blue-800">
              <p className="text-blue-400 text-sm">
                © {new Date().getFullYear()} Matt Karimov. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
