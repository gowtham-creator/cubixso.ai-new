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
];

export const TEAM_GROUPS = ["Executive", "Engineering", "Advisors"] as const;
