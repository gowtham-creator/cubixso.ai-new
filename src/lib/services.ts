// Services field guide — the content behind /services.
//
// Edit the words here, not in the components. Two rules hold for everything in
// this file (see PRODUCT.md, "Claim only what's shipped"):
//   • Proof only names work that exists, with an honest status. Entries with no
//     shipped example simply have no `proof`; do not invent one.
//   • No numbers unless they are real and already published on the site.
// House style: no em dashes; plain, specific, unhyped.

export type ProofStatus = "In production" | "Live" | "Case study" | "Delivered" | "In build";

export interface Proof {
  name: string;
  note: string;
  status: ProofStatus;
  image?: string;
  href?: string;
}

export type DiagramKind = "harness" | "loop" | "story";

export interface Practice {
  id: string;
  code: string;
  name: string;
  summary: string;
  build: string[];
  failures: string[];
  deliver: string[];
  proof?: Proof[];
  diagram?: DiagramKind;
  /** A plain statement of where our work stops, when it matters. */
  boundary?: string;
}

export interface Track {
  id: string;
  letter: "A" | "B";
  name: string;
  audience: string;
  intro: string;
  cta: { label: string; href: string };
  practices: Practice[];
}

/* ── What changed ─────────────────────────────────────────────────────── */

export const SHIFTS: { shift: string; changed: string; meaning: string }[] = [
  {
    shift: "Harness engineering",
    changed:
      "The model became one component. The harness around it (tools, context, memory, permissions) now decides whether an agent is reliable.",
    meaning: "Judge a partner on harness design, not on which model they name.",
  },
  {
    shift: "Agentic loops",
    changed:
      "Agents stopped answering once and started working in loops: plan, act, check, repeat, for minutes or hours.",
    meaning: "Budgets, stop conditions and human checkpoints are now requirements, not extras.",
  },
  {
    shift: "Evals",
    changed:
      "Eval suites replaced demos. Every prompt, model or tool change is regression-tested before it ships.",
    meaning: "Ask to see the eval set before you ask to see the demo.",
  },
  {
    shift: "Model Context Protocol",
    changed:
      "MCP gave agents one standard way to reach tools and data, instead of a custom integration per agent.",
    meaning: "Your systems become reusable servers, with access you can scope and audit.",
  },
  {
    shift: "Context engineering",
    changed:
      "Retrieval, memory and compaction, not prompt wording, became the main lever on answer quality.",
    meaning: "Quality is an engineering property: measurable, and fixable when it slips.",
  },
  {
    shift: "Video generation",
    changed:
      "Text-to-video and image-to-video models got good at single shots. Holding a character and a style across a whole story is still the hard part.",
    meaning: "The pipeline around the models matters more than any one model.",
  },
];

/* ── Tracks ───────────────────────────────────────────────────────────── */

