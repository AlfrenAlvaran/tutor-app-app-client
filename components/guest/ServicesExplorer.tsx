"use client";

import { useState, useRef, KeyboardEvent } from "react";
import { SERVICES } from "@/constant/guest";
import type { ServicesExplorerProps } from "@/constant/guest/props";
import Link from "next/link";

export default function ServicesExplorer({
  id = "services",
}: ServicesExplorerProps) {
  const [active, setActive] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const current = SERVICES[active];

  const focusTab = (index: number) => {
    const next = (index + SERVICES.length) % SERVICES.length;
    setActive(next);
    tabRefs.current[next]?.focus();
    tabRefs.current[next]?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  };

  const handleKeyDown = (
    e: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      e.preventDefault();
      focusTab(index + 1);
    } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      e.preventDefault();
      focusTab(index - 1);
    } else if (e.key === "Home") {
      e.preventDefault();
      focusTab(0);
    } else if (e.key === "End") {
      e.preventDefault();
      focusTab(SERVICES.length - 1);
    }
  };

  return (
    <section id={id} className="bg-navy-900 py-16 sm:py-24">
      <div className="mx-auto max-w-295 px-5 sm:px-7">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:gap-10">
          {/* Tab list — horizontal scroll pills on mobile, vertical list on desktop.
              Edge fade hints that it scrolls; ring visible on keyboard focus. */}
          <div
            role="tablist"
            aria-label="Programs offered"
            className="[mask-image:linear-gradient(to_right,transparent,black_16px,black_calc(100%-16px),transparent)] flex gap-2.5 overflow-x-auto pb-2 lg:[mask-image:none] lg:flex-col lg:gap-1.5 lg:overflow-visible lg:pb-0"
          >
            {SERVICES.map((service, index) => {
              const isActive = index === active;
              const tabId = `${id}-tab-${index}`;
              const panelId = `${id}-panel-${index}`;

              return (
                <button
                  key={service.title}
                  ref={(el) => {
                    tabRefs.current[index] = el;
                  }}
                  id={tabId}
                  role="tab"
                  type="button"
                  aria-selected={isActive}
                  aria-controls={panelId}
                  tabIndex={isActive ? 0 : -1}
                  onClick={() => setActive(index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  className={`group relative flex shrink-0 items-center gap-3.5 rounded-xl border px-4.5 py-3.5 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-900 lg:w-full ${
                    isActive
                      ? "border-gold-500 bg-gold-600/8 shadow-[0_0_0_1px_rgba(201,162,39,0.2)]"
                      : "border-white/6 hover:border-gold-600/30 hover:bg-white/2"
                  }`}
                >
                  <span
                    className={`flex h-9.5 w-9.5 shrink-0 items-center justify-center rounded-full border-[1.5px] transition-colors duration-200 ${
                      isActive
                        ? "border-gold-500 bg-gold-600/10"
                        : "border-gold-600/30"
                    }`}
                  >
                    {service.path ? (
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                        className={`h-4.5 w-4.5 transition-colors duration-200 ${
                          isActive ? "stroke-gold-300" : "stroke-gold-400/70"
                        }`}
                      >
                        {service.path}
                      </svg>
                    ) : (
                      <span
                        aria-hidden="true"
                        className={`h-2 w-2 rounded-full ${
                          isActive ? "bg-gold-300" : "bg-gold-400/70"
                        }`}
                      />
                    )}
                  </span>

                  <span className="min-w-0">
                    <span
                      className={`block whitespace-nowrap text-[0.92rem] font-semibold transition-colors duration-200 lg:whitespace-normal ${
                        isActive
                          ? "text-cream"
                          : "text-ink-soft group-hover:text-cream"
                      }`}
                    >
                      {service.title}
                    </span>
                    <span className="hidden text-[0.78rem] text-ink-faint lg:block">
                      {service.desc}
                    </span>
                  </span>

                  {isActive && (
                    <span className="absolute left-0 top-1/2 hidden h-6 w-0.75 -translate-y-1/2 rounded-full bg-gold-500 lg:block" />
                  )}
                </button>
              );
            })}
          </div>

          <div
            key={active}
            id={`${id}-panel-${active}`}
            role="tabpanel"
            aria-labelledby={`${id}-tab-${active}`}
            tabIndex={0}
            className="motion-safe:animate-[panelIn_0.35s_ease-out] rounded-3xl border border-gold-600/25 p-7 sm:p-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
            style={{ background: "linear-gradient(160deg, #122448, #0a1836)" }}
          >
            <div className="mb-6 flex items-start gap-4.5">
              <span className="flex h-14.5 w-14.5 shrink-0 items-center justify-center rounded-full border-[1.5px] border-gold-600 bg-gold-600/8">
                {current.path ? (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    className="h-7 w-7 stroke-gold-400"
                  >
                    {current.path}
                  </svg>
                ) : (
                  <span
                    aria-hidden="true"
                    className="h-3 w-3 rounded-full bg-gold-400"
                  />
                )}
              </span>
              <div>
                <h3 className="font-display text-[1.5rem] font-bold text-cream sm:text-[1.7rem]">
                  {current.title}
                </h3>
                {current.format && (
                  <span className="mt-1.5 inline-block rounded-full border border-gold-600/40 px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.06em] text-gold-400">
                    {current.format}
                  </span>
                )}
              </div>
            </div>
            <p className="mb-7 leading-relaxed text-ink-soft">{current.desc}</p>

            {current.features && (
              <ul className="mb-8 flex flex-col gap-3.5">
                {current.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-3 text-[0.92rem] text-ink-soft"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                      className="mt-0.5 h-4.5 w-4.5 shrink-0 stroke-gold-400"
                    >
                      <path d="m5 13 4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            )}

            <Link
              href={`/enroll`}
              aria-label={`Enroll in ${current.title}`}
              className="group inline-flex items-center gap-2 rounded-full bg-linear-to-br from-gold-400 via-gold-600 to-gold-deep px-6.5 py-3 text-[0.9rem] font-semibold text-[#1a1204] shadow-gold transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-gold-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-300 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-900"
            >
              Enroll in this program
              <svg
                viewBox="0 0 24 24"
                fill="none"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
              >
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes panelIn {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
}
