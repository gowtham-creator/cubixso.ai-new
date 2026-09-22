// legal.ts — all copy for the legal suite (/legal, /terms, /privacy).
// Kept separate from data.ts on purpose. Plain `as const` data; the
// rendering lives in components/legal/LegalLayout.tsx.
//
// NOTE: This is professionally drafted boilerplate for an enterprise AI
// company. It is NOT a substitute for advice from qualified legal counsel.
// See LEGAL_NOTE.

export const LEGAL_UPDATED = "Effective 1 June 2026" as const;

export const LEGAL_NOTE =
  "This document is a template provided for general informational purposes and does not constitute legal advice. It remains pending review by qualified legal counsel and should be adapted to your specific circumstances before being relied upon." as const;

// Registered-entity identifiers, shown on /legal.
//
// Each row RENDERS ONLY WHEN ITS VALUE IS NON-EMPTY, so a blank field is absent
// rather than shown as a dash.
//
// These are statutory identifiers — a typo here is a compliance problem, not a
// cosmetic one, so both were checked before publishing: the GSTIN's mod-36
// check digit computes to 2 and matches; its embedded PAN (AAMCC0213G) carries
// "C" in the 4th position, which is the Company code and is consistent with a
// Private Limited; and the CIN's state (TS) agrees with the GSTIN's state code
// (36, Telangana). Re-verify if either is ever edited.
export const LEGAL_ENTITY = {
  name: "Cubixso Solutions Private Limited",
  rows: [
    { label: "CIN", value: "U63999TS2024PTC187911" },
    { label: "GSTIN", value: "36AAMCC0213G1Z2" },
    { label: "DPIIT Recognition", value: "DIPP183547" },
    // The registered office is a statutory fact on the MCA and GST records —
    // it is NOT the working address. This row previously showed WeWork/T-Hub,
    // which is where the team sits, so the page contradicted the company's own
    // filings (and every directory that cites them). Registered office and
    // operating offices are now separate rows, each labelled for what it is.
    {
      label: "Registered office",
      value:
        "Plot No. 712 & 713, Flat No. 504, Matrusri Nagar, Serilingampally, Hyderabad, Rangareddy District, Telangana – 500049",
    },
    {
      label: "Offices",
      value: "T-Hub Phase 2, Madhapur · WeWork RMZ Spire, HITEC City, Hyderabad",
    },
    { label: "Also at", value: "Meydan Free Zone, Dubai, UAE" },
  ],
} as const;

// Cubixso's retained legal advisor, surfaced on /legal so anyone with a legal
// question can reach counsel directly instead of routing through the general
// inbox. Chambers address and professional email are as supplied by the firm.
export const LEGAL_ADVISOR = {
  name: "Abburi Ramdev",
  quals: "MBA, LL.B.",
  role: "High Court Advocate",
  firm: "Ramdev & Associates",
  relationship: "Legal Advisor to Cubixso.ai",
  email: "Advocate.ramdev9999@gmail.com",
  address: [
    "Flat No. 514, Block A",
    "Dollfine Estate, Janapriya Nagar",
    "Miyapur, Hyderabad 500049",
    "Telangana, India",
  ],
} as const;

export interface LegalSection {
  /** stable anchor id, e.g. "acceptance" */
  id: string;
  heading: string;
  /** each string is one paragraph */
  body: string[];
}

