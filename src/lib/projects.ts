// Single source of truth for the Projects section. The home-page cards and the
// /projects/<slug> case-study pages both read this list.
//
// Every statement in a case study must already be backed by something public
// or verified: the project's repository, a published article on this site, or
// the evidence lines below. `source` says which, and is shown on the page.

export type ProjectStep = { title: string; detail: string };
export type ProjectLayer = { label: string; items: string[] };
export type ProjectFigure = { src: string; alt: string; caption: string };

export type Project = {
  slug: string;
  name: string;
  tag: string;
  /**
   * False for a project that has a case-study page but no card on the home
   * page, for example one with nothing that can be shown.
   */
  listed?: boolean;
  /** The full capture, shown on the case-study page. Absent when nothing can be shown. */
  image?: string;
  /**
   * A 2:1 crop of `image` for the home-page card, cut where the text is
   * readable. Crops only: nothing is drawn or added.
   */
  cardImage?: string;
  /** The text in the card's window title bar. */
  frameLabel?: string;
  imageAlt?: string;
  repo: string | null;
  liveUrl?: string;
  description: string;
  evidence: string[];
  status: string;
  technologies: string[];
  caseStudy: {
    /** One or two sentences under the title. */
    summary: string;
    /** Where the facts on the page come from. */
    source: string;
    imageCaption?: string;
    background: string[];
    /** An ordered pipeline, when the order is documented. */
    steps?: { heading: string; intro?: string; items: ProjectStep[] };
    /** The parts of the system, grouped, when only the parts are documented. */
    layers?: { heading: string; items: ProjectLayer[] };
    details?: { heading: string; items: string[] }[];
    limits?: string[];
    figures?: ProjectFigure[];
    /** A short note above the evidence list, when its lines need dating. */
    evidenceNote?: string;
    /** Slugs from src/lib/articles.ts. */
    relatedArticles?: string[];
  };
};

