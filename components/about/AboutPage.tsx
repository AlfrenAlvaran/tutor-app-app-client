import type { Metadata } from "next";
import MissionVision from "@/components/about/MissionVision";

export const metadata: Metadata = {
  title: "About ExcelEd — Educators Who Care",
  description:
    "ExcelEd connects freelance tutors, SPED specialists, and creative instructors with families across Metro Manila and beyond.",
};

const features = [
  {
    title: "All-subject tutors, vetted and ready",
    detail: "Academic, online, SPED, and enrichment lessons in one roster.",
  },
  {
    title: "Support that shows up, every session",
    detail: "A team behind each tutor, so families are never left waiting.",
  },
  {
    title: "Progress you can actually see",
    detail: "Clear milestones parents and learners can track together.",
  },
];

const values = [
  { name: "Compassion", icon: "heart" },
  { name: "Excellence", icon: "star" },
  { name: "Inclusivity", icon: "users" },
  { name: "Integrity", icon: "shield" },
  { name: "Commitment", icon: "target" },
] as const;

function ValueIcon({ id }: { id: (typeof values)[number]["icon"] }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.4,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className: "h-6 w-6",
  };
  switch (id) {
    case "heart":
      return (
        <svg {...common}>
          <path d="M12 20s-7-4.35-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 5c-2.5 4.65-9.5 9-9.5 9Z" />
        </svg>
      );
    case "star":
      return (
        <svg {...common}>
          <path d="M12 3l2.6 5.7 6.2.6-4.7 4.2 1.4 6.1L12 16.8 6.5 19.6l1.4-6.1L3.2 9.3l6.2-.6L12 3Z" />
        </svg>
      );
    case "users":
      return (
        <svg {...common}>
          <circle cx="9" cy="8" r="3" />
          <path d="M3 20a6 6 0 0 1 12 0" />
          <circle cx="17" cy="9" r="2.4" />
          <path d="M15.5 12.2A5 5 0 0 1 21 20" />
        </svg>
      );
    case "shield":
      return (
        <svg {...common}>
          <path d="M12 3l7 3v5.5c0 4.7-3 8-7 9.5-4-1.5-7-4.8-7-9.5V6l7-3Z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      );
    case "target":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="12" cy="12" r="0.6" fill="currentColor" />
        </svg>
      );
  }
}

export default function AboutPage() {
  return (
    <main className="bg-navy-950 font-body text-cream">
      {/* Hero */}
      <section className="relative overflow-hidden px-6 pt-28 pb-24 sm:pt-36 sm:pb-32">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "radial-gradient(rgba(201,162,39,0.18) 1px, transparent 1px)",
            backgroundSize: "26px 26px",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-10 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-gold-500/15 blur-[120px]"
        />

        <div className="relative mx-auto max-w-3xl text-center">
          <p className="text-sm font-medium tracking-wide text-gold-500">
            Our story
          </p>
          <h1 className="mt-4 font-display text-5xl font-semibold leading-[1.05] sm:text-6xl">
            About <span className="gold-text">ExcelEd</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl font-script text-2xl text-gold-400">
            Educators who care.
          </p>
          <p className="mx-auto mt-8 max-w-xl text-base leading-relaxed text-ink-soft">
            ExcelEd started as a small circle of freelance tutors who believed
            a lesson plan should bend to the learner, not the other way
            around. Today we connect academic tutors, SPED specialists, and
            creative instructors with families across Metro Manila and
            beyond — one learner at a time.
          </p>

          <div className="mt-12 grid gap-6 text-left sm:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-xl border border-navy-line bg-navy-800/60 p-5 shadow-card"
              >
                <p className="font-medium text-cream">{f.title}</p>
                <p className="mt-2 text-sm text-ink-faint">{f.detail}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
            <a
              href="/enroll"
              className="rounded-full bg-gold-500 px-7 py-3 text-sm font-semibold text-navy-950 shadow-gold transition-all hover:bg-gold-400 hover:shadow-gold-lg"
            >
              Enroll Online
            </a>
            <a
              href="/services"
              className="rounded-full border border-navy-line px-7 py-3 text-sm font-semibold text-cream transition-colors hover:border-gold-500 hover:text-gold-400"
            >
              Explore Programs
            </a>
          </div>
        </div>
      </section>

      {/* Vision + interactive Mission */}
      <MissionVision />

      {/* Values */}
      <section className="border-t border-navy-line bg-navy-900/60 px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center font-display text-3xl font-semibold sm:text-4xl">
            What we hold onto
          </h2>
          <div className="mt-12 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-5">
            {values.map((v) => (
              <div key={v.name} className="flex flex-col items-center text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-full border border-gold-600/40 text-gold-500">
                  <ValueIcon id={v.icon} />
                </span>
                <span className="mt-3 text-sm text-ink-soft">{v.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-2xl rounded-3xl border border-navy-line bg-gradient-to-b from-navy-800 to-navy-900 px-8 py-14 text-center shadow-panel">
          <h2 className="font-display text-3xl font-semibold sm:text-4xl">
            Let&rsquo;s grow together.
          </h2>
          <p className="mx-auto mt-4 max-w-md text-ink-soft">
            Whether you&rsquo;re looking for a tutor or ready to teach with
            us, there&rsquo;s a place for you at ExcelEd.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <a
              href="/enroll"
              className="rounded-full bg-gold-500 px-7 py-3 text-sm font-semibold text-navy-950 shadow-gold transition-all hover:bg-gold-400 hover:shadow-gold-lg"
            >
              Enroll Online
            </a>
            <a
              href="/services"
              className="rounded-full border border-navy-line px-7 py-3 text-sm font-semibold text-cream transition-colors hover:border-gold-500 hover:text-gold-400"
            >
              Explore Programs
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}