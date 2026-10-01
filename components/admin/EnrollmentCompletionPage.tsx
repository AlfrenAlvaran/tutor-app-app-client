"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";


const ENROLL_API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "/api";

const infoUrl = (token: string) => `${ENROLL_API_BASE}/inquire/enroll/${token}`;
const completeUrl = (token: string) =>
  `${ENROLL_API_BASE}/inquire/enroll/${token}`;

type InquiryInfo = {
  name: string;
  program: string;
  mode: string;
};

type FormState = {
  birthdate: string;
  address: string;
  guardianName: string;
  guardianContact: string;
  schedulePreference: string;
  attendingSchool: string;
  currentSchool: string;
  notes: string;
};

const EMPTY_FORM: FormState = {
  birthdate: "",
  address: "",
  guardianName: "",
  guardianContact: "",
  schedulePreference: "",
  attendingSchool: "",
  currentSchool: "",
  notes: "",
};

const REQUIRED_FIELDS: (keyof FormState)[] = [
  "birthdate",
  "address",
  "guardianName",
  "guardianContact",
];

type PageStatus =
  | "loading"
  | "invalid"
  | "already-completed"
  | "ready"
  | "submitting"
  | "submit-error"
  | "success";

export default function EnrollmentCompletionPage() {
  const params = useParams<{ token: string }>();
  const token = params.token;

  const [status, setStatus] = useState<PageStatus>("loading");
  const [info, setInfo] = useState<InquiryInfo | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [submitError, setSubmitError] = useState<string>("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(infoUrl(token), { cache: "no-store" });
        const payload = await res.json();

        if (cancelled) return;

        if (res.status === 409) {
          setStatus("already-completed");
          return;
        }
        if (!res.ok) {
          setStatus("invalid");
          return;
        }

        setInfo(payload.data);
        setStatus("ready");
      } catch {
        if (!cancelled) setStatus("invalid");
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const activeRequiredFields = useMemo<(keyof FormState)[]>(
    () =>
      form.attendingSchool === "yes"
        ? [...REQUIRED_FIELDS, "currentSchool"]
        : REQUIRED_FIELDS,
    [form.attendingSchool],
  );
  const filledRequired = useMemo(
    () => activeRequiredFields.filter((f) => form[f].trim().length > 0).length,
    [form, activeRequiredFields],
  );
  const progress = filledRequired / activeRequiredFields.length;
  const canSubmit = filledRequired === activeRequiredFields.length;

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setStatus("submitting");
    setSubmitError("");

    try {
      const res = await fetch(completeUrl(token), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const payload = await res.json();

      if (!res.ok) {
        setSubmitError(
          payload?.message || "Something went wrong. Please try again.",
        );
        setStatus("ready");
        return;
      }

      setStatus("success");
    } catch {
      setSubmitError("We couldn't reach the server. Please try again.");
      setStatus("ready");
    }
  }

  const referenceCode = token ? token.slice(0, 8).toUpperCase() : "";

  return (
    <div className="relative min-h-screen bg-navy-950 font-body text-cream flex justify-center px-5 py-14 sm:py-20 overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(1200px_500px_at_50%_-10%,rgba(201,162,39,0.14),transparent_60%)]"
      />

      <main className="relative z-10 w-full max-w-xl flex flex-col gap-5">
        {status === "loading" && <LoadingState />}

        {status === "invalid" && (
          <StatusCard
            tone="error"
            title="This link isn't valid"
            message="It may have expired, or already been used. Reach out to the admissions team and they'll send a fresh one."
          />
        )}

        {status === "already-completed" && (
          <StatusCard
            tone="info"
            title="Already completed"
            message="This enrollment has already been submitted — there's nothing more to do here."
          />
        )}

        {status === "success" && (
          <StatusCard
            tone="success"
            title="Welcome aboard"
            message="Thanks — your enrollment is complete. The team will follow up with next steps and schedule details."
          />
        )}

        {(status === "ready" || status === "submitting") && info && (
          <>
            <EnrollmentPass info={info} referenceCode={referenceCode} />

            <section
              aria-labelledby="form-heading"
              className="rounded-2xl border border-navy-line bg-navy-900 p-8 shadow-panel"
            >
              <div>
                <h1
                  id="form-heading"
                  className="font-display text-2xl font-semibold tracking-tight text-cream"
                >
                  Complete your enrollment
                </h1>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                  A few details from a parent or guardian and you're set. This
                  takes about two minutes.
                </p>
              </div>

              <div
                role="presentation"
                className="mt-6 h-1 overflow-hidden rounded-full bg-navy-800"
              >
                <div
                  className="h-full rounded-full bg-linear-to-r from-gold-600 to-gold-400 transition-all duration-300 ease-out"
                  style={{ width: `${Math.round(progress * 100)}%` }}
                />
              </div>
              <p className="mt-2 font-mono text-[11px] uppercase tracking-wider text-ink-faint">
                {filledRequired} of {activeRequiredFields.length} required
                fields
              </p>

              <form onSubmit={handleSubmit} noValidate className="mt-6">
                <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
                  <Field label="Child's birthdate" required>
                    <input
                      type="date"
                      value={form.birthdate}
                      onChange={(e) => updateField("birthdate", e.target.value)}
                      required
                      className="input-base"
                    />
                  </Field>

                  <Field label="Guardian name" required>
                    <input
                      type="text"
                      placeholder="Full name"
                      value={form.guardianName}
                      onChange={(e) =>
                        updateField("guardianName", e.target.value)
                      }
                      required
                      className="input-base"
                    />
                  </Field>

                  <Field label="Guardian contact" required>
                    <input
                      type="text"
                      placeholder="Phone or email"
                      value={form.guardianContact}
                      onChange={(e) =>
                        updateField("guardianContact", e.target.value)
                      }
                      required
                      className="input-base"
                    />
                  </Field>

                  <Field label="Schedule preference">
                    <select
                      value={form.schedulePreference}
                      onChange={(e) =>
                        updateField("schedulePreference", e.target.value)
                      }
                      className="input-base select-gold"
                    >
                      <option value="">No preference</option>
                      <option value="morning">Morning</option>
                      <option value="afternoon">Afternoon</option>
                      <option value="evening">Evening</option>
                      <option value="weekend">Weekend</option>
                    </select>
                  </Field>

                  <Field label="Currently attending school?">
                    <select
                      value={form.attendingSchool}
                      onChange={(e) => {
                        const value = e.target.value;
                        setForm((prev) => ({
                          ...prev,
                          attendingSchool: value,
                          currentSchool:
                            value === "yes" ? prev.currentSchool : "",
                        }));
                      }}
                      className="input-base select-gold"
                    >
                      <option value="">Prefer not to say</option>
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                  </Field>
                </div>

                {form.attendingSchool === "yes" && (
                  <Field label="Current school name" required wide>
                    <input
                      type="text"
                      placeholder="Name of the school currently attended"
                      value={form.currentSchool}
                      onChange={(e) =>
                        updateField("currentSchool", e.target.value)
                      }
                      required
                      className="input-base"
                    />
                  </Field>
                )}

                <Field label="Home address" required wide>
                  <textarea
                    rows={2}
                    placeholder="Street, city, postal code"
                    value={form.address}
                    onChange={(e) => updateField("address", e.target.value)}
                    required
                    className="input-base resize-y"
                  />
                </Field>

                <Field label="Anything we should know?" wide>
                  <textarea
                    rows={3}
                    placeholder="Allergies, accommodations, questions — optional"
                    value={form.notes}
                    onChange={(e) => updateField("notes", e.target.value)}
                    className="input-base resize-y"
                  />
                </Field>

                {submitError && (
                  <p className="mb-4 mt-1 text-[13.5px] text-red-400">
                    {submitError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={!canSubmit || status === "submitting"}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-gold-600 to-gold-500 px-5 py-3.5 font-body text-[15px] font-semibold text-navy-950 shadow-gold transition-all duration-150 hover:shadow-gold-lg active:scale-[0.99] disabled:bg-navy-800 disabled:bg-none disabled:text-ink-faint disabled:shadow-none"
                >
                  {status === "submitting" ? (
                    <>
                      <Spinner /> Submitting
                    </>
                  ) : (
                    "Submit enrollment"
                  )}
                </button>
              </form>
            </section>
          </>
        )}
      </main>

      {/* Shared input styling. Kept as a tiny global block so every field
          in the form — input, select, textarea — reads from one definition. */}
      <style jsx global>{`
        .input-base {
          width: 100%;
          font-family: var(--font-body), sans-serif;
          font-size: 14.5px;
          color: var(--color-cream);
          background: rgba(6, 14, 36, 0.55);
          border: 1px solid var(--color-navy-line);
          border-radius: 8px;
          padding: 10px 12px;
          transition:
            border-color 0.15s ease,
            box-shadow 0.15s ease;
        }
        .input-base::placeholder {
          color: var(--color-ink-faint);
        }
        .input-base:focus {
          outline: none;
          border-color: var(--color-gold-600);
          box-shadow: 0 0 0 3px rgba(201, 162, 39, 0.18);
        }
      `}</style>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Signature element: the enrollment pass, reskinned as a gold-foil admission
// ticket for a formal occasion — a scalloped stub carrying the reference
// code, a script flourish standing in for a signature line.
// ---------------------------------------------------------------------------
function EnrollmentPass({
  info,
  referenceCode,
}: {
  info: InquiryInfo;
  referenceCode: string;
}) {
  return (
    <section
      aria-label="Enrollment summary"
      className="relative grid grid-cols-[1fr_auto] overflow-hidden rounded-2xl border border-gold-600/30 bg-linear-to-br from-navy-800 to-navy-950 shadow-card sm:grid-cols-[1fr_128px]"
    >
      {/* scalloped perforation, cut from the page background */}
      <div className="pointer-events-none absolute right-28 top-1/2 hidden h-5 w-5 -translate-y-1/2 rounded-full bg-navy-950 sm:block" />
      <div className="pointer-events-none absolute -bottom-2.5 right-28 hidden h-5 w-5 rounded-full bg-navy-950 sm:block" />

      <div className="p-7 pb-6">
        <p className="font-script text-xl text-gold-400/90">Enrollment pass</p>
        <h2 className="mt-2 font-display text-2xl font-medium italic text-cream">
          {info.name}
        </h2>
        <div className="mt-4 flex gap-7">
          <div>
            <span className="block text-[10.5px] uppercase tracking-wide text-ink-faint">
              Program
            </span>
            <span className="block text-sm font-medium text-cream">
              {info.program}
            </span>
          </div>
          <div>
            <span className="block text-[10.5px] uppercase tracking-wide text-ink-faint">
              Mode
            </span>
            <span className="block text-sm font-medium text-cream">
              {info.mode}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-row items-center justify-center gap-2 border-t border-dashed border-gold-500/35 px-0 py-3 sm:flex-col sm:border-l sm:border-t-0 sm:py-0">
        <span className="text-[10px] uppercase tracking-wide text-ink-faint">
          Ref
        </span>
        <span className="font-mono text-[15px] font-medium tracking-wide text-gold-500">
          {referenceCode}
        </span>
      </div>
    </section>
  );
}

function Field({
  label,
  required,
  wide,
  children,
}: {
  label: string;
  required?: boolean;
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label
      className={`mb-4 flex flex-col gap-1.5 ${wide ? "col-span-full" : ""}`}
    >
      <span className="text-[13px] font-medium text-cream">
        {label}
        {required && <span className="text-gold-500"> *</span>}
      </span>
      {children}
    </label>
  );
}

function LoadingState() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center gap-3.5 py-20 text-sm text-ink-soft"
    >
      <Spinner large />
      <p>Checking your link…</p>
    </div>
  );
}

function Spinner({ large }: { large?: boolean }) {
  const size = large ? 28 : 15;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="animate-spin"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeOpacity="0.2"
        strokeWidth="3"
      />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function StatusCard({
  tone,
  title,
  message,
}: {
  tone: "error" | "info" | "success";
  title: string;
  message: string;
}) {
  const iconWrap =
    tone === "success"
      ? "bg-gold-600/15 text-gold-500"
      : tone === "error"
        ? "bg-red-500/10 text-red-400"
        : "bg-ink-faint/15 text-ink-soft";

  return (
    <section className="rounded-2xl border border-navy-line bg-navy-900 px-8 py-10 text-center shadow-panel">
      <div
        className={`mx-auto mb-4.5 flex h-12 w-12 items-center justify-center rounded-full ${iconWrap}`}
      >
        {tone === "success" ? (
          <CheckIcon />
        ) : tone === "error" ? (
          <AlertIcon />
        ) : (
          <InfoIcon />
        )}
      </div>
      <h1 className="font-display text-2xl font-semibold text-cream">
        {title}
      </h1>
      <p className="mx-auto mt-2.5 max-w-sm text-[14.5px] leading-relaxed text-ink-soft">
        {message}
      </p>
    </section>
  );
}

function CheckIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M5 13l4 4L19 7"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 9v4m0 4h.01M10.3 3.9L2.7 17a1.5 1.5 0 001.3 2.2h16a1.5 1.5 0 001.3-2.2L13.7 3.9a1.5 1.5 0 00-2.6 0z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path
        d="M12 11v5m0-8h.01"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