export const projects: Project[] = [
  {
    slug: 'source-grounded-rag',
    name: 'Source-Grounded RAG Research Assistant',
    tag: 'Flagship · Open source',
    image: '/images/projects/sgrag.png',
    cardImage: '/images/projects/cards/source-grounded-rag.png',
    frameLabel: 'source-grounded-rag',
    imageAlt: 'The source-grounded research assistant answering a question with page-level citations',
    repo: 'https://github.com/mattkari/source-grounded-rag',
    description:
      'A scholarly research assistant built to reduce and expose hallucination. It answers only from an authorised corpus, cites at printed-page level, separates AI interpretation from source claims, and refuses plainly when evidence is insufficient.',
    evidence: [
      'Verified live: an answerable question returned 7 cited definitions across 5 page ranges; an out-of-corpus question was refused as retrieval scores collapsed from 0.77 to 0.11',
      'Presented at ITCC-2026 (conference deck and speaker notes)',
      'Corpus swapped to my own 288-page PhD thesis via a branch and PR — corpus-agnostic by design',
    ],
    status: 'In use for my own research',
    technologies: ['Python', 'Retrieval', 'Anthropic API', 'Streamlit', 'Docker', 'Evaluation'],
    caseStudy: {
      summary:
        'A research prototype that answers questions only from an authorised collection, cites the printed page behind every claim, and says so plainly when the collection does not hold the evidence.',
      source: 'The public repository and its README.',
      imageCaption:
        'An answer in the web interface: the limits of the answer, the assistant’s own interpretation in a separate labelled callout, and sources resolved to printed pages.',
      background: [
        'The prototype investigates whether retrieval-augmented generation can support scholarly research and literature reviews while reducing AI-generated hallucination, and while helping a researcher detect it. It is a research assistant rather than a general-purpose chatbot.',
        'Its central commitment is source-grounded refusal: when the collection does not contain sufficient evidence, the system says so instead of filling the gap from the model’s general knowledge. The AI analyses; the researcher decides.',
        'The collection is currently one doctoral thesis, my own (Durham, 288 pages). It is intentionally small for a conference demonstration, and the pipeline does not depend on it: which document is indexed, and the layout constants needed to extract it, are a profile in the configuration.',
      ],
      steps: {
        heading: 'How an answer is produced',
        intro:
          'One pipeline serves all three entry points (a web interface, an interactive command line and a single-question command), so the same question gives the same retrieval diagnostics and the same sufficiency verdict in each.',
        items: [
          {
            title: 'Ingest',
            detail:
              'The PDF is extracted page by page, keeping the page number actually printed on each page and its running header. A page whose printed number cannot be resolved is flagged rather than guessed.',
          },
          {
            title: 'Chunk',
            detail:
              'Text is split within chapter and section boundaries into chunks of about 700 tokens with 15% overlap. The current collection is 288 pages in 266 chunks.',
          },
          {
            title: 'Embed',
            detail:
              'Each chunk is embedded with text-embedding-3-large. Embedding and generation are two separate model roles with two separate keys.',
          },
          {
            title: 'Retrieve',
            detail:
              'A question is embedded and compared with every chunk by cosine similarity. Five passages are retrieved by default.',
          },
          {
            title: 'Generate',
            detail:
              'The generation model answers from the retrieved passages and cites them by opaque handles. It never writes a page number: the renderer resolves each handle to printed pages from stored provenance.',
          },
          {
            title: 'Validate',
            detail:
              'Every answer passes a blocking validation step. A failure is reported in plain language and recorded as a result; it is never silently retried.',
          },
          {
            title: 'Refuse',
            detail:
              'When the collection lacks sufficient evidence, the reader gets a plain notice about the collection, not an answer from general knowledge.',
          },
        ],
      },
      details: [
        {
          heading: 'What the reader sees',
          items: [
            'The answer as ordinary prose with reference markers, followed by a sources line resolved to printed page numbers',
            'Full citation details one click away: author, year, chapter, section and pages',
            'A “Limits of this answer” note stating what the retrieved evidence does and does not support',
            'The assistant’s own inference in a separate callout labelled as AI interpretation, never blended into the author’s position',
            'Reference-list entries labelled as such, so a cited title is never treated as evidence of its own contents',
            'Technical details for evaluators: the retrieval table, similarity scores, the sufficiency verdict, the model and the prompt hash',
          ],
        },
        {
          heading: 'Four checks every answer must pass',
          items: [
            'Citation check: every source the answer cites must be one of the passages it was given, or the answer fails as a hallucinated citation',
            'Grounding check: an answer that claims its evidence is sufficient but cites nothing fails as ungrounded',
            'Page check: the model is never shown a page number, so any page number it writes is treated as invented and fails',
            'Contract check: a refusal must carry no answer and no citations, and a partial answer must state its limits',
          ],
        },
        {
          heading: 'Checked against the source',
          items: [
            'Provenance audited against the PDF itself: all 266 chunks carry the page label printed on their pages',
            'Once the layout constants lived in a configuration profile, swapping the collection to a new thesis changed no pipeline code',
            'Calibrating against a second document exposed three extraction defects, which were fixed',
            'The single-question command can emit the full run record: models, prompt hash, corpus hash, retrieved passages with scores, and any validation failures',
          ],
        },
        {
          heading: 'Deployment',
          items: [
            'A container image that runs as an unprivileged user, with a health check and automatic restart',
            'Credentials are read at run time from the host and never enter an image layer',
            'Published to the local machine only by default, because the app has no authentication and every question costs money on two APIs',
          ],
        },
      ],
      limits: [
        'The collection is one thesis, in English only',
        'It is a demonstration slice: the fuller plan in the repository is not yet built',
        'There is no scored evaluation yet. The checks above run on every answer, but a question set with known answers and a scorer are planned in the repository, not built',
        'Similarity scores are diagnostics, never a measure of confidence, and never the sole basis for a refusal',
        'Generated prose varies between runs; the retrieval diagnostics and sufficiency verdict do not',
      ],
    },
  },
  {
    slug: 'family-finance',
    name: 'Family Finance, Self-Hosted',
    tag: 'Private repo · Home infrastructure',
    image: '/images/projects/family-finance.png',
    cardImage: '/images/projects/cards/family-finance.png',
    frameLabel: 'family-finance · docker compose · raspberry-pi-5',
    imageAlt: 'Verified metrics from the family-finance system: transfers excluded, tests green, backups nightly',
    repo: null,
    description:
      'A self-hosted household finance system that replaced a Google Sheets workflow: FastAPI, PostgreSQL/pgvector, Redis and Celery, React, deployed with Docker Compose on a Raspberry Pi 5. Six bank-statement formats are parsed, each row reconciled against the statement totals, and transfers between the household’s own accounts are excluded so moving money is never counted as income.',
    evidence: [
      '354 backend and 214 frontend tests green in CI',
      'One real month verified: £9,174.62 of internal transfers correctly excluded from spending and income',
      'Nightly paired backups of database and statement PDFs; HTTPS from a private CA',
    ],
    status: 'Private by design — architecture walkthrough on request',
    technologies: ['FastAPI', 'PostgreSQL', 'Celery', 'React', 'Docker', 'Raspberry Pi'],
    caseStudy: {
      summary:
        'A self-hosted household finance system that replaced a spreadsheet workflow. It parses bank statements, reconciles every row against the statement totals, and never counts money moved between the household’s own accounts as income.',
      source: 'Verified figures from the system. The repository is private.',
      imageCaption:
        'Verified figures from the system. The repository and the application are private by design.',
      background: [
        'The system replaced a Google Sheets workflow for household finances. It runs at home on a Raspberry Pi 5 rather than on a hosted service.',
        'Six bank-statement formats are parsed. Each parsed row is reconciled against the totals on the statement, and transfers between the household’s own accounts are excluded, so moving money is never counted as spending or as income.',
      ],
      layers: {
        heading: 'The system at a glance',
        items: [
          { label: 'Interface', items: ['React'] },
          { label: 'Application', items: ['FastAPI', 'Celery'] },
          { label: 'Data', items: ['PostgreSQL with pgvector', 'Redis'] },
          { label: 'Statements', items: ['Six bank-statement formats', 'Row-by-row reconciliation'] },
          { label: 'Hosting', items: ['Docker Compose', 'Raspberry Pi 5', 'HTTPS from a private CA'] },
          { label: 'Backups', items: ['Nightly', 'Database and statement PDFs, paired'] },
        ],
      },
    },
  },
  {
    slug: 'crypto-signal-engine',
    name: 'AI-Assisted Crypto Signal Engine',
    tag: 'Private repo · Live on Raspberry Pi 5',
    image: '/images/projects/crypto.png',
    cardImage: '/images/projects/cards/crypto-signal-engine.png',
    frameLabel: 'Crypto Signal Engine · 23 Oct 2026',
    imageAlt: 'The crypto signal engine dashboard showing live indicators and condition scores',
    repo: null,
    description:
      'A position-aware trading engine for Binance Spot, dockerised on a Raspberry Pi 5 with Telegram control. A dual-mode strategy engine sits behind three macro gates and eight indicators, with ATR-based stops. An LLM analyst arbitrates borderline signals only, at 80%+ stated confidence; hard risk guards are rules the AI can never override.',
    evidence: [
      'Live container with auto-restart and a Telegram health check — up 6+ days, zero restarts',
      'A 1,000-candle dual-mode backtest replay completes in about 12 seconds on the Pi',
      'The LLM analyst is confidence-gated by design: borderline scores only, never a risk guard',
    ],
    status: 'Read-only signal engine — architecture walkthrough on request',
    technologies: ['Python', 'ccxt', 'GLM API', 'Telegram', 'Docker', 'Raspberry Pi'],
    caseStudy: {
      summary:
        'A read-only market signal engine on a Raspberry Pi. It reads public market data for Bitcoin, Ethereum and Cardano, applies rule-based gates and a condition score, and reports through a Telegram bot, a dashboard and a JSON API. It cannot place an order.',
      source: 'The published write-up of 23 October 2026, which describes the system as it ran on that day.',
      imageCaption:
        'The dashboard, captured from the running container on 23 October 2026. All three coins read HOLD because the four-hour trend gate was blocked.',
      background: [
        'The project began as a live Binance trading bot in Python that placed real orders on four-hour candles. When the exchange account was closed, the order code was deleted rather than switched off behind a flag: a repository one boolean away from placing an order is a risk, not a feature.',
        'What remains reads public market data with no API key and computes the same technical signals the bot used to trade on. The last trading-capable version is preserved at a git tag, so the history is intact.',
      ],
      steps: {
        heading: 'How a signal is produced',
        intro:
          'One function does the whole computation and returns a plain dictionary. The Telegram bot, the dashboard, the API and the tests all read that same dictionary, so the outputs cannot disagree about the logic.',
        items: [
          {
            title: 'Indicators',
            detail:
              'From the last closed four-hour candle: RSI, a fast and a slow moving average, the MACD histogram, Bollinger Bands, volume against its average, and the share of volume that came from buyers.',
          },
          {
            title: 'Three gates',
            detail:
              'Before any BUY is considered, the four-hour trend, the volatility regime and the daily trend must all pass. One blocked gate forces HOLD.',
          },
          {
            title: 'Mode',
            detail:
              'Trend-following needs 5 of 8 conditions; mean-reversion, which looks for oversold bounces at support, needs 5 of 7.',
          },
          {
            title: 'Signal',
            detail:
              'A signal with the gates, the score and a plain-English reason, so every decision can be traced to the conditions that passed and failed.',
          },
          {
            title: 'Report',
            detail:
              'A Telegram bot with read-only commands, and a dashboard and JSON API reachable only on the home network. Every API route is a GET, and signals refresh every five minutes.',
          },
        ],
      },
      details: [
        {
          heading: '“It cannot trade” as a test, not a promise',
          items: [
            'A test suite reads the source of every first-party file and fails the build if an order method, an exchange credential name or the old LLM override function comes back',
            '76 tests passed on 23 October 2026',
            'Checked on the running container, not only in the repository: a POST to the signals route returns 405, and the health check reports that trading is disabled',
            'The Telegram bot has no buy, sell, start, stop or balance command; they were deleted with the order code',
          ],
        },
      ],
      limits: [
        'It does not predict prices and is not designed to. It describes the current state of three coins in a consistent, rule-based way',
        'The strategy is not validated: the backtest covers one coin over six months, with the rules tuned on that same data',
        'Signals come from the last closed four-hour candle, so a sharp move inside the current candle does not show until it closes',
        'Found while writing it up: the daily-trend gate never fired live because of a column-name mismatch, so trend-following mode never switched on',
        'Found while writing it up: the LLM analyst code existed, but nothing called it in the live path',
      ],
      figures: [
        {
          src: '/articles/crypto-signal-engine/img/03-signal-breakdown-btc.png',
          alt: 'The mean-reversion scorecard for Bitcoin, showing which of seven conditions passed and failed',
          caption: 'The full scorecard for Bitcoin on 23 October 2026: 3 of 7 conditions passed.',
        },
        {
          src: '/articles/crypto-signal-engine/img/04-telegram-signal-btc-rendered.png',
          alt: 'The Telegram bot reply to a signal request for Bitcoin',
          caption: 'The bot’s reply for Bitcoin, rendered from its real output text rather than a phone screenshot.',
        },
      ],
      // The evidence lines were written in August 2026, before the write-up.
      evidenceNote: 'Recorded in August 2026, before the write-up above.',
      relatedArticles: ['crypto-signal-engine'],
    },
  },
  {
    slug: 'ecohaven-boots',
    name: 'EcoHaven Boots, Self-Hosted Storefront',
    tag: 'Live site · Stripe test mode',
    image: '/images/projects/ecohaven.png',
    cardImage: '/images/projects/cards/ecohaven-boots.png',
    frameLabel: 'ecohavenboots.co.uk',
    imageAlt: 'The EcoHaven Boots storefront: handcrafted leather baby boots',
    repo: null,
    liveUrl: 'https://ecohavenboots.co.uk',
    description:
      'An e-commerce storefront built for a handmade leather baby boots business: search and filtering, cart and Stripe checkout in GBP, and an admin panel behind iron-session auth. Next.js 14 with server components over Prisma, deployed as a Docker multi-stage build behind Nginx and a Cloudflare Tunnel on the Raspberry Pi 5. The site is public; its checkout runs in Stripe test mode and it has not taken an order.',
    evidence: [
      'Publicly reachable at ecohavenboots.co.uk — a real URL, not a screenshot',
      'Payments hardened in phases: Stripe webhook idempotency, stock decrement on capture, consistent GBP pricing',
      'Security shipped: upload validation and path sanitisation, required session secret, sameSite cookies',
    ],
    status: 'Deployed and publicly reachable, in Stripe test mode',
    technologies: ['Next.js 14', 'TypeScript', 'Prisma', 'Stripe', 'Docker', 'Nginx'],
    caseStudy: {
      summary:
        'An e-commerce storefront built for a handmade leather baby boots business: a shop front, a cart with Stripe checkout, and an admin panel, served from a Raspberry Pi 5 at a public address. Checkout runs in Stripe test mode.',
      source: 'The live site and the project repository, which is private.',
      imageCaption: 'The storefront at ecohavenboots.co.uk.',
      background: [
        'The platform covers the whole path from browsing to payment: a storefront with search and filtering, a cart, Stripe checkout in pounds, and an admin panel behind session authentication.',
        'It is built with Next.js 14 server components over Prisma, packaged as a Docker multi-stage build, and served behind Nginx through a Cloudflare Tunnel.',
        'The site is deployed and publicly reachable, but it is not yet trading: checkout runs on Stripe test keys and no order has been taken through it. The business itself sells on Etsy.',
      ],
      layers: {
        heading: 'The system at a glance',
        items: [
          { label: 'Storefront', items: ['Next.js 14 server components', 'Search and filtering', 'Cart'] },
          { label: 'Payments', items: ['Stripe checkout in GBP', 'Webhooks', 'Test mode'] },
          { label: 'Admin', items: ['Admin panel', 'iron-session authentication'] },
          { label: 'Data', items: ['Prisma', 'SQLite'] },
          { label: 'Delivery', items: ['Docker multi-stage build', 'Nginx', 'Cloudflare Tunnel'] },
          { label: 'Hosting', items: ['Raspberry Pi 5'] },
        ],
      },
      details: [
        {
          heading: 'Hardening, in phases',
          items: [
            'Stripe webhooks are idempotent, so a repeated delivery cannot be processed twice',
            'Stock is decremented when a payment is captured',
            'Prices are handled consistently in pounds',
            'Uploads are validated and their paths sanitised',
            'The session secret is required, and cookies are set with sameSite',
          ],
        },
      ],
      limits: [
        'Checkout runs in Stripe test mode, and no order has been taken through the site',
        'Going live would need live payment keys and a fulfilment process',
        'It is served from one Raspberry Pi on a home connection, so availability depends on that single machine and line',
      ],
    },
  },
  {
    slug: 'evidence-grounded-assistant',
    name: 'Evidence-Grounded Assistant, Hackathon Build',
    tag: 'Private repo · 24-hour hackathon',
    // No card on the home page: the app and its data cannot be shown.
    listed: false,
    repo: null,
    description:
      'A document assistant built by a team of five in a 24-hour hackathon. It refuses without evidence, checks every citation, scores its output against a reviewed answer key, and records each decision.',
    evidence: [
      'More than 1,100 automated tests in 74 test files, with a CI pipeline',
      'Generated items scored against a reviewed answer key: matched, missed and extra, with precision and recall',
      'The refusal threshold is set from measured retrieval scores, not chosen by feel',
    ],
    status: 'Private repository: the hackathon data cannot be shared',
    technologies: ['Python', 'LangGraph', 'PostgreSQL', 'Streamlit', 'MCP', 'pytest'],
    caseStudy: {
      summary:
        'A document assistant built in a 24-hour hackathon by a team of five, where the controls were the product: it refuses without evidence, checks every citation, scores its own output against an answer key, and records each decision.',
      source:
        'The project repository, which is private. The hackathon data and the organisers’ documents are not described here.',
      background: [
        'The brief was a document-intelligence assistant over a set of long PDF documents. The team was five people, engineers and subject matter experts, and the code was written by supervised AI coding agents.',
        'The plan treated trust controls as demo features, not extras: the evidence guard, the approval step, redaction and the audit log all had to be visible on screen.',
      ],
      steps: {
        heading: 'What happens to a question',
        items: [
          {
            title: 'Redact',
            detail:
              'Emails, account-like numbers, phone numbers and token-like strings are replaced before anything is stored, embedded or searched. The question is redacted too.',
          },
          {
            title: 'Retrieve and guard',
            detail:
              'Retrieved passages must score at or above a threshold. If too few do, the answer is blocked with a reason and the model is never called.',
          },
          {
            title: 'Generate',
            detail: 'Only the passages that cleared the threshold are handed to the model.',
          },
          {
            title: 'Validate',
            detail:
              'Each generated item is checked against its evidence. An item that cites a passage it was not given is rejected. One whose supporting quote is not found in the passage it cites is flagged.',
          },
          {
            title: 'Review',
            detail:
              'A person approves or rejects each drafted item, with a reason code for every rejection. An item that failed its automated check cannot be approved.',
          },
          {
            title: 'Record',
            detail:
              'Every decision goes to an append-only audit log in the same transaction as the action, so a failed audit write fails the action. The log holds ids, counts and hashes, never document or prompt text.',
          },
        ],
      },
      details: [
        {
          heading: 'How it is evaluated',
          items: [
            'Generated items are compared with an answer key that a person has reviewed. An item matches when it cites the right document, has the expected type and contains every expected term',
            'The report counts matched, missed and extra items, and gives precision and recall. Scoring is plain comparison, with no model call',
            'The generator’s original output is scored, not a reviewer’s edits, so the result measures the generator',
            'The refusal threshold comes from measurement: a script compares the best retrieval score for questions the documents can answer with questions they cannot, and proposes the midpoint',
            'The reason codes recorded at review give an adoption rate and a list of failure types',
          ],
        },
        {
          heading: 'How it is tested',
          items: [
            'More than 1,100 automated tests in 74 test files, with a CI pipeline',
            'Tests use short made-up snippets written in the test files, never the hackathon documents',
          ],
        },
      ],
      limits: [
        'The repository is private and the data cannot be shared, so the scores themselves are not published here',
        'It was built in 24 hours: there is no user sign-in and no production hardening',
        'Matching on expected terms shows that an item contains the expected facts. It does not show that everything else in the item is right',
      ],
      relatedArticles: ['supervising-an-ai-coding-team', 'gated-rag-test-generation'],
    },
  },
];

// The projects that have a card on the home page.
export const listedProjects = projects.filter((project) => project.listed !== false);

export const getProject = (slug: string) => projects.find((project) => project.slug === slug);
