"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import type { ProgramsProps } from "@/constant/guest/props";
import ProgramTile from "../shared/ProgramTile";
import { fetchPrograms } from "@/libs/api/programs";
import { Program } from "@/constant/request/type";

const COLUMN_CLASSES: Record<number, string> = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
};

export default function Programs({
  id = "programs",
  eyebrow = "More Programs",
  title = "Beyond the core curriculum",
  description,
  columns = 4,
  searchable = true,
}: ProgramsProps) {
  const [query, setQuery] = useState("");
  const [programs, setPrograms] = useState<Program[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const columnClass = COLUMN_CLASSES[columns] ?? COLUMN_CLASSES[4];

  const filtered = useMemo(() => {
    if (!query.trim()) return programs;
    const q = query.trim().toLowerCase();
    return programs.filter((p) => p.label.toLowerCase().includes(q));
  }, [programs, query]);

  const loadPrograms = useCallback(() => {
    let cancelled = false;

    setIsLoading(true);
    setError(null);
    fetchPrograms()
      .then((list) => {
        if (!cancelled) {
          setPrograms(list.filter((p) => p.active));
          setError(null);
        }
      })
      .catch((err) => {
        console.error("Error Programs", err);
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Unable to load programs.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const cancel = loadPrograms();
    return cancel;
  }, [loadPrograms, reloadKey]);

  return (
    <section id={id} className="bg-navy-950 py-27.5">
      <div className="mx-auto max-w-295 px-7">
        <div className="mb-16 text-center">
          <span className="mb-4.5 inline-block rounded-full border border-gold-600 bg-linear-to-br from-gold-400/14 to-gold-600/8 px-8.5 py-2.5 font-display text-[0.95rem] font-bold uppercase tracking-[0.18em] text-gold-400">
            {eyebrow}
          </span>
          <h2 className="font-display text-[clamp(1.9rem,3vw,2.5rem)]">
            {title}
          </h2>
          {description && (
            <p className="mx-auto mt-3.5 max-w-140 text-[1.02rem] leading-relaxed text-ink-soft">
              {description}
            </p>
          )}
        </div>

        <div
          className="relative overflow-hidden rounded-[20px] border border-gold-600/25 p-7 transition-colors duration-300 sm:p-12"
          style={{
            background:
              "linear-gradient(135deg, rgba(201,162,39,0.05), rgba(255,255,255,0.01))",
          }}
        >
          {/* Ambient glow accent — purely decorative */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-gold-500/10 blur-3xl"
          />

          {searchable && (
            <div className="relative z-10 mx-auto mb-7 max-w-105">
              <div className="relative">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 stroke-ink-faint"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search programs..."
                  aria-label="Search programs"
                  className="w-full rounded-full border border-gold-600/25 bg-white/3 py-2.75 pl-11 pr-10 text-[0.9rem] text-cream outline-none transition-all duration-200 placeholder:text-ink-faint focus:border-gold-500 focus:bg-gold-600/5 focus:shadow-[0_0_0_3px_rgba(201,162,39,0.12)]"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    aria-label="Clear search"
                    className="absolute right-3.5 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full text-ink-faint transition-colors duration-150 hover:bg-white/8 hover:text-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-3.5 w-3.5"
                    >
                      <path d="M18 6 6 18M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              {!isLoading && !error && (
                <p
                  aria-live="polite"
                  className="mt-2.5 text-center text-[0.78rem] text-ink-faint"
                >
                  {query
                    ? `${filtered.length} of ${programs.length} programs`
                    : `${programs.length} programs available`}
                </p>
              )}
            </div>
          )}

          {isLoading ? (
            <div
              className={`relative z-10 grid grid-cols-1 gap-3.5 ${columnClass}`}
              aria-busy="true"
              aria-label="Loading programs"
            >
              {Array.from({ length: columns * 2 }).map((_, i) => (
                <div
                  key={i}
                  className="h-14 animate-pulse rounded-xl border border-white/6 bg-white/4"
                  style={{ animationDelay: `${i * 60}ms` }}
                />
              ))}
            </div>
          ) : error ? (
            <div className="relative z-10 flex flex-col items-center gap-4 py-10 text-center">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className="h-8 w-8 stroke-gold-400/70"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M12 8v5M12 16h.01" />
              </svg>
              <p className="text-[0.9rem] text-ink-faint">{error}</p>
              <button
                type="button"
                onClick={() => setReloadKey((k) => k + 1)}
                className="rounded-full border border-gold-600/40 px-5 py-2 text-[0.82rem] font-semibold text-gold-400 transition-colors duration-200 hover:bg-gold-600/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
              >
                Try again
              </button>
            </div>
          ) : filtered.length > 0 ? (
            <div
              key={query}
              className={`relative z-10 grid grid-cols-1 gap-3.5 ${columnClass}`}
            >
              {filtered.map((program, index) => (
                <div
                  key={program.id}
                  className="motion-safe:animate-[tileIn_0.4s_ease-out_both]"
                  style={{ animationDelay: `${Math.min(index, 12) * 45}ms` }}
                >
                  <ProgramTile label={program.label} index={index} />
                </div>
              ))}
            </div>
          ) : (
            <div className="relative z-10 flex flex-col items-center gap-3 py-10 text-center">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className="h-8 w-8 stroke-ink-faint"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <p className="text-[0.9rem] text-ink-faint">
                No programs match &quot;{query}&quot;. Try a different search.
              </p>
              <button
                type="button"
                onClick={() => setQuery("")}
                className="text-[0.82rem] font-semibold text-gold-400 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
              >
                Clear search
              </button>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes tileIn {
          from {
            opacity: 0;
            transform: translateY(8px);
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