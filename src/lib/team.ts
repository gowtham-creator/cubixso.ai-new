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
    group: "Advisors",
    initials: "NP",
    photo: "/team/puchapalli-nagendra-prasad.jpg",
    bio: [
      "Nagendra brings deep field experience to Cubixso.ai, advising on business and sales across the sectors the studio serves. He knows how enterprise deals really move, and he keeps every engagement grounded in what customers will actually buy and value.",
      "His counsel connects the technical work to commercial reality, helping turn strong systems into lasting client relationships.",
    ],
    links: [{ label: "Contact", href: "/contact" }],
  },
];

export const TEAM_GROUPS = ["Executive", "Engineering", "Advisors"] as const;