export const TRACKS: Track[] = [
  {
    id: "enterprise",
    letter: "A",
    name: "Enterprise systems",
    audience: "For CTOs, engineering leaders and data teams.",
    intro:
      "Agents and knowledge systems that run inside your business, against your data, under your controls. Built to be operated, audited and upgraded, not just demonstrated.",
    cta: { label: "Book a scoping call", href: "/contact" },
    practices: [
      {
        id: "harness",
        code: "A.01",
        name: "Agent harness engineering",
        summary:
          "The model is one component. The harness around it (tools, context, memory, permissions and recovery) is what makes an agent dependable in production.",
        build: [
          "A tool layer of typed tools and MCP servers the agent can call",
          "Context assembly: retrieval, memory and compaction for long tasks",
          "A permission model: sandboxed execution, scoped credentials, approval gates",
          "Recovery: retries, checkpoints and runs that resume after a failure",
        ],
        failures: [
          "Agents acting on stale or missing context",
          "Tools with more access than the task needs",
          "Long runs that fail silently halfway through",
          "A prompt fix for one task that quietly breaks another",
        ],
        deliver: [
          "Harness source code in your repositories",
          "Tool and permission specifications",
          "An eval suite covering the agent's real jobs",
          "A runbook for operating it",
        ],
        proof: [
          {
            name: "Logic Gen",
            note: "Agentic pipeline that turns legacy policy documents into executable DMN, FICO and Python rules.",
            status: "In production",
            image: "/products/logic-gen.jpg",
            href: "https://logic-gen-website.vercel.app",
          },
        ],
        diagram: "harness",
      },
      {
        id: "loops",
        code: "A.02",
        name: "Agentic loops",
        summary:
          "Useful agent work happens across dozens of steps: plan, act, observe, verify, repeat. A loop needs brakes as well as an engine.",
        build: [
          "Plan, act and verify loops with an explicit success check",
          "Step and cost budgets for every task",
          "Human checkpoints before any irreversible action",
          "Parallel sub-agents for work that splits cleanly",
        ],
        failures: [
          "Loops that never converge and burn budget",
          "Agents that mark work done without checking it",
          "Irreversible actions taken without review",
          "Runaway fan-out across sub-agents",
        ],
        deliver: [
          "A loop controller with budgets and stop conditions",
          "An approval step, as an interface or an API",
          "A trace of every step, kept for review",
        ],
        proof: [
          {
            name: "Nox AI",
            note: "Agentic calling platform that holds live phone conversations and recovers when interrupted.",
            status: "In build",
            image: "/products/nox-ai.png",
          },
        ],
        diagram: "loop",
      },
      {
        id: "evals",
        code: "A.03",
        name: "Evals and observability",
        summary:
          "If it isn't measured, it isn't finished. Every agent and every prompt ships with an eval suite that runs on each change, and every production step is traced.",
        build: [
          "Golden datasets drawn from your real cases",
          "Graders: exact checks, rubric-scored model judges, human review queues",
          "Regression gates in CI before any prompt or model change ships",
          "Production tracing of every step, tool call and token cost",
        ],
        failures: [
          "A demo that passes and a production system that doesn't",
          "Model upgrades that change behaviour overnight",
          "Model judges that drift away from human judgement",
          "Costs nobody sees until the invoice arrives",
        ],
        deliver: [
          "Eval suite and datasets, versioned with the code",
          "CI gate configuration",
          "Dashboards for quality, latency and cost",
        ],
      },
      {
        id: "context",
        code: "A.04",
        name: "Context engineering and RAG",
        summary:
          "Answer quality depends on what the model sees. We engineer ingestion, retrieval, ranking and memory so the right evidence arrives, with a citation for every claim.",
        build: [
          "Ingestion for PDFs, scans, tables and internal systems",
          "Hybrid retrieval: keyword and vector search, then reranking",
          "Citations that point to the exact passage",
          "Private deployment, where the corpus never leaves your network",
        ],
        failures: [
          "Confident answers with no source",
          "Chunking that separates a fact from its context",
          "Indexes that go stale after documents change",
          "Sensitive data surfacing for the wrong user or team",
        ],
        deliver: [
          "Ingestion pipeline and index",
          "Retrieval evals against a labelled question set",
          "Access rules mapped from your identity system",
        ],
        proof: [
          {
            name: "Law Suit GPT",
            note: "Distributed retrieval across 40,000+ legal judgments, returning the relevant passage in under two seconds.",
            status: "Case study",
            image: "/products/law-suit-gpt.jpg",
          },
        ],
      },
      {
        id: "mcp",
        code: "A.05",
        name: "MCP and tool integration",
        summary:
          "The Model Context Protocol gives agents one standard way to reach tools and data. We turn your internal systems into MCP servers, with least-privilege access and a record of every call.",
        build: [
          "MCP servers for internal APIs, databases and SaaS tools",
          "Authentication mapped to your existing identities and roles",
          "Read-only by default, with writes behind approval",
          "An audit log of every call an agent makes",
        ],
        failures: [
          "The same integration rebuilt for every new agent",
          "Service accounts holding admin rights",
          "No record of what an agent did, or why",
        ],
        deliver: ["MCP servers with tests", "A permission matrix", "An audit log pipeline"],
      },
      {
        id: "llmops",
        code: "A.06",
        name: "LLMOps",
        summary:
          "Running models in production is its own discipline: routing each task to the right model, versioning prompts, controlling cost and upgrading without regressions.",
        build: [
          "Model routing by task, cost and latency",
          "Prompt and model versioning, with rollback",
          "Cost controls: budgets, caching and batching",
          "Self-hosted open-weight models where data cannot leave",
        ],
        failures: [
          "The largest model paid for on every task, however small",
          "Upgrades that change outputs overnight",
          "Latency spikes with no fallback",
        ],
        deliver: [
          "Gateway and routing configuration",
          "A versioned prompt registry",
          "Cost and latency monitoring",
        ],
      },
    ],
  },
  {
    id: "product",
    letter: "B",
    name: "Products and creative",
    audience: "For founders, product leaders and creative teams.",
    intro:
      "AI products your customers use, the automation behind them, and pipelines that bring generative video into real storytelling.",
    cta: { label: "Start a project", href: "/contact" },
    practices: [
      {
        id: "products",
        code: "B.01",
        name: "AI products and full-scale apps",
        summary:
          "From idea to shipped product: web and mobile apps with AI at the core, plus the admin, analytics and billing that let them run as a business.",
        build: [
          "Product design and prototypes on your real data",
          "Web and mobile apps with AI built in, not bolted on",
          "Admin, analytics and billing",
          "A codebase your own team can take over",
        ],
        failures: [
          "AI features that demo well and nobody uses",
          "Prototypes that collapse under real users",
        ],
        deliver: ["The shipped product and its source code", "A design system", "Launch checklist and runbooks"],
        proof: [
          {
            name: "NXT School ERP",
            note: "AI-first school operating system: one ERP and four mobile apps for Indian K-12 schools.",
            status: "Live",
            image: "/products/nxt-school.jpg",
            href: "https://www.nxtschools.com",
          },
          {
            name: "Resumize",
            note: "ATS-ready resume generation for college students.",
            status: "Live",
            image: "/products/resumize.jpg",
            href: "https://resumize.in",
          },
        ],
      },
      {
        id: "workflows",
        code: "B.02",
        name: "Workflow automation and modernisation",
        summary:
          "Automate the multi-step work that runs your operations: agents where judgement is needed, plain deterministic code where it isn't, and legacy systems brought onto modern ground.",
        build: [
          "Process mapping to decide what should, and shouldn't, be automated",
          "Orchestrated workflows across your existing systems",
          "Document intake for forms, invoices and scans",
          "Exception queues, so people only handle the hard cases",
        ],
        failures: [
          "Automating a broken process, faster",
          "Brittle scripts that break on the first unusual input",
          "Migrations that stop the business while they run",
        ],
        deliver: ["Running workflows with monitoring", "An exception-handling playbook"],
        proof: [
          {
            name: "Navata Transport",
            note: "A decade-old Java transport system moved to a modern web application without pausing dispatch.",
            status: "Delivered",
          },
        ],
      },
      {
        id: "storytelling",
        code: "B.03",
        name: "AI storytelling and film pipelines",
        summary:
          "Generative video has made a single shot easy. A story is still hard: one character, one style and one script held together across every shot. We build the pipelines and pre-production tools that do that.",
        build: [
          "Script and story engines that work across Indian languages and dialects",
          "Storyboards and shot lists generated from the script",
          "Character and style references reused in every shot",
          "Generation pipelines that route each shot to the best-suited video model",
          "Review loops where a director approves, rejects or regenerates each shot",
        ],
        failures: [
          "A character whose face changes between shots",
          "A style that drifts across a sequence",
          "Scripts that lose cultural nuance in translation",
          "Clips nobody can trace back to their prompt and inputs",
        ],
        deliver: [
          "The pipeline and its tools, in your environment",
          "A character and style reference library",
          "Shot-level provenance for every generated clip",
        ],
        boundary:
          "Where we stop: we build the pipeline and the pre-production. The final cut, sound and grade are produced by your studio or our production partners.",
        proof: [
          {
            name: "Aumic Flow AI",
            note: "Story and script engine behind a regional studio's multilingual content pipeline.",
            status: "Case study",
            image: "/products/aumic-flow.jpg",
            href: "https://aumicflow-website.vercel.app",
          },
        ],
        diagram: "story",
      },
    ],
  },
];

