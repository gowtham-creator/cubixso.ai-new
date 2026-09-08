# Cubixso.ai — LinkedIn Company Page copy

All copy below is drawn from the site's own source of truth (`src/lib/seo.ts`,
`src/lib/data.ts`) so the page, the site, and the JSON-LD Organization schema
tell one consistent story.

> **Check before publishing:** the site's backer strip lists `OPENAI · API PARTNER`
> and `NVIDIA · GPU CLOUD`. "Partner" is a claim LinkedIn readers (and OpenAI)
> read literally. The copy below deliberately says *builds on* rather than
> *partner with* for those two. Upgrade the wording only if you hold a signed
> partner agreement.

---

## 1. Tagline (LinkedIn limit: 120 characters)

**Primary — 78 chars**

```
Generative AI for the autonomous enterprise. Agentic systems, built end-to-end.
```

**Alternates**

```
We build the agents, pipelines, and platforms that run the autonomous enterprise.
```

```
AI-native product studio — agentic AI, LLMOps, and RAG, engineered for production.
```

---

## 2. Overview / About (LinkedIn limit: 2,000 characters — this is 1,893)

```
Cubixso.ai is an AI-native product studio. We design, build, and operate the intelligent systems enterprises run on — not pilots that stall in a notebook, but agentic products shipped to production and owned end-to-end.

AI is not a feature we add at the end. It is the architecture. Every engagement starts from the same question: what should this system decide on its own, and what should it escalate to a human?

WHAT WE BUILD

• Agentic autonomous systems — agents that plan, act, and complete work, well beyond traditional RPA
• LLM Operations (LLMOps) — enterprise deployment with evaluation, versioning, observability, and hard cost controls
• RAG, CAG & knowledge systems — retrieval and context engineering over your corpus, inside your perimeter
• Full-scale AI applications — web, mobile, APIs, and dashboards, delivered as a working system
• AI tools & workflow orchestration — advanced prompting, agent-to-agent handoffs, and automation that holds up under load

OUR PRODUCTS

Logic Gen (fintech) turns legacy policy documents into executable DMN, FICO, and Python rules. DocMind AI is a private advanced-RAG assistant whose corpus never leaves your network. Law Suit GPT runs distributed retrieval across legal archives. Aumic Flow AI is a story and script engine built for Indian languages and dialects. Cons.ai brings predictive risk and safety analytics to construction and mining. NXT School ERP automates school management and finance.

WHERE WE WORK

Healthcare, manufacturing, education, real estate, fintech, supply chain, and hospitality.

Headquartered in Hyderabad at T-Hub, with a presence in Dubai and New York opening next.

RECOGNITION

Startup India recognised · DPIIT registered · T-Hub · NASSCOM 10,000 Startups · Microsoft for Startups · NVIDIA Inception · MeitY AI Mission

Honest scoping, real timelines. We hand you a system, not a notebook.

Let's build something intelligent — contact@cubixso.com
```

---

## 3. Short overview (if you want a tighter page — 612 characters)

```
Cubixso.ai is an AI-native product studio. We design, build, and operate the intelligent systems enterprises run on — agentic autonomous systems, LLMOps, RAG and knowledge platforms, and full-scale AI applications shipped to production.

AI is not a feature we add at the end. It is the architecture.

Our products span fintech, legal, media, education, and construction — including Logic Gen, DocMind AI, and Law Suit GPT.

Headquartered in Hyderabad at T-Hub, with a presence in Dubai. Startup India recognised and DPIIT registered.

Honest scoping, real timelines. We hand you a system, not a notebook.

contact@cubixso.com
```

---

## 4. Specialties (LinkedIn allows up to 20; these are the 16 that matter)

```
Agentic AI
AI Agents
Generative AI
LLMOps
Retrieval-Augmented Generation (RAG)
Context Engineering
Enterprise AI
AI Product Engineering
Workflow Orchestration
Machine Learning
Natural Language Processing
AI Consulting
Intelligent Automation
Knowledge Systems
MLOps
Applied AI
```

---

## 5. Page field values

| Field | Value |
|---|---|
| Name | Cubixso.ai |
| Website | https://app.cubixso.com |
| Industry | Software Development *(alt: IT Services and IT Consulting)* |
| Company size | Set to your current headcount band |
| Company type | Privately Held |
| Founded | Confirm the year of incorporation before entering |
| Headquarters | Hyderabad, Telangana, India |
| Locations | Hyderabad (HQ, T-Hub) · Dubai, UAE |

---

## 6. Consistency notes

- Tagline matches `SITE_TAGLINE` in `src/lib/seo.ts`.
- "We hand you a system, not a notebook" is the live line from the site's Contact
  section — repeating it on LinkedIn is deliberate, not an accident.
- Services and product descriptions track `SERVICES` and `PRODUCTS` in
  `src/lib/data.ts`. If those change, update this file in the same commit.
- Keep the LinkedIn URL in `SAME_AS` (`src/lib/seo.ts`) pointing at the page so
  the Organization schema and the page stay linked in both directions.
