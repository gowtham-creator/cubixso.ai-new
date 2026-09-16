// Cubixso content — adapted from the two pitch decks the team already has.
// Source of truth for sections that consume product / service / industry data.

export const SERVICES = [
  { name: "LLM Operations (LLMOps)",       body: "Enterprise LLM deployment with monitoring, versioning, cost controls." },
  { name: "Agentic Autonomous Systems",     body: "Agents that plan and execute — beyond traditional RPA." },
  { name: "AI Agents & Automation",         body: "Calling agents, support bots, workflow automation beyond RPA." },
  { name: "Full-Scale AI Applications",     body: "End-to-end AI products — web, mobile, APIs, dashboards." },
  { name: "AI Tools & Workflow Orchestration", body: "Advanced prompting, n8n, A2A and workflow automation." },
  { name: "RAG, CAG & Knowledge Systems",   body: "Enterprise knowledge powered by RAG and context engineering." },
] as const;

export const PRODUCTS = [
  { code: "LG/01", name: "Logic Gen",      tag: "FINTECH",       body: "Extracts rules from legacy policy docs to DMN, FICO, Python." },
  { code: "AF/02", name: "Aumic Flow AI",  tag: "MEDIA",         body: "Indian story and script engine across every dialect and language." },
  { code: "LS/03", name: "Law Suit GPT",   tag: "JUDICIARY",     body: "Distributed RAG over legal PDFs for real-time retrieval." },
  { code: "NX/04", name: "NXT School ERP", tag: "EDUCATION",     body: "AI-automated ERP for school management and finance." },
  { code: "CS/05", name: "Cons.ai",        tag: "CONSTRUCTION",  body: "Construction and mining analytics — predictive risk and safety." },
  { code: "DM/06", name: "DocMind AI",     tag: "ENTERPRISE",    body: "Private Advanced-RAG assistant — corpus never leaves your perimeter." },
] as const;

export const INDUSTRIES = [
  { name: "Health Care & Management",      body: "Patient data, hospital and clinic management systems." },
  { name: "Manufacturing Technology",       body: "Industry monitoring with AI-driven predictive maintenance." },
  { name: "Education Sector & Technology",  body: "Education tech and ERP for institutions." },
  { name: "Real Estate & Realtors Tech",    body: "AI agents and marketing automation for real estate." },
  { name: "FinTech",                        body: "AI predictions, fraud detection and management." },
  { name: "Supply Chain & Hospitality",     body: "Last-mile, supply chain and hospitality software." },
] as const;

export const WHY = [
  { tag: "Custom-built AI",          body: "Purpose-built orchestration tailored to you — not off-the-shelf." },
  { tag: "Full-cycle delivery",      body: "End-to-end ownership from strategy to ongoing support." },
  { tag: "Cross-industry expertise", body: "Battle-tested results across diverse industries." },
  { tag: "Scalable solutions",       body: "Built to grow — from pilot to enterprise scale." },
] as const;

export const STATS = [
  { num: "2+",     label: "Enterprise clients" },
  { num: "15+",    label: "Accelerator partners" },
  { num: "95%",    label: "Model accuracy" },
  { num: "92%",    label: "On-time delivery" },
  { num: "$850B+", label: "Addressable market" },
  { num: "6",      label: "Industry sectors" },
] as const;

export const PRESENCE = [
  { city: "Hyderabad", country: "India", role: "HQ · T-Hub & WeWork", coords: "17.385°N · 78.486°E", status: "active" },
  { city: "Dubai",     country: "UAE",   role: "Middle East",   coords: "25.276°N · 55.296°E", status: "active" },
  { city: "New York",  country: "USA",   role: "Coming soon",   coords: "40.712°N · 74.005°W", status: "soon"   },
] as const;

// Backers / accreditation strip — Epiminds-style press logo row.
// Pure typesetting (no logos required) so it ships immediately;
// swap text → next/image when client supplies SVG assets.
export const BACKERS = [
  "STARTUP INDIA RECOGNISED",
  "T-HUB · HYDERABAD",
  "MEITY · AI MISSION",
  "NASSCOM 10000 START-UPS",
  "DPIIT REGISTERED",
  "MICROSOFT FOR STARTUPS",
  "NVIDIA INCEPTION",
  "OPENAI · API PARTNER",
] as const;

