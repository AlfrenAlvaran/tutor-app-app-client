"use client";

import { useEffect, useState } from "react";

/**
 * 403 / Unauthorized page. Standalone route (no AdminLayout wrapper) —
 * a person without access shouldn't see the admin sidebar or topbar,
 * so this owns its own full-bleed navy background.
 *
 * Drop in as app/unauthorized/page.tsx (or wherever your auth guard
 * redirects to). Swap `requiredRole` / `currentRole` for real values
 * from your session, and point the two actions at your router.
 */

interface UnauthorizedPageProps {
  requiredRole?: string;
  currentRole?: string;
  onGoBack?: () => void;
  onGoToDashboard?: () => void;
}

function IconKeyhole() {
  return (
    <svg viewBox="0 0 48 48" fill="none" className="h-8 w-8">
      <circle cx="24" cy="19" r="6.5" fill="currentColor" />
      <path d="M20.5 24h7l3.2 13.5a2 2 0 0 1-1.95 2.5H19.25a2 2 0 0 1-1.95-2.5L20.5 24Z" fill="currentColor" />
    </svg>
  );
}

function IconArrowLeft() {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 stroke-current">
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  );
}

function IconGrid() {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 stroke-current">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

function IconMail() {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 stroke-current">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3.5 6 8.5 7 8.5-7" />
    </svg>
  );
}

/** Small monospace-ish reference so support tickets have something to point to. */
function useReference() {
  const [ref, setRef] = useState("--------");
  const [time, setTime] = useState("");
  useEffect(() => {
    setRef(
      Array.from({ length: 8 }, () => "0123456789abcdef"[Math.floor(Math.random() * 16)]).join(""),
    );
    setTime(
      new Date().toLocaleString("en-PH", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }),
    );
  }, []);
  return { ref, time };
}

export default function UnauthorizedPage({
  requiredRole = "Administrator",
  currentRole = "Tutor",
  onGoBack,
  onGoToDashboard,
}: UnauthorizedPageProps) {
  const { ref, time } = useReference();

  const handleGoBack = () => {
    if (onGoBack) return onGoBack();
    if (typeof window !== "undefined") window.history.back();
  };

  const handleGoToDashboard = () => {
    if (onGoToDashboard) return onGoToDashboard();
    if (typeof window !== "undefined") window.location.href = "/";
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-navy-950 px-6 py-16">
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-[18%] h-[520px] w-[520px] -translate-x-1/2 rounded-full opacity-30 blur-[120px]"
        style={{ background: "radial-gradient(circle, #caa14d, transparent 70%)" }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(#e9c46a 1px, transparent 1px), linear-gradient(90deg, #e9c46a 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />

      <div
        className="relative w-full max-w-107 rounded-3xl border border-gold-600/15 px-8 py-9 text-center shadow-panel sm:px-10 sm:py-10"
        style={{ background: "linear-gradient(160deg, #0e1c3a, #060e24)", animation: "fadeInUp 0.4s ease-out" }}
      >
        {/* Signature: locked medallion, echoes the gold coin/button language used elsewhere */}
        <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center">
          <span
            className="absolute inset-0 rounded-full opacity-70"
            style={{ animation: "medallionPulse 2.8s ease-in-out infinite" }}
          />
          <span className="absolute inset-0 rounded-full border border-gold-500/25" style={{ animation: "medallionSpin 14s linear infinite" }}>
            {[0, 60, 120, 180, 240, 300].map((deg) => (
              <span
                key={deg}
                className="absolute h-1 w-1 rounded-full bg-gold-400/70"
                style={{
                  top: "50%",
                  left: "50%",
                  transform: `rotate(${deg}deg) translate(38px) rotate(-${deg}deg)`,
                }}
              />
            ))}
          </span>
          <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-linear-to-br from-gold-400 via-gold-600 to-gold-deep text-[#1a1204] shadow-gold">
            <IconKeyhole />
          </span>
        </div>

        <p className="mb-2 text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-gold-400">
          Error 403 &middot; Restricted
        </p>
        <h1 className="font-display text-[1.55rem] font-bold text-cream">This room is locked</h1>
        <p className="mx-auto mt-2.5 max-w-80 text-[0.9rem] leading-relaxed text-ink-soft">
          Your account doesn&rsquo;t have permission to view this page. Ask your workspace admin to
          grant access, or head back to somewhere you&rsquo;re cleared for.
        </p>

        <div className="mx-auto mt-6 flex max-w-72 items-center justify-center gap-3 rounded-xl border border-gold-600/15 bg-white/2 px-4 py-3">
          <div className="flex-1 text-left">
            <p className="text-[0.7rem] uppercase tracking-[0.06em] text-ink-faint">Requires</p>
            <p className="text-[0.82rem] font-medium text-cream">{requiredRole}</p>
          </div>
          <span className="h-6 w-px bg-gold-600/15" />
          <div className="flex-1 text-left">
            <p className="text-[0.7rem] uppercase tracking-[0.06em] text-ink-faint">Your role</p>
            <p className="text-[0.82rem] font-medium text-ink-soft">{currentRole}</p>
          </div>
        </div>

        <div className="mt-7 flex flex-col gap-2.5 sm:flex-row">
          <button
            type="button"
            onClick={handleGoBack}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gold-600/20 py-2.75 text-[0.86rem] font-medium text-ink-soft transition-colors duration-200 hover:bg-white/5"
          >
            <IconArrowLeft />
            Go back
          </button>
          <button
            type="button"
            onClick={handleGoToDashboard}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-linear-to-br from-gold-400 via-gold-600 to-gold-deep py-2.75 text-[0.86rem] font-semibold text-[#1a1204] shadow-gold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-gold-lg"
          >
            <IconGrid />
            Return to dashboard
          </button>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2.5 border-t border-gold-600/10 pt-5 text-[0.74rem] text-ink-faint">
          <span>
            Ref <span className="font-mono text-ink-soft">{ref}</span> &middot; {time}
          </span>
          <span className="h-3 w-px bg-gold-600/15" />
          <a href="mailto:admin@yourschool.ph" className="flex items-center gap-1.5 text-gold-400 transition-colors hover:text-gold-300">
            <IconMail />
            Contact admin
          </a>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes medallionPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(233, 196, 106, 0.28); }
          50% { box-shadow: 0 0 0 14px rgba(233, 196, 106, 0); }
        }
        @keyframes medallionSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          div[style*="medallionPulse"],
          span[style*="medallionSpin"] {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}