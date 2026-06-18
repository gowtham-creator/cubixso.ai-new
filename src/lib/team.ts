// Team / leadership data — the single file to edit when posting real people.
// The /leadership page is fully data-driven: add a member here, drop their
// portrait at /public/team/<slug>.jpg (4:5 works best), and the grid + bio
// panel render it. No component changes needed. Members without a `photo`
// render a dignified initials-avatar (deep-blue→cobalt wash) so open roles
// read as intentional, not empty.

export interface TeamMember {
  slug: string;
  name: string;
  role: string;
  group: "Executive" | "Engineering" | "Advisors";
  /** bio paragraphs — first one is the lede */
  bio: string[];
  initials: string;
  /** path under /public, e.g. "/team/gowtham-reddy.jpg" — optional */
  photo?: string;
  links?: { label: string; href: string }[];
  /** open-position slots render with a quieter, recruiting voice */
  open?: boolean;
}

export const TEAM: TeamMember[] = [
  {
    slug: "gowtham-reddy-nayini",
    name: "Gowtham Reddy Nayini",
    role: "Founder & Chief Executive",
    group: "Executive",
    initials: "GR",
    bio: [
      "Gowtham founded Cubixso.ai with a single conviction: the autonomous enterprise is not a distant future — it is an engineering problem, and it can be owned end-to-end. From T-HUB Hyderabad, he leads a studio that designs, builds, and operates generative-AI systems for organisations that need outcomes, not experiments.",
      "Under his direction Cubixso has shipped agentic platforms, retrieval systems, and LLM operations across fintech, education, construction, media, and the judiciary — each engagement carried from first whiteboard to production telemetry by one accountable team.",
    ],
    links: [{ label: "Contact", href: "/contact" }],
  },
  {
    slug: "chief-technology-officer",
    name: "Position open",
    role: "Chief Technology Officer",
    group: "Executive",
    initials: "CT",
    open: true,
    bio: [
      "The CTO mandate: own the technical spine of every Cubixso system — model strategy, platform architecture, and the engineering culture that keeps agentic software dependable at enterprise scale.",
      "We are looking for someone who has carried AI systems from research notebooks into regulated production, and who believes reliability is a design discipline, not an afterthought.",
    ],
  },
  {
    slug: "head-of-ai-research",
    name: "Position open",
    role: "Head of AI Research",
    group: "Engineering",
    initials: "AR",
    open: true,
    bio: [
      "This mandate leads applied research: retrieval architectures, agent planning and memory, evaluation harnesses, and the model-selection judgement that separates a demo from a dependable system.",
      "The work is published in production, not papers — every line of research lands inside a client system with telemetry to prove it.",
    ],
  },
  {
    slug: "vp-engineering",
    name: "Position open",
    role: "VP Engineering",
    group: "Engineering",
    initials: "VE",
    open: true,
    bio: [
      "The VP Engineering mandate: own delivery — the pipelines, review culture, and operational discipline that let a small senior team ship enterprise systems with a 92% on-time record and sleep at night.",
    ],
  },
  {
    slug: "head-of-design",
    name: "Position open",
    role: "Head of Design",
    group: "Engineering",
    initials: "HD",
    open: true,
    bio: [
      "Design at Cubixso means interfaces for systems that think — surfacing agent reasoning, building trust through legibility, and holding the product bar at the level of the best consumer software while serving enterprise complexity.",
    ],
  },
  {
    slug: "vp-delivery",
    name: "Position open",
    role: "VP Delivery & Client Partnerships",
    group: "Executive",
    initials: "VD",
    open: true,
    bio: [
      "This mandate owns the client relationship from first scoping call to steady-state operations — translating enterprise ambition into staged, measurable engagements across our Hyderabad and UAE presence.",
    ],
  },
  {
    slug: "advisor-enterprise-ai",
    name: "Position open",
    role: "Advisor — Enterprise AI",
    group: "Advisors",
    initials: "EA",
    open: true,
    bio: [
      "We are assembling a small bench of advisors who have operated AI programmes inside large organisations — people who know where transformation efforts stall and how governance, procurement, and engineering actually meet.",
    ],
  },
  {
    slug: "advisor-industry",
    name: "Position open",
    role: "Advisor — Industry & Growth",
    group: "Advisors",
    initials: "IG",
    open: true,
    bio: [
      "Sector advisors deepen our judgement in the industries we serve — fintech, education, construction, media, and the judiciary — keeping every system we ship grounded in how the domain really works.",
    ],
  },
];

export const TEAM_GROUPS = ["Executive", "Engineering", "Advisors"] as const;
