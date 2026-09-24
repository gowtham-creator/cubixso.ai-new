// Services catalogue: the content behind /services.
//
// Edit the words here, not in the components. Rules (PRODUCT.md, "Claim only
// what's shipped"):
//   • `proof` names only real work, with an honest status. A service with no
//     shipped example has no proof; do not invent one.
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

export type DiagramKind = "loop" | "harness" | "voice" | "flow" | "mcp" | "evals" | "router";

export type Visual =
  | { kind: "image"; src: string; alt: string }
  | { kind: "diagram"; diagram: DiagramKind };

export interface Service {
  id: string;
  num: string;
  name: string;
  /** One line, shown in the catalogue. */
  short: string;
  /** The opening paragraph of the service's chapter. */
  lead: string;
  build: string[];
  failures: string[];
  useCases: string[];
  deliver: string[];
  stack: string[];
  visual: Visual;
  proof?: Proof[];
  /** A plain statement of where our work stops, when it matters. */
  boundary?: string;
}

export interface ServiceGroup {
  id: string;
  name: string;
  line: string;
  services: Service[];
}

export const SERVICE_GROUPS: ServiceGroup[] = [
  {
    id: "agents",
    name: "Build agents",
    line: "Systems that act, not just answer.",
    services: [
      {
        id: "agentic-systems",
        num: "01",
        name: "Agentic systems and loops",
        short: "Agents that plan, act and check their own work across many steps.",
        lead: "Agents that work through a task the way a careful person would: plan, act, look at the result, check it against the goal, and go again. Built with the brakes as well as the engine, so budgets, stop conditions and a person in the loop come as standard.",
        build: [
          "Plan, act and verify loops with an explicit success check",
          "Multi-agent teams with clear roles and hand-offs",
          "Step and cost budgets on every task",
          "Human approval before any irreversible action",
        ],
        failures: [
          "Loops that never converge and burn budget",
          "Work marked done without being checked",
          "Runaway cost across sub-agents",
        ],
        useCases: ["Research and analysis", "Back-office operations", "Case and claims handling", "Software and data tasks"],
        deliver: ["The agent system, in your repositories", "A loop controller with budgets and stop rules", "A full trace of every step"],
        stack: ["Tool calling", "MCP", "Durable workflows", "Tracing"],
        visual: { kind: "diagram", diagram: "loop" },
      },
      {
        id: "harness-engineering",
        num: "02",
        name: "Agent harness engineering",
        short: "The tools, context, memory and guardrails that make an agent dependable.",
        lead: "The model is one component. The harness around it decides whether an agent can be trusted in production: which tools it can call, what context it sees, what it remembers, what it is allowed to do, and how it recovers when a step fails.",
        build: [
          "A tool layer of typed tools and MCP servers",
          "Context assembly: retrieval, memory and compaction for long tasks",
          "A permission model: sandboxed execution, scoped credentials, approval gates",
          "Recovery: retries, checkpoints and runs that resume after a failure",
        ],
        failures: [
          "Agents acting on stale or missing context",
          "Tools with more access than the task needs",
          "Long runs that fail silently halfway through",
          "A prompt fix for one task that breaks another",
        ],
        useCases: ["Taking an agent prototype to production", "Adding agents to existing systems safely", "Replacing brittle prompt chains"],
        deliver: ["Harness source code", "Tool and permission specifications", "An eval suite for the agent's real jobs", "An operating runbook"],
        stack: ["Typed tools", "MCP", "Sandboxed execution", "Checkpointing"],
        visual: { kind: "diagram", diagram: "harness" },
      },
      {
        id: "voice-agents",
        num: "03",
        name: "Voice AI and calling agents",
        short: "Phone and voice agents that listen, respond and act in real time.",
        lead: "Voice agents that hold a real conversation. They listen, cope with being interrupted, understand what the caller wants, act on your systems during the call, and hand over to a person when they should, in the caller's language, including Arabic.",
        build: [
          "Inbound and outbound calling agents",
          "Real-time speech recognition and natural voices",
          "Actions during the call: bookings, lookups, updates",
          "Warm hand-off to a person, with the full context",
        ],
        failures: [
          "Agents that talk over the caller",
          "Context lost when a call is transferred",
          "Actions taken on a misheard request",
        ],
        useCases: ["Customer support lines", "Appointment scheduling", "Lead qualification", "Payment reminders"],
        deliver: ["A voice agent connected to your telephony", "Transcripts and outcomes for every call", "Escalation rules"],
        stack: ["Speech-to-text", "Text-to-speech", "Telephony", "Tool calling"],
        visual: { kind: "diagram", diagram: "voice" },
        proof: [
          {
            name: "Nox AI",
            note: "Agentic calling platform that holds live phone conversations and recovers when interrupted.",
            status: "In build",
            image: "/products/nox-ai.png",
          },
        ],
      },
    ],
  },
  {
    id: "knowledge",
    name: "Build on your knowledge",
    line: "Your documents and data, made usable.",
    services: [
      {
        id: "rag-knowledge",
        num: "04",
        name: "RAG and knowledge systems",
        short: "Answers from your own documents and data, with a source for every claim.",
        lead: "Assistants that answer from your documents and data, not the open internet, and show exactly where each answer came from. We engineer the whole path: ingestion, retrieval, ranking, memory and access control.",
        build: [
          "Ingestion for PDFs, scans, tables and internal systems",
          "Hybrid retrieval: keyword and vector search, then reranking",
          "Citations that point to the exact passage",
          "Private deployment, where the data never leaves your network",
        ],
        failures: [
          "Confident answers with no source",
          "Chunking that separates a fact from its context",
          "Indexes that go stale after documents change",
          "Sensitive data surfacing for the wrong person",
        ],
        useCases: ["Legal and policy research", "Internal knowledge assistants", "Customer support answers", "Due diligence"],
        deliver: ["Ingestion pipeline and index", "Retrieval evals against a labelled question set", "Access rules mapped from your identity system"],
        stack: ["Hybrid search", "Reranking", "Vector stores", "Citations"],
        visual: { kind: "image", src: "/products/law-suit-gpt.jpg", alt: "Law Suit GPT retrieving cited passages from Indian Supreme Court judgments" },
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
        id: "document-intelligence",
        num: "05",
        name: "Document intelligence and decision automation",
        short: "Policies and documents turned into executable rules and structured data.",
        lead: "Most business rules live in documents: policies, contracts, manuals. We extract them into executable logic and structured data, with every rule traceable to the sentence it came from, so decisions can be automated and audited.",
        build: [
          "Rule extraction from policy documents",
          "Output as DMN, FICO or Python",
          "Parsing for forms, tables and scanned documents",
          "Traceability from every rule back to its source",
        ],
        failures: [
          "Rules that drift away from the source policy",
          "Ambiguous clauses silently guessed",
          "Extraction nobody can audit",
        ],
        useCases: ["Insurance underwriting", "Lending and credit policy", "Compliance checks", "Claims rules"],
        deliver: ["An extraction pipeline", "Executable rule sets", "A source-linked audit trail"],
        stack: ["DMN", "Drools", "Python", "Document parsing"],
        visual: { kind: "image", src: "/products/logic-gen.jpg", alt: "Logic Gen converting policy documents into executable rules" },
        proof: [
          {
            name: "Logic Gen",
            note: "Turned a fifteen-year-old underwriting ruleset into a deployable DMN system in six weeks.",
            status: "In production",
            image: "/products/logic-gen.jpg",
            href: "https://logic-gen-website.vercel.app",
          },
        ],
      },
    ],
  },
  {
    id: "products",
    name: "Build products and stories",
    line: "Things your customers use and watch.",
    services: [
      {
        id: "ai-storytelling",
        num: "06",
        name: "AI storytelling and film pipelines",
        short: "Script-to-screen pipelines that hold a generated story together.",
        lead: "Generative video has made a single shot easy. A story is still hard: one character, one style and one script held together across every shot. We build the pipelines and pre-production tools that make that possible.",
        build: [
          "Script and story engines across Indian languages and dialects",
          "Storyboards and shot lists generated from the script",
          "Character and style references reused in every shot",
          "Generation that routes each shot to the best-suited video model",
          "Review loops where a director approves, rejects or regenerates each shot",
        ],
        failures: [
          "A character whose face changes between shots",
          "A style that drifts across a sequence",
          "Scripts that lose cultural nuance in translation",
          "Clips nobody can trace back to their inputs",
        ],
        useCases: ["Regional-language content", "Brand films and ad pre-production", "Episodic storyboarding", "Pitch visualisation"],
        deliver: ["The pipeline and tools, in your environment", "A character and style reference library", "Shot-level provenance for every clip"],
        stack: ["Text-to-video", "Image-to-video", "Multilingual models", "Reference libraries"],
        boundary:
          "Where we stop: we build the pipeline and the pre-production. The final cut, sound and grade are produced by your studio or our production partners.",
        visual: { kind: "image", src: "/products/aumic-flow.jpg", alt: "Aumic Flow, a story and script engine for Indian languages" },
        proof: [
          {
            name: "Aumic Flow AI",
            note: "The story and script engine behind a regional studio's multilingual content pipeline.",
            status: "Case study",
            image: "/products/aumic-flow.jpg",
            href: "https://aumicflow-website.vercel.app",
          },
        ],
      },
      {
        id: "ai-products",
        num: "07",
        name: "Full-scale AI products",
        short: "Web and mobile products with AI at the core, from prototype to launch.",
        lead: "From idea to shipped product: web and mobile apps with AI built into the core, plus the admin, analytics and billing that let them run as a business. Designed, built and handed over so your team can own it.",
        build: [
          "Product design and prototypes on your real data",
          "Web and mobile apps with AI built in, not bolted on",
          "Admin, analytics and billing",
          "A codebase your own team can take over",
        ],
        failures: ["AI features that demo well and nobody uses", "Prototypes that collapse under real users"],
        useCases: ["SaaS platforms", "Education", "Careers and recruitment", "Commerce"],
        deliver: ["The shipped product and its source code", "A design system", "Launch checklist and runbooks"],
        stack: ["Next.js", "React", "Python", "Native mobile"],
        visual: { kind: "image", src: "/products/nxt-school.jpg", alt: "NXT School, an AI-first school operating system" },
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
        id: "workflow-automation",
        num: "08",
        name: "Workflow automation and modernisation",
        short: "Multi-step operations automated, and legacy systems brought up to date.",
        lead: "Automate the multi-step work that runs your operations: agents where judgement is needed, plain deterministic code where it isn't. And bring legacy systems onto modern ground without stopping the business while it happens.",
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
        useCases: ["Logistics and dispatch", "Finance operations", "Document-heavy back offices", "Legacy system migration"],
        deliver: ["Running workflows with monitoring", "An exception-handling playbook", "Migration plan and cut-over support"],
        stack: ["Orchestration", "Document intake", "APIs", "Event queues"],
        visual: { kind: "diagram", diagram: "flow" },
        proof: [
          {
            name: "Navata Transport",
            note: "A decade-old Java transport system moved to a modern web application without pausing dispatch.",
            status: "Delivered",
          },
        ],
      },
    ],
  },
  {
    id: "production",
    name: "Run it in production",
    line: "What keeps AI working after launch.",
    services: [
      {
        id: "mcp-integration",
        num: "09",
        name: "MCP and tool integration",
        short: "Your systems exposed to agents safely, through the Model Context Protocol.",
        lead: "The Model Context Protocol gives agents one standard way to reach tools and data. We turn your internal systems into MCP servers, with least-privilege access and a record of every call, so each new agent reuses the same governed connections.",
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
        useCases: ["Connecting agents to CRM and ERP", "Internal APIs as agent tools", "Governed data access"],
        deliver: ["MCP servers with tests", "A permission matrix", "An audit log pipeline"],
        stack: ["MCP", "OAuth and SSO", "Audit logging"],
        visual: { kind: "diagram", diagram: "mcp" },
      },
      {
        id: "evals-observability",
        num: "10",
        name: "Evals and observability",
        short: "Every change tested before it ships, every production step traced.",
        lead: "If it isn't measured, it isn't finished. Every agent and every prompt ships with an eval suite that runs on each change, and every step in production is traced, so quality, latency and cost are visible before they become problems.",
        build: [
          "Golden datasets drawn from your real cases",
          "Graders: exact checks, rubric-scored model judges, human review",
          "Regression gates in CI before any prompt or model change ships",
          "Tracing of every step, tool call and token cost",
        ],
        failures: [
          "A demo that passes and a production system that doesn't",
          "Model upgrades that change behaviour overnight",
          "Costs nobody sees until the invoice arrives",
        ],
        useCases: ["Before a model upgrade", "Regulated workflows", "Any agent in production"],
        deliver: ["An eval suite and datasets, versioned with the code", "CI gate configuration", "Dashboards for quality, latency and cost"],
        stack: ["Golden datasets", "Model judges", "CI gates", "Tracing"],
        visual: { kind: "diagram", diagram: "evals" },
      },
      {
        id: "llmops",
        num: "11",
        name: "LLMOps and model deployment",
        short: "The right model for each task, versioned, monitored and cost-controlled.",
        lead: "Running models in production is its own discipline: routing each task to the right model, versioning prompts, controlling cost and upgrading without regressions. Including open-weight models hosted where your data has to stay.",
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
        useCases: ["Reducing model spend", "Private and on-premise AI", "Products that use several models"],
        deliver: ["Gateway and routing configuration", "A versioned prompt registry", "Cost and latency monitoring"],
        stack: ["Model gateway", "Prompt registry", "Caching", "Open-weight models"],
        visual: { kind: "diagram", diagram: "router" },
      },
    ],
  },
];

