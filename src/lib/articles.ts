// Single source of truth for the Writing section. Add a new article here after
// placing its static HTML at public/articles/<slug>/index.html.
export type Article = {
  slug: string;
  title: string;
  summary: string;
  date: string; // ISO yyyy-mm-dd
  readingMinutes: number;
  tags: string[];
};

export const articles: Article[] = [
  {
    slug: 'playwright-java-real-api-traffic',
    title: 'Testing the Screen and the Services Behind It: Real API Traffic in Playwright Java',
    summary:
      'waitForResponse, a NetworkRecorder and ten API + UI patterns against real microservices, organised around three ways of working: seed via API and validate via UI, trigger via UI and capture the call, seed via UI and validate the flow.',
    date: '2026-10-24',
    readingMinutes: 29,
    tags: ['Playwright', 'Java', 'API testing', 'Test automation'],
  },
  {
    slug: 'crypto-signal-engine',
    title:
      'I turned my crypto trading bot into a signal engine that cannot trade. Here\'s how it reads BTC, ETH and ADA',
    summary:
      'A read-only signal engine on a Raspberry Pi: indicators, three gates and a condition score, a Telegram bot, live data from 23 Oct 2026, tests that prove it cannot trade, and two bugs found while writing it up.',
    date: '2026-10-23',
    readingMinutes: 11,
    tags: ['Python', 'Telegram bot', 'Testing', 'Crypto'],
  },
  {
    slug: 'claude-code-second-brain',
    title:
      'How I built a "second brain" for test automation with Claude Code and Obsidian (and tested it like a QA engineer)',
    summary:
      'A Karpathy-style LLM knowledge base: rough notes compiled into a linked, cited wiki, a guard that stops secrets reaching the model, and the seven QA checks I ran on it.',
    date: '2026-10-22',
    readingMinutes: 20,
    tags: ['Claude Code', 'Obsidian', 'LLM evaluation', 'Test automation'],
  },
  {
    slug: 'ai-agent-dental-insurance-claim',
    title: 'How I let an AI agent file my dental insurance claim (without giving it my password)',
    summary:
      'Letting a browser agent fill in a claim portal safely: a password vault the agent can use but never read, evidence first, honest classification, and a human on the Submit button.',
    date: '2026-10-18',
    readingMinutes: 8,
    tags: ['AI agents', 'Browser automation', 'Security'],
  },
];

export const sortedArticles = [...articles].sort((a, b) => b.date.localeCompare(a.date));

export function formatDate(iso: string): string {
  return new Date(iso + 'T00:00:00Z').toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}
