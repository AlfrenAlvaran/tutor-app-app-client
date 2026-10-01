import { ReactNode } from "react";

export type NavigationChild = {
  href: string;
  label: string;
};

export const navigationLinks: NavigationChild[] = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/values", label: "Values" },
  { href: "/enroll", label: "Enroll" },
];

export type TrustItem = {
  label: string;
  path: ReactNode;
};

export const TRUST_ITEMS: TrustItem[] = [
  {
    label: "Expert Tutors",
    path: (
      <>
        <path d="M22 10 12 5 2 10l10 5 10-5Z" />
        <path d="M6 12v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5" />
      </>
    ),
  },
  {
    label: "Trusted Support",
    path: <path d="M12 3 4 6v6c0 5 3.5 7.8 8 9 4.5-1.2 8-4 8-9V6l-8-3Z" />,
  },
  {
    label: "Proven Results",
    path: (
      <>
        <path d="M3 17 9 11l4 4 8-8" />
        <path d="M15 7h6v6" />
      </>
    ),
  },
];

export type ServiceItem = {
  title: string;
  desc: string;
  path: ReactNode;
  format?: string;
  features?: string[];
};

export const SERVICES: ServiceItem[] = [
  {
    title: "Academic Tutorials",
    desc: "All subjects. All levels.",
    format: "Online & In-person",
    features: [
      "One-on-one or small group sessions",
      "Aligned to your school's curriculum",
      "Progress reports every 4 weeks",
      "Flexible weekday & weekend scheduling",
    ],
    path: (
      <>
        <path d="M22 10 12 5 2 10l10 5 10-5Z" />
        <path d="M6 12v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5" />
      </>
    ),
  },
  {
    title: "Online Tutorials",
    desc: "Learn anytime, anywhere.",
    format: "Online",
    features: [
      "Live video sessions with screen sharing",
      "Digital worksheets & recorded replays",
      "Works on any device, no software installs",
      "Same tutor every session for continuity",
    ],
    path: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3c2.5 2.5 3.8 5.7 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-5.7-3.8-9S9.5 5.5 12 3Z" />
      </>
    ),
  },
  {
    title: "SPED Tutorials",
    desc: "Inclusive support. Every learner matters.",
    format: "Online & In-person",
    features: [
      "Tutors trained in individualized education plans",
      "Sensory-friendly pacing and materials",
      "Regular coordination with parents & schools",
      "Focus on strengths, not just gaps",
    ],
    path: (
      <>
        <path d="M20.8 8.6c0 5-8.8 10-8.8 10s-8.8-5-8.8-10a4.6 4.6 0 0 1 8.8-2 4.6 4.6 0 0 1 8.8 2Z" />
        <circle cx="12" cy="8.5" r="1.6" />
      </>
    ),
  },
  {
    title: "Piano & Guitar Lessons",
    desc: "Nurture creativity. Build confidence.",
    format: "In-person",
    features: [
      "Beginner to advanced skill levels",
      "Music theory woven into every lesson",
      "Recital opportunities twice a year",
      "Instrument recommendations for beginners",
    ],
    path: (
      <>
        <path d="M9 18V6l11-2v12" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="17" cy="16" r="3" />
      </>
    ),
  },
  {
    title: "Thesis & Research",
    desc: "Guidance you can trust. Results you can be proud of.",
    format: "Online & In-person",
    features: [
      "Topic development & literature review support",
      "Statistical analysis and methodology guidance",
      "Defense preparation and mock panels",
      "Citation & formatting review",
    ],
    path: (
      <>
        <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z" />
        <path d="M14 3v5h5M9 13h6M9 17h4" />
      </>
    ),
  },
  {
    title: "Entrance Exams",
    desc: "Prepare today, succeed tomorrow.",
    format: "Online & In-person",
    features: [
      "Full-length timed practice exams",
      "Covers UPCAT, ACET, and other major exams",
      "Weak-area diagnostics after every mock test",
      "Test-day strategy & anxiety coaching",
    ],
    path: (
      <>
        <rect x="6" y="3" width="12" height="18" rx="2" />
        <path d="M9 3v2h6V3M9 9l2 2 4-4" />
      </>
    ),
  },
  {
    title: "Adult Learners",
    desc: "It's never too late to learn and grow.",
    format: "Online & In-person",
    features: [
      "Sessions built around your work schedule",
      "Practical, goal-oriented curriculum",
      "No-judgment pacing at any starting level",
      "Options for professional certification prep",
    ],
    path: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
      </>
    ),
  },
];

export type FAQItem = { question: string; answer: string };

export const SERVICE_FAQS: FAQItem[] = [
  {
    question: "How do you match tutors to my learning goals?",
    answer:
      "After you submit your enrollment request, our team reviews your subject, age, and schedule details, then pairs you with a tutor whose background and teaching style fit best. You'll hear back within 1–2 business days.",
  },
  {
    question: "Can I switch between online and in-person sessions?",
    answer:
      "Yes. Many of our programs support both formats, and you can change your preference anytime by messaging your tutor or our team directly — no need to re-enroll.",
  },
  {
    question: "What if my child needs to reschedule a session?",
    answer:
      "We ask for at least 24 hours' notice when possible. Reach out to your tutor directly or our office, and we'll help find the next best slot that week.",
  },
  {
    question: "Do you offer trial sessions before enrolling fully?",
    answer:
      "Yes, a single trial session is available for most programs so you can meet your tutor and confirm the fit before committing to a full schedule.",
  },
  {
    question: "How is payment handled?",
    answer:
      "Enrollment online is a reservation request only — no payment is collected through the form. Our team confirms your schedule and payment details with you directly, offline.",
  },
];