export const ALL_SERVICES: Service[] = SERVICE_GROUPS.flatMap((g) => g.services);
export const groupOf = (id: string) => SERVICE_GROUPS.find((g) => g.services.some((s) => s.id === id))!;

/* ── What changed in 2026 ─────────────────────────────────────────────── */

export const SHIFTS: { shift: string; changed: string; meaning: string }[] = [
  {
    shift: "Harness engineering",
    changed: "The model became one component. The harness around it now decides whether an agent is reliable.",
    meaning: "Judge a partner on harness design, not on which model they name.",
  },
  {
    shift: "Agentic loops",
    changed: "Agents stopped answering once and started working in loops, for minutes or hours.",
    meaning: "Budgets, stop conditions and human checkpoints are requirements now.",
  },
  {
    shift: "Evals",
    changed: "Eval suites replaced demos. Every change is regression-tested before it ships.",
    meaning: "Ask to see the eval set before you ask to see the demo.",
  },
  {
    shift: "Model Context Protocol",
    changed: "MCP gave agents one standard way to reach tools and data.",
    meaning: "Your systems become reusable servers, with access you can scope and audit.",
  },
  {
    shift: "Context engineering",
    changed: "Retrieval, memory and compaction became the main lever on answer quality.",
    meaning: "Quality is an engineering property: measurable, and fixable when it slips.",
  },
  {
    shift: "Video generation",
    changed: "Video models got good at single shots. Holding a story together is still the hard part.",
    meaning: "The pipeline around the models matters more than any one model.",
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
    detail: "Frontier APIs, including OpenAI, Anthropic and Google, and open-weight models self-hosted when data must stay in your network.",
  },
  { area: "Agents and tools", detail: "MCP servers, typed tool calling, durable workflows with checkpoints." },
  { area: "Retrieval", detail: "Hybrid keyword and vector search, reranking, passage-level citations." },
  { area: "Evals and operations", detail: "Golden datasets, rubric-scored judges checked against people, CI regression gates, tracing." },
  { area: "Applications", detail: "Next.js and React on the web, Python services, native mobile apps." },
  { area: "Deployment", detail: "Your cloud, a private VPC, or on-premise." },
];

export const STANDARDS = [
  "Your code lives in your repositories.",
  "Least-privilege access by default.",
  "Every agent ships with an eval suite.",
  "In-build work is labelled as in build.",
];
