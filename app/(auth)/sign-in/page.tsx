"use client";

import StarField from "@/components/shared/StarField";
import { signIn } from "@/libs/api/auth";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";

const TESTIMONIALS = [
  {
    quote:
      "Our son's grades turned around within a term. The tutors actually listen.",
    name: "Liza M.",
    role: "Parent, Grade 8 learner",
  },
  {
    quote:
      "Booking sessions and tracking progress finally feels like one system, not three apps.",
    name: "Ramon T.",
    role: "Parent, twins in Grade 5",
  },
  {
    quote:
      "I can see exactly what my daughter covered each week. That visibility is the whole point.",
    name: "Ces A.",
    role: "Parent, Grade 11 learner",
  },
];

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
  icon: React.ReactNode;
  endAdornment?: React.ReactNode;
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
  icon,
  endAdornment,
}: FloatingFieldProps) {
  return (
    <div className="relative mb-5">
      <span className="pointer-events-none absolute right-3.75 top-1/2 -translate-y-1/2 text-ink-faint peer-focus:text-gold-400">
        {icon}
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
  );
}

function MailIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4.5 w-4.5 stroke-current"
    >
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="m4 7 8 6 8-6" />
    </svg>
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

const ROLE_REDIRECTS: Record<string, string> = {
  admin: "/dashboard",
  tutor: "/teacher",
  student: "/portal",
};

function resolveRedirect(role: string | undefined | null): string {
  if (!role) return "/portal";
  const key = role.trim().toLocaleLowerCase();
  return ROLE_REDIRECTS[key] ?? "/portal";
}

export default function SignIn() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [shake, setShake] = useState(false);

  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setTestimonialIndex((i) => (i + 1) % TESTIMONIALS.length);
    }, 4800);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Enter your email and password to continue.");
      setShake(true);
      setTimeout(() => setShake(false), 420);
      return;
    }

    setSubmitting(true);

    const result = await signIn({ email, password });

    setSubmitting(false);

    if (!result.ok) {
      setError(result.error);
      setShake(true);
      setTimeout(() => setShake(false), 420);
      return;
    }

    

    if (result.otpRequired) {
      sessionStorage.setItem("otpToken", result.otpToken);
      sessionStorage.setItem("otpEmail", email);
      router.push("/verify-otp");
      return;
    }

    console.log("Role received from API: ", JSON.stringify(result.user.role));

    setSuccess(true);

    setTimeout(() => {
      router.push(resolveRedirect(result.user.role));
    }, 1400);
  };

  const t = TESTIMONIALS[testimonialIndex];

  return (
    <section className="min-h-screen bg-navy-900 py-10">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-260 grid-cols-1 items-stretch gap-0 overflow-hidden rounded-[20px] border border-gold-600/25 shadow-panel lg:grid-cols-[1.05fr_1fr]">
        {/* Brand / signature panel */}
        <div
          className="relative hidden flex-col justify-between overflow-hidden p-11 lg:flex"
          style={{ background: "linear-gradient(160deg, #122448, #060e24)" }}
        >
          <StarField />
          {/* ambient gold particles */}
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
              Every session, tracked. Every learner, known.
            </h1>
            <p className="max-w-85 leading-relaxed text-ink-soft">
              Sign in to view schedules, message tutors, and follow your
              learner&apos;s progress in one place.
            </p>
          </div>

          {/* signature element: orbiting seal */}
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
                  <path d="M12 3 2 8l10 5 10-5-10-5Z" />
                  <path d="M6 10.5V16c0 1.4 2.7 3 6 3s6-1.6 6-3v-5.5" />
                  <path d="M22 8v6" />
                </svg>
              </div>
            </div>

            <div
              key={testimonialIndex}
              className="max-w-64"
              style={{ animation: "fadeInUp 0.5s ease-out" }}
            >
              <p className="mb-1.5 text-[0.85rem] italic leading-relaxed text-ink-soft">
                &ldquo;{t.quote}&rdquo;
              </p>
              <p className="text-[0.76rem] font-semibold text-gold-400">
                {t.name}
                <span className="ml-1.5 font-normal text-ink-faint">
                  &middot; {t.role}
                </span>
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
                Welcome back
              </h2>
              <p className="mb-7.5 text-[0.92rem] leading-relaxed text-ink-soft">
                Sign in to manage sessions and track progress.
              </p>

              <form
                onSubmit={handleSubmit}
                className={shake ? "animate-[shake_0.4s_ease-in-out]" : ""}
              >
                <FloatingField
                  id="email"
                  name="email"
                  label="Email address"
                  type="email"
                  value={email}
                  onChange={setEmail}
                  autoComplete="email"
                  required
                  icon={<MailIcon />}
                />

                <FloatingField
                  id="password"
                  name="password"
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={setPassword}
                  autoComplete="current-password"
                  required
                  icon={<LockIcon />}
                  endAdornment={
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      className="absolute right-3.75 top-1/2 -translate-y-1/2 text-ink-faint transition-colors hover:text-gold-400"
                    >
                      <EyeIcon open={showPassword} />
                    </button>
                  }
                />

                <div className="mb-6 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setRemember((v) => !v)}
                    aria-pressed={remember}
                    className="flex items-center gap-3 text-[0.84rem] text-ink-soft"
                  >
                    <span
                      className={`relative shrink-0 rounded-full border transition-colors duration-200 ${
                        remember
                          ? "border-gold-500 bg-gold-600/50"
                          : "border-gold-600/25 bg-white/5"
                      }`}
                      style={{ width: 36, height: 20 }}
                    >
                      <span
                        className="absolute rounded-full bg-gold-400 transition-transform duration-200"
                        style={{
                          width: 14,
                          height: 14,
                          top: 2,
                          left: 2,
                          transform: remember
                            ? "translateX(16px)"
                            : "translateX(0)",
                        }}
                      />
                    </span>
                    Remember me
                  </button>
                  <a
                    href="#forgot-password"
                    className="text-[0.84rem] font-semibold text-gold-400 transition-colors hover:text-gold-300"
                  >
                    Forgot password?
                  </a>
                </div>

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
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
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
              <h3 className="mb-2.5 text-[1.4rem] text-cream">Signed in</h3>
              <p className="mb-6 text-[0.92rem] leading-relaxed text-ink-soft">
                Welcome back. Taking you to your dashboard.
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
