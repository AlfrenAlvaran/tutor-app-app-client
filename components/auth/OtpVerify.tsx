"use client";

import {
  ClipboardEvent,
  FormEvent,
  KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { resendOTP, verifyOTP } from "@/libs/api/auth";
import { resolveRedirect } from "@/utils/roleRedirect";



const CODE_LENGTH = 6;
const RESEND_SECONDS = 45;



function maskEmail(email: string) {
  const [user, domain] = email.split("@");
  if (!user || !domain) return email;
  const visible = user.slice(0, 2);
  return `${visible}${"*".repeat(Math.max(user.length - 2, 2))}@${domain}`;
}

interface OtpVerifyProps {
  onBack?: () => void;
}

export default function OtpVerify({ onBack }: OtpVerifyProps) {
  const router = useRouter();

  const [otpToken, setOtpToken] = useState<string | null>(null);
  const [email, setEmail] = useState<string>("");

  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [shake, setShake] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const [resending, setResending] = useState(false);
  const [justResent, setJustResent] = useState(false);

  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    const storedToken = sessionStorage.getItem("otpToken");
    const storedEmail = sessionStorage.getItem("otpEmail");

    if (!storedToken) {
      router.replace("/sign-in");
      return;
    }

    setOtpToken(storedToken);
    setEmail(storedEmail ?? "");
    inputsRef.current[0]?.focus();
  }, [router]);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setInterval(() => {
      setSecondsLeft((s) => Math.max(s - 1, 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [secondsLeft]);

  const code = digits.join("");

  const triggerShake = (message: string) => {
    setError(message);
    setShake(true);
    setTimeout(() => setShake(false), 420);
  };

  const setDigitAt = (index: number, value: string) => {
    setDigits((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const handleChange = (index: number, raw: string) => {
    const value = raw.replace(/\D/g, "");
    if (!value) {
      setDigitAt(index, "");
      return;
    }
    // Support fast typing where the browser hands over more than one char.
    const chars = value.split("");
    chars.forEach((char, offset) => {
      const target = index + offset;
      if (target < CODE_LENGTH) setDigitAt(target, char);
    });
    const nextIndex = Math.min(index + chars.length, CODE_LENGTH - 1);
    inputsRef.current[nextIndex]?.focus();
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (digits[index]) {
        setDigitAt(index, "");
      } else if (index > 0) {
        inputsRef.current[index - 1]?.focus();
        setDigitAt(index - 1, "");
      }
      e.preventDefault();
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputsRef.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < CODE_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "");
    if (!text) return;
    e.preventDefault();
    const next = Array(CODE_LENGTH).fill("");
    text
      .slice(0, CODE_LENGTH)
      .split("")
      .forEach((char, i) => {
        next[i] = char;
      });
    setDigits(next);
    const focusIndex = Math.min(text.length, CODE_LENGTH - 1);
    inputsRef.current[focusIndex]?.focus();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!otpToken) return;

    if (code.length < CODE_LENGTH) {
      triggerShake("Enter the full 6-digit code.");
      return;
    }

    setSubmitting(true);
    const result = await verifyOTP({ otpToken, code });
    setSubmitting(false);

    if (!result.ok) {
      triggerShake(result.error || "Something went wrong. Try again.");
      setDigits(Array(CODE_LENGTH).fill(""));
      inputsRef.current[0]?.focus();
      return;
    }

    setSuccess(true);
    sessionStorage.removeItem("otpToken");
    sessionStorage.removeItem("otpEmail");

    // Let the success animation play before navigating away.

    console.log("Received Role from API: ", JSON.stringify(result.user.role))

    setTimeout(() => {
      router.push(resolveRedirect(result.user.role));
    }, 1600);
  };

  const handleResend = async () => {
    if (secondsLeft > 0 || resending || !otpToken) return;
    setResending(true);
    setError(null);

    const result = await resendOTP(otpToken);

    setResending(false);

    if (!result.ok) {
      triggerShake(result.error);
      return;
    }

    sessionStorage.setItem("otpToken", result.otpToken);
    setOtpToken(result.otpToken);
    setSecondsLeft(RESEND_SECONDS);
    setDigits(Array(CODE_LENGTH).fill(""));
    inputsRef.current[0]?.focus();
    setJustResent(true);
    setTimeout(() => setJustResent(false), 3000);
  };

  const handleBack = () => {
    sessionStorage.removeItem("otpToken");
    sessionStorage.removeItem("otpEmail");
    if (onBack) {
      onBack();
    } else {
      router.push("/sign-in");
    }
  };

  const mm = String(Math.floor(secondsLeft / 60)).padStart(1, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");

  // Brief flash before the redirect effect kicks in for a missing token.
  if (!otpToken) return null;

  return (
    <section className="flex min-h-screen items-center justify-center bg-navy-900 px-6 py-14">
      <div
        className="w-full max-w-105 overflow-hidden rounded-[20px] border border-gold-600/25 p-8 shadow-panel sm:p-10"
        style={{ background: "linear-gradient(160deg, #122448, #060e24)" }}
      >
        {!success ? (
          <>
            <button
              type="button"
              onClick={handleBack}
              className="mb-6 flex items-center gap-1.5 text-[0.82rem] text-ink-faint transition-colors hover:text-gold-400"
            >
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 stroke-current">
                <path d="M15 6l-6 6 6 6" />
              </svg>
              Back
            </button>

            <div className="relative mx-auto mb-6 h-16 w-16">
              <div
                className="absolute inset-0 rounded-full border border-gold-600/30"
                style={{ animation: "spin-slow 10s linear infinite" }}
              >
                <span className="absolute -top-0.5 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-gold-400" />
              </div>
              <div className="absolute inset-2.5 flex items-center justify-center rounded-full bg-linear-to-br from-gold-400/20 to-gold-600/10 text-gold-400">
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 stroke-current">
                  <rect x="4.5" y="10.5" width="15" height="9.5" rx="2.2" />
                  <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
                </svg>
              </div>
            </div>

            <h1 className="mb-2 text-center font-display text-[1.55rem] leading-[1.2] text-cream">
              Verify your identity
            </h1>
            <p className="mb-8 text-center text-[0.9rem] leading-relaxed text-ink-soft">
              Enter the 6-digit code we sent to
              <br />
              <span className="font-semibold text-cream">
                {email ? maskEmail(email) : "your email"}
              </span>
            </p>

            <form onSubmit={handleSubmit}>
              <div
                className={`mb-6 flex justify-center gap-2.5 sm:gap-3 ${
                  shake ? "animate-[shake_0.4s_ease-in-out]" : ""
                }`}
              >
                {digits.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => {
                      inputsRef.current[i] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    autoComplete={i === 0 ? "one-time-code" : "off"}
                    maxLength={CODE_LENGTH}
                    value={digit}
                    onChange={(e) => handleChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    onPaste={handlePaste}
                    aria-label={`Digit ${i + 1} of ${CODE_LENGTH}`}
                    className={`h-12.5 w-9.5 rounded-2.5 border bg-white/3 text-center font-display text-[1.25rem] text-cream outline-none transition-all duration-200 focus:border-gold-500 focus:bg-gold-600/5 focus:shadow-[0_0_0_3px_rgba(201,162,39,0.12)] sm:h-13.5 sm:w-11 ${
                      error ? "border-red-500/50" : "border-gold-600/25"
                    }`}
                  />
                ))}
              </div>

              {error && (
                <p className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2.5 text-center text-[0.85rem] text-red-300">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting || code.length < CODE_LENGTH}
                className="group relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-xl bg-linear-to-br from-gold-400 via-gold-600 to-gold-deep py-3.75 text-[0.98rem] font-semibold text-[#1a1204] shadow-gold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-gold-lg disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
              >
                <span className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12 bg-white/25 opacity-0 transition-all duration-500 group-hover:left-full group-hover:opacity-100" />
                {submitting ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#1a1204]/30 border-t-[#1a1204]" />
                    Verifying...
                  </>
                ) : (
                  "Verify Code"
                )}
              </button>
            </form>

            <div className="mt-6 text-center text-[0.84rem] text-ink-faint">
              {secondsLeft > 0 ? (
                <span>
                  Resend code in{" "}
                  <span className="font-semibold text-ink-soft">
                    {mm}:{ss}
                  </span>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resending}
                  className="font-semibold text-gold-400 transition-colors hover:text-gold-300 disabled:opacity-60"
                >
                  {resending ? "Sending..." : "Resend code"}
                </button>
              )}
              {justResent && (
                <p className="mt-2 text-[0.78rem] text-gold-400" style={{ animation: "fadeInUp 0.3s ease-out" }}>
                  New code sent.
                </p>
              )}
            </div>
          </>
        ) : (
          <div className="animate-[fadeInUp_0.4s_ease-out] px-2 py-6 text-center">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4.5 h-13 w-13 stroke-success">
              <circle cx="12" cy="12" r="9" />
              <path
                d="m8 12.5 2.5 2.5L16 9.5"
                style={{ strokeDasharray: 20, strokeDashoffset: 0, animation: "drawCheck 0.5s ease-out 0.2s backwards" }}
              />
            </svg>
            <h3 className="mb-2.5 text-[1.4rem] text-cream">Verified</h3>
            <p className="mb-6 text-[0.92rem] leading-relaxed text-ink-soft">
              Your identity is confirmed. Taking you back in.
            </p>
            <div className="mx-auto h-1 w-full max-w-56 overflow-hidden rounded-full bg-white/8">
              <div
                className="h-full rounded-full bg-linear-to-r from-gold-400 to-gold-600"
                style={{ animation: "loadBar 1.6s ease-out forwards" }}
              />
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes drawCheck {
          from { stroke-dashoffset: 20; }
          to { stroke-dashoffset: 0; }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(5px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(3px); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes loadBar {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </section>
  );
}