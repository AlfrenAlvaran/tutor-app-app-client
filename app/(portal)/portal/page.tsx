"use client";

import { StudentEnrollment, getMyEnrollments } from "@/libs/api/student-portal";
import Link from "next/link";
import { useEffect, useState } from "react";

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function IconAlert() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6 stroke-current"
    >
      <path d="M12 9v4M12 17h.01" />
      <path d="M10.3 3.9 1.9 18a1.8 1.8 0 0 0 1.55 2.7h17.1a1.8 1.8 0 0 0 1.55-2.7L13.7 3.9a1.8 1.8 0 0 0-3.4 0Z" />
    </svg>
  );
}
function IconCheck() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5 stroke-current"
    >
      <path d="m5 12 5 5L20 7" />
    </svg>
  );
}
function IconBook() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5 stroke-current"
    >
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15.5a1 1 0 0 1-1 1H6.5A2.5 2.5 0 0 0 4 22Z" />
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    </svg>
  );
}

/** Program + tutor line: "English  ·  Tutor: John Doe" or "TBA" if unmatched. */
function TutorLine({ enrollment }: { enrollment: StudentEnrollment }) {
  if (!enrollment.tutor) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/3 px-2.5 py-1 text-[0.78rem] font-medium text-ink-faint">
        Tutor: TBA
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-gold-600/20 bg-gold-600/6 px-2.5 py-1 text-[0.78rem] text-ink-soft">
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gold-600/15 text-[0.62rem] font-semibold text-gold-300">
        {initials(enrollment.tutor.name)}
      </span>
      Tutor: {enrollment.tutor.name}
      {enrollment.tutor.profession && (
        <span className="text-ink-faint">
          &middot; {enrollment.tutor.profession}
        </span>
      )}
    </span>
  );
}

export default function StudentPortal() {
  const [enrollments, setEnrollments] = useState<StudentEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await getMyEnrollments();
      setEnrollments(res.data);
    } catch (err) {
      setLoadError(
        err instanceof Error
          ? err.message
          : "Couldn't load your programs. Please try refreshing.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div>
      <div className="mb-7">
        <h1 className="font-display text-[1.5rem] font-bold text-cream">
          Your programs
        </h1>
        <p className="mt-1 text-[0.88rem] text-ink-soft">
          See your enrolled programs, your tutor, and your weekly schedule.
        </p>
      </div>

      <div
        className="overflow-hidden rounded-2xl border border-gold-600/15"
        style={{ background: "linear-gradient(160deg, #0e1c3a, #060e24)" }}
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center px-6 py-16">
            <span className="h-6 w-6 animate-spin rounded-full border-2 border-gold-600/30 border-t-gold-400" />
            <p className="mt-3 text-[0.84rem] text-ink-faint">
              Loading your programs…
            </p>
          </div>
        ) : loadError ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <span className="mb-3.5 flex h-11 w-11 items-center justify-center rounded-full border border-red-500/25 text-red-400">
              <IconAlert />
            </span>
            <p className="text-[0.94rem] font-medium text-cream">{loadError}</p>
            <button
              type="button"
              onClick={loadData}
              className="mt-4 rounded-xl border border-gold-600/20 px-4 py-2 text-[0.82rem] font-medium text-ink-soft transition-colors hover:bg-white/5"
            >
              Try again
            </button>
          </div>
        ) : enrollments.length > 0 ? (
          <ul className="divide-y divide-gold-600/8">
            {enrollments.map((enrollment, index) => (
              <Link
                href={`/portal/${enrollment.program.id}`}
                key={enrollment.id || `enrollment-${index}`}
                className="flex flex-col gap-3 px-5 py-4.5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold-600/10 text-gold-300">
                    <IconBook />
                  </span>
                  <div>
                    <p className="text-[0.94rem] font-medium text-cream">
                      {enrollment.program.label}
                    </p>
                    <p className="mt-0.5 text-[0.78rem] text-ink-faint">
                      {enrollment.mode}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-start gap-2 sm:items-end">
                  <TutorLine enrollment={enrollment} />
                  {enrollment.sessionFinished ? (
                    <span className="inline-flex items-center gap-1.5 text-[0.74rem] text-gold-300/80">
                      <IconCheck /> Sessions complete
                    </span>
                  ) : enrollment.scheduleDay ? (
                    <p className="text-[0.78rem] text-ink-faint">
                      {enrollment.scheduleDay} &middot;{" "}
                      {enrollment.scheduleStartTime}&ndash;
                      {enrollment.scheduleEndTime}
                    </p>
                  ) : (
                    <p className="text-[0.78rem] text-ink-faint">
                      {enrollment.schedulePreference ||
                        "Schedule to be set once matched"}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <span className="mb-3.5 flex h-11 w-11 items-center justify-center rounded-full border border-gold-600/25 text-gold-400">
              <IconBook />
            </span>
            <p className="text-[0.94rem] font-medium text-cream">
              No programs yet
            </p>
            <p className="mt-1 text-[0.82rem] text-ink-faint">
              Once you're enrolled, your programs will show up here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