/* ── How an engagement runs ───────────────────────────────────────────── */

export const ENGAGEMENT: { step: string; name: string; body: string }[] = [
  {
    step: "01",
    name: "Scope",
    body: "We agree what success means before any code: the jobs to be done, the data, the risks, and the eval set that will prove it works.",
  },
  {
    step: "02",
    name: "Prototype",
    body: "A thin, working slice on your real data, so decisions are made against evidence rather than slides.",
  },
  {
    step: "03",
    name: "Harden",
    body: "Evals in CI, tracing, security review, cost controls and failure recovery, before real users arrive.",
  },
  {
    step: "04",
    name: "Hand over",
    body: "Code in your repositories, runbooks, the eval suite and training for your team. You own the system.",
  },
];

/* ── Stack and standards ──────────────────────────────────────────────── */

export const STACK: { area: string; detail: string }[] = [
  {
    area: "Models",
    detail:
      "Frontier APIs, including OpenAI, Anthropic and Google, and open-weight models self-hosted when data must stay in your network.",
  },
  { area: "Agents and tools", detail: "MCP servers, typed tool calling, durable workflows with checkpoints." },
  { area: "Retrieval", detail: "Hybrid keyword and vector search, reranking, passage-level citations." },
  {
    area: "Evals and operations",
    detail: "Golden datasets, rubric-scored judges checked against people, CI regression gates, tracing.",
  },
  { area: "Applications", detail: "Next.js and React on the web, Python services, native mobile apps." },
  { area: "Deployment", detail: "Your cloud, a private VPC, or on-premise." },
];

export const STANDARDS = [
  "Your code lives in your repositories.",
  "Least-privilege access by default.",
  "Every agent ships with an eval suite.",
  "In-build work is labelled as in build.",
];
