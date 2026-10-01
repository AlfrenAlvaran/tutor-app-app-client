"use client";

import { useEffect, useState } from "react";

/**
 * Full-screen loading state for ExcelEd. Reuses the orbiting-seal signature
 * element and ambient gold particles from SignIn.tsx / OtpVerify.tsx so the
 * whole auth flow feels like one continuous piece.
 *
 * Self-contained: no external imports besides React.
 */

const DEFAULT_MESSAGES = [
  "Confirming your account...",
  "Loading your schedule...",
  "Syncing tutor messages...",
  "Almost there...",
];

interface LoadingScreenProps {
  messages?: string[];
  /** 0–100. Omit for an indeterminate loader (ring spins, no percentage). */
  progress?: number;
}

export default function LoadingScreen({
  messages = DEFAULT_MESSAGES,
  progress,
}: LoadingScreenProps) {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    if (messages.length <= 1) return;
    const timer = setInterval(() => {
      setMessageIndex((i) => (i + 1) % messages.length);
    }, 2000);
    return () => clearInterval(timer);
  }, [messages.length]);

  const indeterminate = typeof progress !== "number";
  const clamped = indeterminate ? 0 : Math.min(100, Math.max(0, progress));

  return (
    <section
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-navy-900 px-6"
      role="status"
      aria-live="polite"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {[...Array(14)].map((_, i) => (
          <span
            key={i}
            className="absolute block rounded-full bg-gold-400/30"
            style={{
              width: 3 + (i % 3),
              height: 3 + (i % 3),
              left: `${(i * 29) % 100}%`,
              top: `${(i * 47) % 100}%`,
              animation: `drift ${9 + (i % 5)}s ease-in-out ${i * 0.5}s infinite`,
            }}
          />
        ))}
      </div>

      <div className="relative z-1 flex flex-col items-center">
        <div className="relative mb-8 h-28 w-28">
          <div
            className="absolute inset-0 rounded-full border border-gold-600/25"
            style={{ animation: "spin-slow 3.2s linear infinite" }}
          >
            <span className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-gold-400" />
          </div>
          <div
            className="absolute inset-3.5 rounded-full border border-gold-600/40"
            style={{ animation: "spin-slow 2.1s linear infinite reverse" }}
          >
            <span className="absolute -bottom-0.5 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-gold-500/70" />
          </div>

          {!indeterminate && (
            <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90">
              <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(201,162,39,0.12)" strokeWidth="3" />
              <circle
                cx="50"
                cy="50"
                r="44"
                fill="none"
                stroke="#e8c468"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 44}
                strokeDashoffset={2 * Math.PI * 44 * (1 - clamped / 100)}
                style={{ transition: "stroke-dashoffset 0.4s ease-out" }}
              />
            </svg>
          )}

          <div className="absolute inset-7 flex items-center justify-center rounded-full bg-linear-to-br from-gold-400/20 to-gold-600/10 text-gold-400">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 stroke-current">
              <path d="M12 3 2 8l10 5 10-5-10-5Z" />
              <path d="M6 10.5V16c0 1.4 2.7 3 6 3s6-1.6 6-3v-5.5" />
              <path d="M22 8v6" />
            </svg>
          </div>
        </div>

        <span className="mb-2 inline-flex items-center gap-2 font-display text-[1rem] font-bold tracking-[0.02em] text-cream">
          <span className="flex h-6.5 w-6.5 items-center justify-center rounded-full border border-gold-500 text-[0.68rem] text-gold-400">
            E
          </span>
          ExcelEd
        </span>

        <p
          key={messageIndex}
          className="mb-1 text-center text-[0.94rem] text-ink-soft"
          style={{ animation: "fadeInUp 0.35s ease-out" }}
        >
          {messages[messageIndex]}
        </p>

        {!indeterminate && (
          <>
            <div className="mt-5 h-1 w-56 overflow-hidden rounded-full bg-white/8">
              <div
                className="h-full rounded-full bg-linear-to-r from-gold-400 to-gold-600"
                style={{ width: `${clamped}%`, transition: "width 0.4s ease-out" }}
              />
            </div>
            <span className="mt-2 text-[0.78rem] font-semibold text-gold-400">
              {Math.round(clamped)}%
            </span>
          </>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes drift {
          0%, 100% { transform: translate(0, 0); opacity: 0.4; }
          50% { transform: translate(6px, -10px); opacity: 0.9; }
        }
      `}</style>
    </section>
  );
}