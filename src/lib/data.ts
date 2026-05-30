// Cubixso content — adapted from the two pitch decks the team already has.
// Source of truth for sections that consume product / service / industry data.

export const SERVICES = [
  { name: "LLM Operations (LLMOps)",       body: "Enterprise-grade deployment and management of Large Language Models with monitoring, versioning and cost controls." },
  { name: "Agentic Autonomous Systems",     body: "Autonomous AI agents that think, plan, and execute complex tasks — beyond traditional RPA." },
  { name: "AI Agents & Automation",         body: "Intelligent automation that goes beyond RPA — calling agents, customer-support bots, workflow agents." },
  { name: "Full-Scale AI Applications",     body: "End-to-end AI product development from concept to deployment — web, mobile, APIs, dashboards." },
  { name: "AI Tools & Workflow Orchestration", body: "Tool integration with advanced prompting, n8n, A2A and workflow automation." },
  { name: "RAG, CAG & Knowledge Systems",   body: "Enterprise knowledge management powered by Retrieval-Augmented Generation and Context Engineering." },
] as const;

export const PRODUCTS = [
  { code: "LG/01", name: "Logic Gen",      tag: "FINTECH",       body: "Business and decision rules extractor from legacy policy documents. Generates DMN, FICO Blaze Advisor and Python." },
  { code: "AF/02", name: "Aumic Flow AI",  tag: "MEDIA",         body: "Indian AI story and script engine delivering content in all Indian dialects, languages, cultures and traditions." },
  { code: "LS/03", name: "Law Suit GPT",   tag: "JUDICIARY",     body: "Distributed, multi-threaded RAG that ingests large-scale legal PDFs for real-time retrieval and analysis." },
  { code: "NX/04", name: "NXT School ERP", tag: "EDUCATION",     body: "Enterprise Resource Planning system for schools — management, finance administration, automated with AI." },
  { code: "CS/05", name: "Cons.ai",        tag: "CONSTRUCTION",  body: "Construction management + analysis for large enterprises and mining — predictive risk and safety telemetry." },
  { code: "DM/06", name: "DocMind AI",     tag: "ENTERPRISE",    body: "Private, enterprise-grade document assistant built on Advanced RAG. Your corpus never leaves your perimeter." },
] as const;

export const INDUSTRIES = [
  { name: "Health Care & Management",      body: "From patient data systems to hospital and medical-clinic management systems." },
  { name: "Manufacturing Technology",       body: "Manufacturing and industry monitoring with AI-driven predictive maintenance." },
  { name: "Education Sector & Technology",  body: "Education tech and ERP systems for institutions and organisations." },
  { name: "Real Estate & Realtors Tech",    body: "AI agents and AI marketing/automation for real estate at scale." },
  { name: "FinTech",                        body: "Fintech systems and AI predictions, fraud detection and management." },
  { name: "Supply Chain & Hospitality",     body: "Last-mile connectivity, supply chain transportation, hospitality software." },
] as const;

export const WHY = [
  { tag: "Custom-built AI",          body: "Purpose-built AI orchestration tailored to your needs — not off-the-shelf tools adapted after the fact." },
  { tag: "Full-cycle delivery",      body: "End-to-end ownership across strategy, development, deployment, and ongoing support." },
  { tag: "Cross-industry expertise", body: "Proven results across diverse industries — battle-tested experience in every engagement." },
  { tag: "Scalable solutions",       body: "Solutions designed to grow with your business — from pilots to enterprise-scale deployment." },
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