export const PROGRAMS: string[] = [
  "Enrichment Programs",
  "Math Programs",
  "Language Programs",
  "ICT & Computer Skills",
  "Reading & Writing",
  "Science Programs",
  "Study Skills Training",
  "And Many More",
];

export type ValueItem = {
  label: string;
  path: ReactNode;
  description?: string;
};

export const VALUES: ValueItem[] = [
  {
    label: "Compassion",
    description:
      "Every learner arrives with a different story. Our tutors take the time to understand where a student is struggling emotionally, not just academically, and meet them there first.",
    path: (
      <path d="M20.8 8.6c0 5-8.8 10-8.8 10s-8.8-5-8.8-10a4.6 4.6 0 0 1 8.8-2 4.6 4.6 0 0 1 8.8 2Z" />
    ),
  },
  {
    label: "Excellence",
    description:
      "We hold ourselves to a high bar — not for the sake of prestige, but because every student deserves a tutor who is genuinely skilled, prepared, and invested in their growth.",
    path: (
      <path d="M12 2 15 9l7 1-5.2 5 1.2 7-6-3.4L6 22l1.2-7L2 10l7-1 3-7Z" />
    ),
  },
  {
    label: "Inclusivity",
    description:
      "Learning differences, backgrounds, and paces are not obstacles to work around — they're the starting point of how we design every lesson and match every tutor.",
    path: (
      <>
        <circle cx="9" cy="8" r="3" />
        <path d="M2 21c0-3.9 3.1-7 7-7s7 3.1 7 7" />
        <circle cx="17" cy="9" r="2.4" />
        <path d="M22 21c0-2.8-2-5-5-5.6" />
      </>
    ),
  },
  {
    label: "Integrity",
    description:
      "We tell parents the truth about progress, even when it's not what they hoped to hear, because trust is worth more than a flattering report.",
    path: (
      <>
        <path d="m8 12 2.5 2.5L16 9" />
        <path d="M4 7v5c0 4.5 3.4 6.8 8 8 4.6-1.2 8-3.5 8-8V7l-8-4-8 4Z" />
      </>
    ),
  },
  {
    label: "Commitment",
    description:
      "Real growth takes time. We stay with our students through the slow weeks and the breakthroughs alike, not just until the next milestone is hit.",
    path: (
      <>
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="4.5" />
        <circle cx="12" cy="12" r="0.8" fill="#f2d99a" />
      </>
    ),
  },
];

export const PROGRAM_OPTIONS: string[] = [
  "Academic Tutorials",
  "Online Tutorials",
  "SPED Tutorials",
  "Piano & Guitar Lessons",
  "Thesis & Research",
  "Entrance Exam Prep",
  "Adult Learners",
  "Other / Not Sure Yet",
];

export type ModeOption = { id: string; value: string };

export const MODE_OPTIONS: ModeOption[] = [
  { id: "mode-online", value: "Online" },
  { id: "mode-inperson", value: "In-person" },
  // { id: "mode-either", value: "Either is fine" },
];

export const ENROLL_STEPS: string[] = [
  "Fill in the enrollment form with your details and program of interest.",
  "Our team reviews your request and reaches out within 1–2 business days.",
  "We confirm your schedule, tutor, and payment details together.",
];

export type FooterLink = { href: string; label: string };

export const EXPLORE_LINKS: FooterLink[] = [
  { href: "#services", label: "Services" },
  { href: "#programs", label: "Programs" },
  { href: "#values", label: "Our Values" },
  { href: "#enroll", label: "Enroll" },
];

export const ENROLLMENT_FAQS: FAQItem[] = [
  {
    question: "How soon will someone contact me after I submit the form?",
    answer:
      "Our team reviews every request and reaches out within 1–2 business days to confirm your tutor, schedule, and next steps.",
  },
  {
    question: "Do I need to pay anything to submit this form?",
    answer:
      "No. This form is a reservation request only. Payment is handled offline, directly with our team, once your schedule is confirmed.",
  },
  {
    question: "What if I'm not sure which program fits best?",
    answer:
      'Select "Other / Not Sure Yet" in the program field, and briefly describe your goals in the message box — our team will help you figure out the right fit before your first session.',
  },
  {
    question: "Can I enroll more than one child at once?",
    answer:
      "Yes. Submit a separate form for each learner so we can match schedules and tutors individually, or mention all learners in the message field and we'll coordinate with you directly.",
  },
  {
    question: "Is there a minimum commitment period?",
    answer:
      "No long-term contract is required. Most families start with a trial session, then move to a weekly schedule once they're confident in the fit.",
  },
];
