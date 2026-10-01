"use client";

import { FormEvent, useEffect, useState } from "react";

import { MODE_OPTIONS, ENROLL_STEPS } from "@/constant/guest";
import type { EnrollProps } from "@/constant/guest/props";
import type { Program } from "@/constant/request/type";
import FormField from "../ui/FormField";
import ModePill from "../ui/ModePill";
import { submitEnrollment } from "@/libs/api/enroll";
import { fetchPrograms } from "@/libs/api/programs";

const selectClass =
  "w-full rounded-2.5 border border-gold-600/25 bg-white/3 px-3.75 py-3.25 font-body text-[0.94rem] text-cream outline-none transition-colors duration-200 focus:border-gold-500 focus:bg-gold-600/5";

const textareaClass =
  "w-full rounded-2.5 border border-gold-600/25 bg-white/3 px-3.75 py-3.25 font-body text-[0.94rem] text-cream outline-none transition-all duration-200 placeholder:text-ink-faint focus:border-gold-500 focus:bg-gold-600/5 focus:shadow-[0_0_0_3px_rgba(201,162,39,0.12)] min-h-22.5 resize-y";

export default function Enroll({
  id = "enroll",
  eyebrow = "Let's Grow Together",
  title = "Enroll online in a few minutes",
  description = "Tell us about your learning goals and we'll match you with the right tutor and schedule. This is a reservation request, not a payment — someone from our team will personally follow up with you.",
  onSubmitted,
}: EnrollProps) {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [mode, setMode] = useState("Online");

  const [programs, setPrograms] = useState<Program[]>([]);
  const [programsLoading, setProgramsLoading] = useState(true);
  const [programsError, setProgramsError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetchPrograms()
      .then((list) => {
        if (!cancelled) setPrograms(list);
      })
      .catch((err) => {
        if (!cancelled) {
          setProgramsError(
            err instanceof Error
              ? err.message
              : "Unable to load programs. Please refresh.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setProgramsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitting(true);

    const form = new FormData(e.currentTarget);

    const result = await submitEnrollment({
      name: String(form.get("name") ?? ""),
      phone: String(form.get("phone") ?? ""),
      email: String(form.get("email") ?? ""),
      age: String(form.get("age") ?? "") || undefined,
      program: String(form.get("program") ?? ""),
      mode,
      message: String(form.get("message") ?? "") || undefined,
      website: String(form.get("website") ?? "") || undefined,
    });

    setSubmitting(false);

    if (result.ok) {
      setSubmitted(true);
      onSubmitted?.();
    } else {
      setSubmitError(result.error);
    }
  };

  return (
    <section id={id} className="bg-navy-900 py-27.5">
      <div className="mx-auto max-w-295 px-7">
        <div className="grid grid-cols-1 items-start gap-14 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <span className="mb-4.5 inline-block rounded-full border border-gold-600 bg-linear-to-br from-gold-400/14 to-gold-600/8 px-8.5 py-2.5 font-display text-[0.95rem] font-bold uppercase tracking-[0.18em] text-gold-400">
              {eyebrow}
            </span>
            <h2 className="mb-4.5 font-display text-[clamp(2rem,3.4vw,2.7rem)] leading-[1.15]">
              {title}
            </h2>
            <p className="mb-7 leading-relaxed text-ink-soft">{description}</p>

            <ol className="relative flex flex-col gap-4.5">
              {/* connecting line behind the numbered steps */}
              <span className="absolute left-3.75 top-3.75 bottom-3.75 w-px bg-linear-to-b from-gold-600/40 via-gold-600/15 to-transparent" />
              {ENROLL_STEPS.map((step, i) => (
                <li
                  key={step}
                  className="relative flex items-start gap-4 text-[0.94rem] text-ink-soft"
                >
                  <span className="relative z-1 flex h-7.5 w-7.5 shrink-0 items-center justify-center rounded-full border border-gold-600 bg-navy-900 font-display text-[0.85rem] font-bold text-gold-400">
                    {i + 1}
                  </span>
                  <span className="pt-1">{step}</span>
                </li>
              ))}
            </ol>

            <div className="mt-7.5 flex gap-3 rounded-xl border border-gold-600 bg-gold-600/6 px-4.5 py-4 text-[0.86rem] leading-[1.55] text-gold-400">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mt-px h-5 w-5 shrink-0 stroke-gold-400"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M12 8v4M12 16h.01" />
              </svg>
              <span>
                This form does not process payment. Enrollment is confirmed and
                paid for offline, directly with our team.
              </span>
            </div>
          </div>

          <div
            className="rounded-[20px] border border-gold-600/25 p-6 shadow-panel transition-all duration-500 sm:p-10"
            style={{
              background: "linear-gradient(160deg, #122448, #060e24)",
            }}
          >
            {!submitted ? (
              <form onSubmit={handleSubmit}>
                {/* Honeypot — hidden from real users, bots tend to fill it in */}
                <input
                  type="text"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    left: "-9999px",
                    width: 1,
                    height: 1,
                  }}
                />

                <div className="grid grid-cols-1 gap-x-5 sm:grid-cols-2">
                  <FormField
                    id="name"
                    name="name"
                    label="Full name"
                    type="text"
                    placeholder="Juan Dela Cruz"
                    required
                  />
                  <FormField
                    id="phone"
                    name="phone"
                    label="Contact number"
                    type="tel"
                    placeholder="09XX XXX XXXX"
                    pattern="[0-9+\s]{7,}"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 gap-x-5 sm:grid-cols-2">
                  <FormField
                    id="email"
                    name="email"
                    label="Email address"
                    type="email"
                    placeholder="you@email.com"
                    required
                  />
                  <FormField
                    id="age"
                    name="age"
                    label="Learner's age"
                    type="number"
                    placeholder="e.g. 10"
                    min={3}
                    max={99}
                  />
                </div>

                <div className="mb-5">
                  <label
                    htmlFor="program"
                    className="mb-2 block text-[0.78rem] font-semibold uppercase tracking-[0.08em] text-ink-faint"
                  >
                    Program of interest
                  </label>
                  <select
                    id="program"
                    name="program"
                    required
                    defaultValue=""
                    disabled={programsLoading || !!programsError}
                    className={`select-gold ${selectClass}`}
                  >
                    <option
                      value=""
                      disabled
                      className="bg-white text-navy-900"
                    >
                      {programsLoading
                        ? "Loading programs..."
                        : programsError
                          ? "Unable to load programs"
                          : "Select a program"}
                    </option>
                    {programs.map((program) => (
                      <option
                        key={program.id}
                        value={program.label}
                        className="bg-white text-navy-900"
                      >
                        {program.label}
                      </option>
                    ))}
                  </select>
                  {programsError && (
                    <p className="mt-2 text-[0.8rem] text-red-300">
                      {programsError}
                    </p>
                  )}
                </div>

                <div className="mb-5">
                  <span className="mb-2 block text-[0.78rem] font-semibold uppercase tracking-[0.08em] text-ink-faint">
                    Preferred mode
                  </span>
                  <div className="flex flex-wrap gap-3.5">
                    {MODE_OPTIONS.map((option) => (
                      <ModePill
                        key={option.id}
                        option={option}
                        selected={mode === option.value}
                        onSelect={setMode}
                      />
                    ))}
                  </div>
                </div>

                <div className="mb-5">
                  <label
                    htmlFor="message"
                    className="mb-2 block text-[0.78rem] font-semibold uppercase tracking-[0.08em] text-ink-faint"
                  >
                    Anything we should know?
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    placeholder="Preferred schedule, learning goals, or questions..."
                    className={textareaClass}
                  />
                </div>

                {submitError && (
                  <p className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2.5 text-[0.85rem] text-red-300">
                    {submitError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={submitting || programsLoading}
                  className="mt-1.5 flex w-full items-center justify-center gap-2.5 rounded-xl bg-linear-to-br from-gold-400 via-gold-600 to-gold-deep py-3.75 text-[0.98rem] font-semibold text-[#1a1204] shadow-gold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-gold-lg disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
                >
                  {submitting ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#1a1204]/30 border-t-[#1a1204]" />
                      Sending request...
                    </>
                  ) : (
                    "Send Enrollment Request"
                  )}
                </button>
                <p className="mt-3.5 text-center text-[0.78rem] text-ink-faint">
                  No payment is collected here. We&apos;ll contact you to
                  confirm the details.
                </p>
              </form>
            ) : (
              <div className="animate-[fadeInUp_0.4s_ease-out] px-5 py-12 text-center">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mx-auto mb-4.5 h-13 w-13 stroke-success"
                >
                  <circle cx="12" cy="12" r="9" />
                  <path
                    d="m8 12.5 2.5 2.5L16 9.5"
                    style={{
                      strokeDasharray: 20,
                      strokeDashoffset: 0,
                      animation: "drawCheck 0.5s ease-out 0.2s backwards",
                    }}
                  />
                </svg>
                <h3 className="mb-2.5 text-[1.4rem] text-cream">
                  Request received!
                </h3>
                <p className="text-[0.92rem] leading-relaxed text-ink-soft">
                  Thank you for reaching out to ExcelEd. Our team will contact
                  you within 1–2 business days to confirm your schedule — no
                  payment needed right now.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes drawCheck {
          from {
            stroke-dashoffset: 20;
          }
          to {
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </section>
  );
}