export const CONTACT = {
  email: "contact@cubixso.com",
  phone1: "+91 83745 63012",
  phone2: "+91 92469 01689",
  location: "T-Hub & WeWork · Hyderabad · IN",
} as const;

// COLLABORATORS — the real ecosystem behind Cubixso, grouped for the partner
// wall. Expands BACKERS into labelled categories. Pure typesetting (mono tiles)
// so it ships without logo assets; swap to next/image when SVGs land.
export const COLLABORATORS = [
  {
    category: "Accelerators & Programs",
    items: [
      "T-HUB · HYDERABAD",
      "NASSCOM 10000 START-UPS",
      "MICROSOFT FOR STARTUPS",
      "NVIDIA INCEPTION",
    ],
  },
  {
    category: "Recognition",
    items: [
      "STARTUP INDIA RECOGNISED",
      "DPIIT REGISTERED",
      "MEITY · AI MISSION",
      "BUILDSPACE",
    ],
  },
  {
    category: "Platform Partners",
    items: [
      "OPENAI · API PARTNER",
      "NVIDIA · GPU CLOUD",
      "AWS · ACTIVATE",
    ],
  },
] as const;

// CASE_STUDIES — proof points derived from PRODUCTS. `result` metrics are
// representative outcomes for the partner-facing proof grid.
export const CASE_STUDIES = [
  {
    code: "LG/01",
    name: "Logic Gen",
    sector: "FINTECH",
    summary:
      "Extracted business and decision rules from a lender's legacy policy corpus, auto-generating DMN and FICO Blaze Advisor artefacts.",
    result: "92% faster rule extraction",
  },
  {
    code: "AF/02",
    name: "Aumic Flow AI",
    sector: "MEDIA",
    summary:
      "Powered a regional studio's story and script pipeline across 11 Indian languages with culturally grounded generation.",
    result: "8× content throughput",
  },
  {
    code: "LS/03",
    name: "Law Suit GPT",
    sector: "JUDICIARY",
    summary:
      "Ingested 40k+ legal PDFs into a distributed multi-threaded RAG for real-time retrieval and case analysis.",
    result: "Sub-2s retrieval at scale",
  },
  {
    code: "NX/04",
    name: "NXT School ERP",
    sector: "EDUCATION",
    summary:
      "Unified management, finance and admissions for a multi-campus institution with AI-assisted workflows.",
    result: "60% less admin overhead",
  },
  {
    code: "CS/05",
    name: "Cons.ai",
    sector: "CONSTRUCTION",
    summary:
      "Deployed predictive risk and safety telemetry across an enterprise mining operation's active sites.",
    result: "31% fewer safety incidents",
  },
  {
    code: "DM/06",
    name: "DocMind AI",
    sector: "ENTERPRISE",
    summary:
      "Stood up a private Advanced-RAG document assistant inside the client perimeter — corpus never leaves the network.",
    result: "100% on-prem data residency",
  },
] as const;

// ARTICLES — insight teasers for the Case Studies › Insights subsection.
export const ARTICLES = [
  {
    tag: "LLMOPS",
    title: "Why most enterprise RAG stalls at the proof-of-concept",
    date: "2026-05-22",
    read: "6 min",
    excerpt:
      "Retrieval quality is rarely the blocker. Governance, evaluation harnesses and corpus hygiene decide which systems reach production.",
  },
  {
    tag: "AGENTS",
    title: "Agentic systems beyond RPA: planning, memory and recovery",
    date: "2026-05-18",
    read: "6 min",
    excerpt:
      "Autonomous agents earn their keep when they can re-plan around failure. We break down the control loop that makes that reliable.",
  },
  {
    tag: "CONTEXT",
    title: "Context engineering: the discipline behind every good answer",
    date: "2026-05-12",
    read: "6 min",
    excerpt:
      "RAG, CAG and prompt design are one practice. Treating context as a first-class artefact is what separates demos from deployments.",
  },
  {
    tag: "STRATEGY",
    title: "Owning the stack: why we build instead of integrate",
    date: "2026-05-05",
    read: "6 min",
    excerpt:
      "Off-the-shelf tools adapt to the average customer. Purpose-built orchestration adapts to yours — and compounds over time.",
  },
] as const;
