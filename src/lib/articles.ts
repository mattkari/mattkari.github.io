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
    slug: 'gated-rag-test-generation',
    title: 'Two Gates and a Rule: Building a Review-Only RAG Pipeline That Drafts API and UI Tests',
    summary:
      'A LangGraph pipeline that gathers test evidence through local, read-only MCP servers in Docker, puts two human gates around it and blocks generation when evidence is missing. The open questions it writes turned out to be a ready agenda for the business analyst.',
    date: '2026-10-30',
    readingMinutes: 15,
    tags: ['LangGraph', 'RAG', 'MCP', 'Test automation', 'AI quality'],
  },
  {
    slug: 'uzbek-alphabet-ai-tokens',
    title: "Does Uzbekistan's new alphabet make AI cheaper? I measured it",
    summary:
      "The new 28-letter Uzbek alphabet swaps oʻ, gʻ, sh and ch for ö, ğ, ş and ç. Across seven AI tokenizers the token saving is 0 to 7%, and which apostrophe you type matters as much as the reform. The real gain is one spelling per word.",
    date: '2026-10-27',
    readingMinutes: 5,
    tags: ['LLM', 'Tokenization', 'Uzbek', 'AI cost'],
  },
  {
    slug: 'supervised-claude-code-sessions',
    title: 'Three Claude Code Sessions, One Orchestrator, One Auditor: My Day-to-Day AI Workflow as a Test Automation Engineer',
    summary:
      'Three parallel Claude Code sessions (a PowerShell orchestrator plus Karate and Playwright specialists), Opus for planning and Sonnet or Haiku for coding, an end-of-day compile into a shared wiki, and Microsoft Copilot as the auditor.',
    date: '2026-10-24',
    readingMinutes: 10,
    tags: ['Claude Code', 'AI workflow', 'Test automation', 'Second brain'],
  },
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
