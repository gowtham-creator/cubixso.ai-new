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
  /** skill chips shown in the bio panel */
  skills?: string[];
  links?: { label: string; href: string }[];
  /** open-position slots render with a quieter, recruiting voice */
  open?: boolean;
}

export const TEAM: TeamMember[] = [
  {
    slug: "nayini-gowtham-reddy",
    name: "Nayini Gowtham Reddy",
    role: "Founder & Managing Director",
    group: "Executive",
    initials: "GR",
    photo: "/team/nayini-gowtham-reddy.jpg",
    bio: [
      "Gowtham founded Cubixso.ai with a single conviction: the autonomous enterprise is not a distant future. It is an engineering problem, and it can be owned end-to-end. From T-HUB Hyderabad, he leads a studio that designs, builds, and operates generative-AI systems for organisations that need outcomes, not experiments.",
      "Under his direction Cubixso has shipped agentic platforms, retrieval systems, and LLM operations across fintech, education, construction, media, and the judiciary, each engagement carried from first whiteboard to production telemetry by one accountable team.",
    ],
    links: [{ label: "Contact", href: "/contact" }],
  },
  {
    slug: "praveen-kumar-reddy-nayini",
    name: "Praveen Kumar Reddy Nayini",
    role: "CEO & Marketing President",
    group: "Executive",
    initials: "PR",
    photo: "/team/praveen-kumar-reddy-nayini.jpg",
    bio: [
      "Praveen leads Cubixso.ai as Chief Executive, setting the company's direction and owning how its work reaches the market. He pairs a builder's instinct with a sharp commercial sense, turning the studio's engineering depth into outcomes clients can measure.",
      "As Marketing President he shapes the brand and the story behind every engagement, making sure the way Cubixso shows up in the world matches the quality of what it ships.",
    ],
    links: [{ label: "Contact", href: "/contact" }],
  },
  {
    slug: "parthunjay-kyama",
    name: "Parthunjay Kyama",
    role: "CBDO & Marketing Vice President",
    group: "Executive",
    initials: "PK",
    photo: "/team/parthunjay-kyama.jpg",
    bio: [
      "Parthunjay drives business development at Cubixso.ai, opening the partnerships and client relationships that turn capability into growth. He works the space between what the studio can build and what the market needs, and closes the gap.",
      "As Marketing Vice President he runs go-to-market and demand, carrying each opportunity from first conversation to a signed, scoped engagement.",
    ],
    links: [{ label: "Contact", href: "/contact" }],
  },
  {
    slug: "puchapalli-nagendra-prasad",
    name: "Puchapalli Nagendra Prasad",
    role: "Senior Business & Sales Consultant",
    group: "Executive",
    initials: "NP",
    photo: "/team/puchapalli-nagendra-prasad.jpg",
    bio: [
      "Nagendra brings deep field experience to Cubixso.ai, advising on business and sales across the sectors the studio serves. He knows how enterprise deals really move, and he keeps every engagement grounded in what customers will actually buy and value.",
      "His counsel connects the technical work to commercial reality, helping turn strong systems into lasting client relationships.",
    ],
    links: [{ label: "Contact", href: "/contact" }],
  },
  {
    slug: "g-sudharshan-sastry",
    name: "G Sudharshan Sastry",
    role: "Senior AI Engineer",
    group: "Engineering",
    initials: "SS",
    photo: "/team/g-sudharshan-sastry.jpg",
    bio: [
      "Sudharshan builds the intelligence layer at Cubixso.ai: agentic systems that reason, call tools, and act in production. He works hands-on across the modern AI stack, orchestration frameworks like LangGraph, retrieval pipelines over pgvector and vector search, MCP tool integrations, and the frontier model APIs, with evaluation harnesses and guardrails around every behaviour that ships.",
      "The senior role is where engineering discipline meets AI: he owns systems from architecture to telemetry, runs eval-first development with versioned prompts, and holds the cost and latency budgets that make AI viable at scale. He treats a model in production the way an SRE treats uptime, measured, monitored, and accountable.",
    ],
    skills: [
      "Agentic systems",
      "LangGraph orchestration",
      "RAG & pgvector",
      "MCP integrations",
      "LLM evals & guardrails",
      "Prompt engineering",
      "LLMOps & telemetry",
      "Cost & latency optimisation",
    ],
    links: [{ label: "Contact", href: "/contact" }],
  },
  {
    slug: "d-ganapathi-varaprasad",
    name: "D Ganapathi Varaprasad",
    role: "Senior Full-Stack Engineer",
    group: "Engineering",
    initials: "GV",
    photo: "/team/d-ganapathi-varaprasad.jpg",
    bio: [
      "Ganapathi ships products end-to-end at Cubixso.ai: TypeScript across Next.js and NestJS, Flutter on mobile, PostgreSQL and Redis underneath, and CI/CD pipelines that deploy without downtime. His edge is AI-orchestrated development, agentic coding tools driving spec-to-ship workflows, so features that once took a sprint land in days with tests and reviews intact.",
      "As a senior engineer he designs the architecture, sets the quality gates, and carries systems from first commit to production observability. AI multiplies his throughput; the engineering judgment on scale, security, and data integrity stays his, and it shows in platforms that hold up under real national load.",
    ],
    skills: [
      "TypeScript",
      "Next.js & React",
      "NestJS APIs",
      "Flutter",
      "PostgreSQL & Redis",
      "CI/CD & DevOps",
      "AI-orchestrated development",
      "System design",
    ],
    links: [{ label: "Contact", href: "/contact" }],
  },
  {
    slug: "vishnu-sai",
    name: "Vishnu Sai",
    role: "AWS Cloud Engineer",
    group: "Engineering",
    initials: "VS",
    photo: "/team/vishnu-sai.jpg",
    bio: [
      "Vishnu runs the cloud floor at Cubixso.ai. An AWS engineer with over three years of hands-on industrial experience and four years managing cloud services and products, he designs the networks, compute, and serverless estates the studio's platforms live on, along with the CI/CD, identity, and cost governance that keep them fast, secure, and affordable.",
      "He currently leads NXT Schools, Cubixso's education platform, as Technical Lead, owning its architecture from infrastructure to release. His playbook is boring reliability: infrastructure as code, observability on every service, and autoscaling proven under load before launch day, not after.",
    ],
    skills: [
      "AWS (EC2, Lambda, RDS, S3)",
      "Infrastructure as Code",
      "CI/CD pipelines",
      "IAM & cloud security",
      "Cost optimisation",
      "Docker & Kubernetes",
      "Observability & monitoring",
      "Cloud product management",
    ],
    links: [{ label: "Contact", href: "/contact" }],
  },
  {
    slug: "shanmukh-ramachandruni",
    name: "Shanmukh Ramachandruni",
    role: "Senior Application Developer & Engineer",
    group: "Engineering",
    initials: "SR",
    photo: "/team/shanmukh-ramachandruni.jpg",
    bio: [
      "Shanmukh builds the apps people actually hold. With four years of shipping production applications in Flutter and React Native, he has orchestrated and delivered live products end to end: architecture, state management, offline behaviour, store releases, and the performance work that keeps interfaces smooth on mid-range phones and patchy networks.",
      "He currently leads NXT Schools as Product Lead at Cubixso.ai, pairing engineering depth with product judgment: listening to users, cutting scope to what matters, and shipping in weekly increments. The result is mobile software that survives real classrooms, real networks, and real scale.",
    ],
    skills: [
      "Flutter & Dart",
      "React Native",
      "Mobile architecture",
      "Offline-first sync",
      "App Store & Play releases",
      "Performance profiling",
      "Mobile CI/CD",
      "Product leadership",
    ],
    links: [{ label: "Contact", href: "/contact" }],
  },
  {
    slug: "prem-sai",
    name: "Prem Sai",
    role: "Product Manager & Business Lead",
    group: "Engineering",
    initials: "PS",
    photo: "/team/prem-sai.jpg",
    bio: [
      "Prem connects what Cubixso builds to why it sells. With more than three years across real industry, he has run business operations end to end: discovery, lead closure, delivery oversight, and the product management in between, turning ambiguous client problems into scoped, shippable roadmaps.",
      "As Product Manager and Business Lead he owns the space between clients and the engineering pod: requirements, priorities, timelines, and the honest trade-off conversations that keep both sides winning. Teams ship faster with him in the room because the target is clear before the first commit.",
    ],
    skills: [
      "Product management",
      "Business operations",
      "Lead closure & sales",
      "Roadmapping & scoping",
      "Client engagement",
      "Delivery management",
      "Analytics & reporting",
    ],
    links: [{ label: "Contact", href: "/contact" }],
  },
];

export const TEAM_GROUPS = ["Executive", "Engineering", "Advisors"] as const;
