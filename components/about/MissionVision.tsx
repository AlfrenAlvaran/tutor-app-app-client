"use client";

import { useState } from "react";

const pillars = [
  {
    id: "learning",
    label: "Personalized learning for every child",
    body: "One-on-one tutoring tailored to each student's pace, needs, and goals — making learning effective, engaging, and meaningful.",
    icon: "cap",
  },
  {
    id: "tutors",
    label: "Empowering freelance tutors",
    body: "We uplift freelance educators with fair opportunities, ongoing support, and a platform where they teach with passion, flexibility, and purpose.",
    icon: "handshake",
  },
  {
    id: "trust",
    label: "Earning families' trust through results",
    body: "We partner with parents by being consistent, transparent, and committed to real progress — building long-term trust through visible improvement and care.",
    icon: "compass",
  },
] as const;

function PillarIcon({ id }: { id: (typeof pillars)[number]["icon"] }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.4,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className: "h-7 w-7",
  };
  switch (id) {
    case "cap":
      return (
        <svg {...common}>
          <path d="M12 4 2 9l10 5 10-5-10-5Z" />
          <path d="M6 11.5V16c0 1.5 2.7 3 6 3s6-1.5 6-3v-4.5" />
        </svg>
      );
    case "handshake":
      return (
        <svg {...common}>
          <path d="M3 12l4-4 4 3 3-3 4 4" />
          <path d="M7 15l3 3 2-2 2 2 3-3" />
        </svg>
      );
    case "compass":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8.5" />
          <path d="M14.8 9.2 13 13l-3.8 1.8L11 11l3.8-1.8Z" />
        </svg>
      );
  }
}

export default function MissionVision() {
  const [active, setActive] = useState(0);
  const current = pillars[active];

  return (
    <section className="border-t border-navy-line px-6 py-24">
      <div className="mx-auto max-w-4xl">
        {/* Vision */}
        <div className="text-center">
          <p className="text-sm font-medium tracking-wide text-gold-500">
            Vision
          </p>
          <p className="mx-auto mt-5 max-w-2xl font-display text-2xl italic leading-snug text-cream sm:text-3xl">
            To become the most trusted, freelance-powered tutoring service in
            Metro Manila and nearby provinces — known for quality,
            personalized, results-driven education for every kind of learner.
          </p>
        </div>

        {/* Mission — interactive */}
        <div className="mt-20">
          <h2 className="text-center font-display text-3xl font-semibold sm:text-4xl">
            Our mission, in three parts
          </h2>

          <div className="mt-10 grid gap-8 sm:grid-cols-[minmax(0,280px)_1fr]">
            <div className="flex flex-col gap-2">
              {pillars.map((p, i) => (
                <button
                  key={p.id}
                  onClick={() => setActive(i)}
                  aria-pressed={active === i}
                  className={`rounded-lg border-l-2 px-4 py-3 text-left text-sm transition-colors ${
                    active === i
                      ? "border-gold-500 bg-navy-800 text-cream"
                      : "border-transparent text-ink-soft hover:text-cream"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <div
              key={current.id}
              className="animate-fade-rise rounded-2xl border border-navy-line bg-navy-800/60 p-8 shadow-card"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full border border-gold-600/40 text-gold-500">
                <PillarIcon id={current.icon} />
              </span>
              <h3 className="mt-5 font-display text-xl font-semibold">
                {current.label}
              </h3>
              <p className="mt-3 leading-relaxed text-ink-soft">
                {current.body}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}