export const TERMS: readonly LegalSection[] = [
  {
    id: "acceptance",
    heading: "Acceptance of Terms",
    body: [
      "These Terms & Conditions (the \"Terms\") govern your access to and use of the websites, platforms, applications, and professional services offered by Cubixso.ai (\"Cubixso\", \"we\", \"us\", or \"our\"). By accessing our website, engaging our services, or executing an order form or statement of work with us, you agree to be bound by these Terms.",
      "If you are entering into these Terms on behalf of a company or other legal entity, you represent that you have the authority to bind that entity, in which case \"you\" and \"your\" refer to that entity. If you do not agree to these Terms, you must not access or use our services.",
      "These Terms apply in addition to any signed agreement between you and Cubixso. Where a separately negotiated agreement conflicts with these Terms, the signed agreement controls for that engagement.",
    ],
  },
  {
    id: "services",
    heading: "The Services",
    body: [
      "Cubixso designs, builds, and operates enterprise artificial intelligence systems, including large language model operations (LLMOps), agentic systems, AI agents, full-scale applications, workflow orchestration, and retrieval-augmented generation and knowledge systems (collectively, the \"Services\").",
      "The Services may be delivered as bespoke engineering engagements, hosted platforms, or a combination of both. We may update, enhance, or modify the Services from time to time to improve performance, security, or functionality.",
      "Access to certain Services may require credentials. You are responsible for maintaining the confidentiality of any access credentials issued to you and for all activity that occurs under your account.",
    ],
  },
  {
    id: "engagements",
    heading: "Engagements & Scope of Work",
    body: [
      "The specific deliverables, timelines, fees, and acceptance criteria for any professional engagement are defined in a mutually agreed statement of work, proposal, or order form (each, an \"SOW\"). Each SOW is incorporated into and governed by these Terms.",
      "Any work requested that falls outside the agreed scope of an SOW constitutes a change request and may be subject to additional fees and revised timelines. We will not commence out-of-scope work without your written approval.",
      "Unless otherwise stated in an SOW, fees are quoted exclusive of applicable taxes and are payable within the period specified on each invoice. Late payments may be subject to interest and may result in suspension of the Services.",
    ],
  },
  {
    id: "ip",
    heading: "Intellectual Property",
    body: [
      "Cubixso retains all right, title, and interest in and to its pre-existing materials, frameworks, tools, libraries, models, and methodologies used in delivering the Services, together with any improvements to them. Nothing in these Terms transfers ownership of our background intellectual property to you.",
      "Subject to full payment of all fees due under the applicable SOW, you receive the ownership or license rights to the bespoke deliverables expressly granted in that SOW. Where deliverables incorporate our background intellectual property or third-party components, we grant you a non-exclusive, worldwide license to use them solely as part of the delivered deliverables.",
      "You retain all right, title, and interest in your own materials, content, and data provided to us, and you grant us a limited license to use them only as necessary to perform the Services.",
    ],
  },
  {
    id: "customer-data",
    heading: "Customer Data & AI Model Usage",
    body: [
      "\"Customer Data\" means any data, content, prompts, documents, or records you or your authorized users submit to the Services. As between the parties, you own and remain responsible for your Customer Data and for ensuring you have the rights necessary to provide it to us.",
      "We process Customer Data only to provide, maintain, secure, and improve the Services as instructed by you and as described in our Privacy Policy. We do not use your Customer Data to train foundation models for the benefit of third parties without your explicit written consent.",
      "You are responsible for ensuring that your use of AI-generated outputs complies with applicable law and your internal policies. AI systems can produce inaccurate or unexpected results, and you should apply appropriate human review before relying on any output for material decisions.",
    ],
  },
  {
    id: "confidentiality",
    heading: "Confidentiality",
    body: [
      "Each party may receive information that the disclosing party treats as confidential (\"Confidential Information\"), including technical, business, and product information. The receiving party will use Confidential Information solely to perform its obligations under these Terms and will protect it with at least the same degree of care it uses for its own confidential information.",
      "Confidential Information does not include information that is or becomes publicly available through no fault of the receiving party, was rightfully known prior to disclosure, or is independently developed without reference to the disclosing party's Confidential Information.",
      "A receiving party may disclose Confidential Information if required by law or valid legal process, provided it gives reasonable prior notice to the disclosing party where legally permitted.",
    ],
  },
  {
    id: "warranties",
    heading: "Warranties & Disclaimers",
    body: [
      "Cubixso warrants that it will perform the Services in a professional and workmanlike manner consistent with generally accepted industry standards. This warranty does not apply to issues caused by your materials, third-party services, or use of the Services other than as intended.",
      "Except as expressly stated in these Terms, the Services and all deliverables are provided \"as is\" and \"as available\" without warranties of any kind, whether express, implied, or statutory, including any implied warranties of merchantability, fitness for a particular purpose, and non-infringement.",
      "We do not warrant that the Services will be uninterrupted, error-free, or completely secure, or that AI-generated outputs will be accurate, complete, or fit for any particular purpose.",
    ],
  },
  {
    id: "liability",
    heading: "Limitation of Liability",
    body: [
      "To the maximum extent permitted by applicable law, neither party will be liable for any indirect, incidental, special, consequential, or punitive damages, or for any loss of profits, revenue, data, or goodwill, arising out of or relating to these Terms, even if advised of the possibility of such damages.",
      "Except for liability arising from a party's gross negligence, willful misconduct, or breach of confidentiality obligations, each party's total aggregate liability arising out of or relating to these Terms will not exceed the total fees paid or payable by you to Cubixso under the applicable SOW during the twelve (12) months preceding the event giving rise to the claim.",
      "These limitations apply to all claims, whether based in contract, tort, or any other legal theory, and form an essential basis of the bargain between the parties.",
    ],
  },
  {
    id: "term-termination",
    heading: "Term & Termination",
    body: [
      "These Terms remain in effect for as long as you access or use the Services or while any SOW remains active. Either party may terminate an SOW for convenience on the notice period stated in that SOW, or, if none is stated, on thirty (30) days' prior written notice.",
      "Either party may terminate an SOW immediately upon written notice if the other party materially breaches these Terms and fails to cure the breach within thirty (30) days of receiving notice of it.",
      "Upon termination, you will pay all fees accrued up to the effective date of termination. Provisions that by their nature should survive termination — including intellectual property, confidentiality, disclaimers, and limitation of liability — will survive.",
    ],
  },
  {
    id: "governing-law",
    heading: "Governing Law",
    body: [
      "These Terms and any dispute or claim arising out of or in connection with them are governed by and construed in accordance with the laws of India, without regard to conflict-of-laws principles.",
      "Subject to any agreed dispute-resolution procedure, the parties submit to the exclusive jurisdiction of the courts located in Hyderabad, in the State of Telangana, India, for the resolution of any dispute arising under these Terms.",
      "Nothing in this section prevents either party from seeking interim or injunctive relief in any court of competent jurisdiction to protect its intellectual property or Confidential Information.",
    ],
  },
  {
    id: "changes",
    heading: "Changes to These Terms",
    body: [
      "We may revise these Terms from time to time to reflect changes in our Services, business practices, or legal obligations. When we make material changes, we will update the effective date shown on this page and, where appropriate, provide additional notice.",
      "Your continued access to or use of the Services after revised Terms take effect constitutes your acceptance of the revised Terms. If you do not agree to the changes, you should stop using the Services.",
    ],
  },
  {
    id: "contact",
    heading: "Contact",
    body: [
      "If you have questions about these Terms or wish to exercise any right described in them, please contact us at contact@cubixso.com.",
      "We aim to respond to all legitimate inquiries within a reasonable period and may request additional information to verify your identity before acting on a request.",
    ],
  },
] as const;

