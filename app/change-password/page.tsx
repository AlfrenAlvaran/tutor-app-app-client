"use client";

import StarField from "@/components/shared/StarField";
import { changePassword } from "@/libs/api/auth";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";

const inputBaseClass =
  "peer w-full rounded-2.5 border border-gold-600/25 bg-white/3 px-3.75 pt-6 pb-2.5 font-body text-[0.94rem] text-cream outline-none transition-all duration-200 placeholder-transparent focus:border-gold-500 focus:bg-gold-600/5 focus:shadow-[0_0_0_3px_rgba(201,162,39,0.12)]";

const labelBaseClass =
  "pointer-events-none absolute left-3.75 top-4 font-body text-[0.94rem] text-ink-faint transition-all duration-200 peer-focus:top-2.25 peer-focus:text-[0.72rem] peer-focus:text-gold-400 peer-[:not(:placeholder-shown)]:top-2.25 peer-[:not(:placeholder-shown)]:text-[0.72rem] peer-[:not(:placeholder-shown)]:text-gold-400";

interface FloatingFieldProps {
  id: string;
  name: string;
  label: string;
  type: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  autoComplete?: string;
  endAdornment?: React.ReactNode;
  hint?: string;
}

function FloatingField({
  id,
  name,
  label,
  type,
  value,
  onChange,
  required,
  autoComplete,
  endAdornment,
  hint,
}: FloatingFieldProps) {
  return (
    <div className="mb-5">
      <div className="relative">
        <span className="pointer-events-none absolute right-3.75 top-1/2 -translate-y-1/2 text-ink-faint peer-focus:text-gold-400">
          <LockIcon />
        </span>
        <input
          id={id}
          name={name}
          type={type}
          required={required}
          autoComplete={autoComplete}
          placeholder={label}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${inputBaseClass} pr-11`}
        />
        <label htmlFor={id} className={labelBaseClass}>
          {label}
        </label>
        {endAdornment}
      </div>
      {hint && (
        <p className="mt-1.5 pl-1 text-[0.76rem] leading-snug text-ink-faint">
          {hint}
        </p>
      )}
    </div>
  );
}

function LockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4.5 w-4.5 stroke-current"
    >
      <rect x="4.5" y="10.5" width="15" height="9.5" rx="2.2" />
      <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4.5 w-4.5 stroke-current"
    >
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4.5 w-4.5 stroke-current"
    >
      <path d="M3 3l18 18" />
      <path d="M10.6 5.7c.45-.1.92-.15 1.4-.15 6 0 9.5 6.5 9.5 6.5a15.6 15.6 0 0 1-3.6 4.35M6.5 6.9C3.8 8.65 2.5 12 2.5 12s3.5 6.5 9.5 6.5c1.3 0 2.5-.3 3.6-.8" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    </svg>
  );
}

// Password strength: plain, deterministic checks — no scoring theater.
function getPasswordChecks(pw: string) {
  return [
    { label: "At least 8 characters", met: pw.length >= 8 },
    { label: "One number", met: /\d/.test(pw) },
    { label: "One uppercase letter", met: /[A-Z]/.test(pw) },
  ];
}

const ROLE_REDIRECTS: Record<string, string> = {
  admin: "/dashboard",
  tutor: "/portal-module",
  student: "/portal",
};

export default function ChangePassword() {
  const router = useRouter();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [shake, setShake] = useState(false);

  const checks = useMemo(() => getPasswordChecks(newPassword), [newPassword]);
  const allChecksMet = checks.every((c) => c.met);
  const passwordsMatch =
    confirmPassword.length > 0 && newPassword === confirmPassword;

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 420);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Fill in all three fields to continue.");
      triggerShake();
      return;
    }

    if (!allChecksMet) {
      setError("Your new password doesn't meet the requirements below.");
      triggerShake();
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New password and confirmation don't match.");
      triggerShake();
      return;
    }

    if (currentPassword === newPassword) {
      setError("New password must be different from your current one.");
      triggerShake();
      return;
    }

    setSubmitting(true);

    const result = await changePassword({ currentPassword, newPassword });

    setSubmitting(false);

    if (!result.ok) {
      setError(result.error);
      triggerShake();
      return;
    }

    setSuccess(true);

    setTimeout(() => {
      router.push(ROLE_REDIRECTS[result.user?.role ?? ""] ?? "/portal");
    }, 1400);
  };

  return (
    <section className="min-h-screen bg-navy-900 py-10">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-260 grid-cols-1 items-stretch gap-0 overflow-hidden rounded-[20px] border border-gold-600/25 shadow-panel lg:grid-cols-[1.05fr_1fr]">
        {/* Brand / context panel */}
        <div
          className="relative hidden flex-col justify-between overflow-hidden p-11 lg:flex"
          style={{ background: "linear-gradient(160deg, #122448, #060e24)" }}
        >
          <StarField />
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {[...Array(10)].map((_, i) => (
              <span
                key={i}
                className="absolute block rounded-full bg-gold-400/40"
                style={{
                  width: 3 + (i % 3),
                  height: 3 + (i % 3),
                  left: `${(i * 37) % 100}%`,
                  top: `${(i * 53) % 100}%`,
                  animation: `drift ${9 + (i % 5)}s ease-in-out ${i * 0.6}s infinite`,
                }}
              />
            ))}
          </div>

          <div className="relative z-1">
            <span className="mb-9 inline-flex items-center gap-2.5 font-display text-[1.15rem] font-bold tracking-[0.02em] text-cream">
              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-gold-500 text-[0.8rem] text-gold-400">
                E
              </span>
              ExcelEd
            </span>

            <h1 className="mb-4.5 max-w-90 font-display text-[clamp(1.9rem,3vw,2.5rem)] leading-[1.15] text-cream">
              Set a password only you know.
            </h1>
            <p className="max-w-85 leading-relaxed text-ink-soft">
              You&apos;re signed in with a temporary or admin-issued
              password. Choose your own to finish securing the account.
            </p>
          </div>

          {/* signature element: shield seal, mirrors sign-in's orbiting seal */}
          <div className="relative z-1 flex items-center gap-6">
            <div className="relative h-24 w-24 shrink-0">
              <div
                className="absolute inset-0 rounded-full border border-gold-600/30"
                style={{ animation: "spin-slow 14s linear infinite" }}
              >
                <span className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-gold-400" />
                <span className="absolute top-1/2 -right-1 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-gold-500/70" />
                <span className="absolute -bottom-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-gold-500/50" />
              </div>
              <div
                className="absolute inset-3 rounded-full border border-gold-600/40"
                style={{ animation: "spin-slow 20s linear infinite reverse" }}
              />
              <div className="absolute inset-6 flex items-center justify-center rounded-full bg-linear-to-br from-gold-400/20 to-gold-600/10 text-gold-400">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-7 w-7 stroke-current"
                >
                  <path d="M12 3c3.5 1 6 1.4 8 1.4 0 8.6-3.6 13-8 15.6-4.4-2.6-8-7-8-15.6 2 0 4.5-.4 8-1.4Z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </div>
            </div>

            <div className="max-w-64">
              <p className="mb-1.5 text-[0.85rem] leading-relaxed text-ink-soft">
                Passwords are never visible to admins or stored in plain
                text once you save this change.
              </p>
              <p className="text-[0.76rem] font-semibold text-gold-400">
                Account security
              </p>
            </div>
          </div>
        </div>

        {/* Form panel */}
        <div
          className="flex flex-col justify-center p-8 sm:p-12"
          style={{ background: "linear-gradient(160deg, #0e1c3a, #060e24)" }}
        >
          {!success ? (
            <div className="mx-auto w-full max-w-88">
              <span className="mb-3.5 inline-flex items-center gap-2 font-display text-[1.05rem] font-bold text-cream lg:hidden">
                <span className="flex h-7.5 w-7.5 items-center justify-center rounded-full border border-gold-500 text-[0.75rem] text-gold-400">
                  E
                </span>
                ExcelEd
              </span>
              <h2 className="mb-2 font-display text-[1.7rem] leading-[1.2] text-cream">
                Update your password
              </h2>
              <p className="mb-7.5 text-[0.92rem] leading-relaxed text-ink-soft">
                Confirm your current password, then choose a new one.
              </p>

              <form
                onSubmit={handleSubmit}
                className={shake ? "animate-[shake_0.4s_ease-in-out]" : ""}
              >
                <FloatingField
                  id="currentPassword"
                  name="currentPassword"
                  label="Current password"
                  type={showCurrent ? "text" : "password"}
                  value={currentPassword}
                  onChange={setCurrentPassword}
                  autoComplete="current-password"
                  required
                  endAdornment={
                    <button
                      type="button"
                      onClick={() => setShowCurrent((v) => !v)}
                      aria-label={
                        showCurrent ? "Hide password" : "Show password"
                      }
                      className="absolute right-3.75 top-1/2 -translate-y-1/2 text-ink-faint transition-colors hover:text-gold-400"
                    >
                      <EyeIcon open={showCurrent} />
                    </button>
                  }
                />

                <FloatingField
                  id="newPassword"
                  name="newPassword"
                  label="New password"
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={setNewPassword}
                  autoComplete="new-password"
                  required
                  endAdornment={
                    <button
                      type="button"
                      onClick={() => setShowNew((v) => !v)}
                      aria-label={showNew ? "Hide password" : "Show password"}
                      className="absolute right-3.75 top-1/2 -translate-y-1/2 text-ink-faint transition-colors hover:text-gold-400"
                    >
                      <EyeIcon open={showNew} />
                    </button>
                  }
                />

                {/* Requirement checklist — only shows once the person starts typing */}
                {newPassword.length > 0 && (
                  <ul className="-mt-3 mb-5 flex flex-col gap-1.5 pl-1">
                    {checks.map((c) => (
                      <li
                        key={c.label}
                        className={`flex items-center gap-2 text-[0.78rem] transition-colors duration-200 ${
                          c.met ? "text-success" : "text-ink-faint"
                        }`}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-3.5 w-3.5 shrink-0 stroke-current"
                        >
                          {c.met ? (
                            <path d="m5 12.5 4.5 4.5L19 7" />
                          ) : (
                            <circle cx="12" cy="12" r="8" />
                          )}
                        </svg>
                        {c.label}
                      </li>
                    ))}
                  </ul>
                )}

                <FloatingField
                  id="confirmPassword"
                  name="confirmPassword"
                  label="Confirm new password"
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  autoComplete="new-password"
                  required
                  endAdornment={
                    <button
                      type="button"
                      onClick={() => setShowConfirm((v) => !v)}
                      aria-label={
                        showConfirm ? "Hide password" : "Show password"
                      }
                      className="absolute right-3.75 top-1/2 -translate-y-1/2 text-ink-faint transition-colors hover:text-gold-400"
                    >
                      <EyeIcon open={showConfirm} />
                    </button>
                  }
                  hint={
                    confirmPassword.length > 0 && !passwordsMatch
                      ? "Doesn't match the new password yet."
                      : undefined
                  }
                />

                {error && (
                  <p className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2.5 text-[0.85rem] text-red-300">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="group relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-xl bg-linear-to-br from-gold-400 via-gold-600 to-gold-deep py-3.75 text-[0.98rem] font-semibold text-[#1a1204] shadow-gold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-gold-lg disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
                >
                  <span className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12 bg-white/25 opacity-0 transition-all duration-500 group-hover:left-full group-hover:opacity-100" />
                  {submitting ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#1a1204]/30 border-t-[#1a1204]" />
                      Updating password...
                    </>
                  ) : (
                    "Update password"
                  )}
                </button>
              </form>
            </div>
          ) : (
            <div className="mx-auto w-full max-w-88 animate-[fadeInUp_0.4s_ease-out] px-2 py-12 text-center">
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
                Password updated
              </h3>
              <p className="mb-6 text-[0.92rem] leading-relaxed text-ink-soft">
                Use your new password next time you sign in. Taking you to
                your dashboard.
              </p>
              <div className="mx-auto h-1 w-full max-w-56 overflow-hidden rounded-full bg-white/8">
                <div
                  className="h-full rounded-full bg-linear-to-r from-gold-400 to-gold-600"
                  style={{ animation: "loadBar 1.8s ease-out forwards" }}
                />
              </div>
            </div>
          )}
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
        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          20% {
            transform: translateX(-6px);
          }
          40% {
            transform: translateX(5px);
          }
          60% {
            transform: translateX(-4px);
          }
          80% {
            transform: translateX(3px);
          }
        }
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes drift {
          0%,
          100% {
            transform: translate(0, 0);
            opacity: 0.5;
          }
          50% {
            transform: translate(6px, -10px);
            opacity: 1;
          }
        }
        @keyframes loadBar {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }
      `}</style>
    </section>
  );
}