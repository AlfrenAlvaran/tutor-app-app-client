"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Program } from "@/constant/request/type";
import { fetchAllPrograms } from "@/libs/api/programs";

// ---------------------------------------------------------------------------
// Adjust the import path above to wherever fetchAllPrograms actually lives
// in your project (it was defined alongside createProgram/updateProgram in
// the snippet you shared).
//
// Assumes `Program` exposes `_id` (Mongo ObjectId style, matching the kiosk
// URL you gave: /attendance/kiosk/6a6b1705b7ce31facd16cb3f). If your type
// uses `id` instead, just change `program._id` -> `program.id` below.
// ---------------------------------------------------------------------------

type PageStatus = "loading" | "error" | "empty" | "ready";

export default function StudentProgramsPage() {
  const router = useRouter();
  const [status, setStatus] = useState<PageStatus>("loading");
  const [programs, setPrograms] = useState<Program[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await fetchAllPrograms();
        if (cancelled) return;

        if (!data || data.length === 0) {
          setStatus("empty");
          return;
        }

        setPrograms(data);
        setStatus("ready");
      } catch (err) {
        if (cancelled) return;
        setError(
          err instanceof Error ? err.message : "Unable to load programs.",
        );
        setStatus("error");
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  function goToAttendance(program: Program) {
    // @ts-expect-error -- adjust to `program.id` if your Program type doesn't use _id
    router.push(`/attendance/kiosk/${program._id}`);
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
            Programs
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            Select a program to open its attendance kiosk.
          </p>
        </header>

        {status === "loading" && <LoadingState />}

        {status === "error" && (
          <StatusCard
            tone="error"
            title="Couldn't load programs"
            message={error || "Something went wrong. Please refresh."}
          />
        )}

        {status === "empty" && (
          <StatusCard
            tone="info"
            title="No programs yet"
            message="Programs you add will show up here."
          />
        )}

        {status === "ready" && (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {programs.map((program) => (
              <ProgramCard
                key={program.id}
                program={program}
                onSelect={() => goToAttendance(program)}
              />
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}

function ProgramCard({
  program,
  onSelect,
}: {
  program: Program;
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
            {program.label}
          </h2>
          <span className="mt-1 shrink-0 rounded-full bg-gold-600/15 px-2.5 py-1 font-mono text-[10.5px] uppercase tracking-wide text-gold-500">
            {program.mode ?? "—"}
          </span>
        </div>

        {program.description && (
          <p className="line-clamp-2 text-[13.5px] leading-relaxed text-ink-soft">
            {program.description}
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
      <p>Loading programs…</p>
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