export const PRIVACY: readonly LegalSection[] = [
  {
    id: "overview",
    heading: "Overview",
    body: [
      "This Privacy Policy explains how Cubixso.ai (\"Cubixso\", \"we\", \"us\", or \"our\") collects, uses, discloses, and safeguards information when you visit our website, engage our services, or otherwise interact with us. We are committed to handling personal information responsibly and transparently.",
      "This Policy applies to information processed in connection with our websites and the enterprise AI services we provide. Where we act as a processor of personal data on behalf of a customer, our handling of that data is also governed by the relevant customer agreement.",
      "By using our website or services, you acknowledge that you have read and understood this Privacy Policy.",
    ],
  },
  {
    id: "information-we-collect",
    heading: "Information We Collect",
    body: [
      "We collect information you provide directly to us, such as your name, business email address, company, role, and the contents of any messages or inquiries you send. When you engage our services, we may collect project-related information necessary to deliver those services.",
      "We also collect certain information automatically when you visit our website, including your IP address, browser type, device information, pages viewed, and the dates and times of your visits. This information helps us operate, secure, and improve our website.",
      "We may receive information from third-party sources, such as analytics providers and business partners, in accordance with their privacy practices and applicable law.",
    ],
  },
  {
    id: "how-we-use",
    heading: "How We Use Information",
    body: [
      "We use the information we collect to provide, maintain, and improve our website and services; to respond to your inquiries; to communicate with you about engagements; and to manage our business relationship with you.",
      "We also use information to ensure the security and integrity of our systems, to detect and prevent fraud or misuse, to comply with legal obligations, and to enforce our agreements.",
      "Where required by applicable law, we rely on a lawful basis for processing personal data, such as your consent, the performance of a contract, our legitimate business interests, or compliance with a legal obligation.",
    ],
  },
  {
    id: "ai-model-data",
    heading: "AI & Model Data Handling",
    body: [
      "When you use our AI services, you may submit prompts, documents, and other content for processing. We process this content to generate outputs and deliver the services you have requested, consistent with your instructions and the applicable customer agreement.",
      "We do not use customer content to train foundation models for the benefit of unrelated third parties without explicit consent. Where we use service data to improve our own systems, we apply appropriate safeguards, including aggregation or de-identification where practicable.",
      "AI systems can generate inaccurate or unexpected outputs. We encourage appropriate human oversight and do not represent that AI-generated outputs are free of error or suitable for every purpose.",
    ],
  },
  {
    id: "cookies-analytics",
    heading: "Cookies & Analytics",
    body: [
      "Our website may use cookies and similar technologies to remember your preferences, understand how the site is used, and improve your experience. Some cookies are essential for the site to function, while others help us measure and analyze usage.",
      "We may use third-party analytics services that set their own cookies and process usage data on our behalf. You can usually control cookies through your browser settings, although disabling certain cookies may affect the functionality of the site.",
    ],
  },
  {
    id: "third-party-processors",
    heading: "Third-Party Processors",
    body: [
      "We engage trusted third-party service providers to support our operations, including cloud hosting, infrastructure, communications, and analytics. These providers process information only on our behalf and under contractual obligations consistent with this Privacy Policy.",
      "We do not sell personal information. We may share information with third parties where necessary to provide our services, comply with the law, protect our rights, or in connection with a business transaction such as a merger or acquisition.",
    ],
  },
  {
    id: "data-retention",
    heading: "Data Retention",
    body: [
      "We retain personal information for as long as necessary to fulfill the purposes described in this Policy, to provide our services, and to comply with our legal, accounting, and reporting obligations.",
      "When personal information is no longer required, we take reasonable steps to securely delete it or to anonymize it. Retention periods for customer content are governed by the applicable customer agreement.",
    ],
  },
  {
    id: "international-transfers",
    heading: "International Transfers",
    body: [
      "Cubixso operates across multiple jurisdictions, including India, the United Arab Emirates, and the United States. As a result, your information may be processed in, or transferred to, countries other than the one in which you are located.",
      "Where we transfer personal information across borders, we take steps to ensure it remains protected in accordance with this Policy and applicable data protection laws, including the use of appropriate contractual safeguards where required.",
    ],
  },
  {
    id: "your-rights",
    heading: "Your Rights",
    body: [
      "Depending on your location and applicable law, you may have rights regarding your personal information, including the right to access, correct, update, or delete it, and to object to or restrict certain processing.",
      "You may also have the right to withdraw consent where we rely on it, and to lodge a complaint with a relevant supervisory authority. To exercise any of these rights, please contact us using the details in the Contact section below.",
      "We may need to verify your identity before acting on a request and may decline requests where permitted or required by law.",
    ],
  },
  {
    id: "security",
    heading: "Security",
    body: [
      "We implement administrative, technical, and organizational measures designed to protect personal information against unauthorized access, disclosure, alteration, and destruction. These measures include access controls, encryption in transit where appropriate, and ongoing monitoring.",
      "No method of transmission or storage is completely secure, and we cannot guarantee absolute security. We encourage you to use strong credentials and to notify us promptly if you suspect any unauthorized use of your account.",
    ],
  },
  {
    id: "childrens-privacy",
    heading: "Children's Privacy",
    body: [
      "Our website and services are intended for businesses and professionals and are not directed to children. We do not knowingly collect personal information from children.",
      "If we become aware that we have inadvertently collected personal information from a child, we will take reasonable steps to delete it as required by applicable law.",
    ],
  },
  {
    id: "changes",
    heading: "Changes",
    body: [
      "We may update this Privacy Policy from time to time to reflect changes in our practices, technologies, or legal requirements. When we make material changes, we will update the effective date at the top of this page.",
      "We encourage you to review this Policy periodically. Your continued use of our website or services after changes take effect indicates your acknowledgment of the updated Policy.",
    ],
  },
  {
    id: "contact",
    heading: "Contact",
    body: [
      "If you have questions about this Privacy Policy or wish to exercise any of your rights, please contact us at contact@cubixso.com.",
      "We will make reasonable efforts to respond to legitimate requests within the timeframes required by applicable law.",
    ],
  },
] as const;
