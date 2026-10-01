"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Enrollment } from "@/constant/request/type";
import { getMyEnrolledProgram } from "@/libs/api/programs";

// ---------------------------------------------------------------------------
// Adjust the import path above to wherever getMyEnrolledProgram actually
// lives in your project.
// ---------------------------------------------------------------------------

type PageStatus = "loading" | "error" | "empty" | "ready";

export default function StudentProgramsPage() {
  const router = useRouter();
  const [status, setStatus] = useState<PageStatus>("loading");
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await getMyEnrolledProgram();
        if (cancelled) return;

        if (!data || data.length === 0) {
          setStatus("empty");
          return;
        }

        setEnrollments(data);
        setStatus("ready");
      } catch (err) {
        if (cancelled) return;
        setError(
          err instanceof Error ? err.message : "Unable to load your programs.",
        );
        setStatus("error");
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  function goToAttendance(enrollment: Enrollment) {
    router.push(`/attendance/kiosk/${enrollment.id}`);
  }

  return (
    <div className="relative min-h-screen bg-navy-950 font-body text-cream px-5 py-14 sm:py-20 overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(1200px_500px_at_50%_-10%,rgba(201,162,39,0.14),transparent_60%)]"
      />

      <main className="relative z-10 mx-auto w-full max-w-4xl">
        <header className="mb-8">
          <h1 className="font-display text-2xl font-semibold tracking-tight text-cream sm:text-3xl">
            My Programs
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            Select your program to open its attendance kiosk.
          </p>
        </header>

        {status === "loading" && <LoadingState />}

        {status === "error" && (
          <StatusCard
            tone="error"
            title="Couldn't load your programs"
            message={error || "Something went wrong. Please refresh."}
          />
        )}

        {status === "empty" && (
          <StatusCard
            tone="info"
            title="No enrollments yet"
            message="Once you're enrolled in a program, it will show up here."
          />
        )}

        {status === "ready" && (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {enrollments.map((enrollment) => (
              <ProgramCard
                key={enrollment.id}
                enrollment={enrollment}
                onSelect={() => goToAttendance(enrollment)}
              />
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}

function ProgramCard({
  enrollment,
  onSelect,
}: {
  enrollment: Enrollment;
  onSelect: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        className="group flex w-full flex-col items-start gap-3 rounded-2xl border border-navy-line bg-navy-900 p-6 text-left shadow-panel transition-all duration-150 hover:border-gold-600/40 hover:shadow-gold active:scale-[0.99]"
      >
        <div className="flex w-full items-start justify-between gap-3">
          <h2 className="font-display text-lg font-medium text-cream">
            {enrollment.program.label}
          </h2>
          <span className="mt-1 shrink-0 rounded-full bg-gold-600/15 px-2.5 py-1 font-mono text-[10.5px] uppercase tracking-wide text-gold-500">
            {enrollment.mode ?? "—"}
          </span>
        </div>

        {enrollment.schedulePreference && (
          <p className="line-clamp-2 text-[13.5px] leading-relaxed text-ink-soft">
            Preferred schedule: {enrollment.schedulePreference}
          </p>
        )}

        <span className="mt-1 inline-flex items-center gap-1.5 font-body text-[13px] font-medium text-gold-500 transition-transform duration-150 group-hover:translate-x-0.5">
          Open attendance kiosk
          <ArrowIcon />
        </span>
      </button>
    </li>
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
      <p>Loading your programs…</p>
    </div>
  );
}

function StatusCard({
  tone,
  title,
  message,
}: {
  tone: "error" | "info";
  title: string;
  message: string;
}) {
  const iconWrap =
    tone === "error"
      ? "bg-red-500/10 text-red-400"
      : "bg-ink-faint/15 text-ink-soft";

  return (
    <section className="rounded-2xl border border-navy-line bg-navy-900 px-8 py-10 text-center shadow-panel">
      <div
        className={`mx-auto mb-4.5 flex h-12 w-12 items-center justify-center rounded-full ${iconWrap}`}
      >
        {tone === "error" ? <AlertIcon /> : <InfoIcon />}
      </div>
      <h2 className="font-display text-xl font-semibold text-cream">
        {title}
      </h2>
      <p className="mx-auto mt-2.5 max-w-sm text-[14.5px] leading-relaxed text-ink-soft">
        {message}
      </p>
    </section>
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

function ArrowIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path
        d="M5 12h14m-6-6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="2"
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