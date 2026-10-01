"use client";

import { useMemo, useState } from "react";
import type { TutorRosterEntry } from "@/constant/request/type";
import { useTutorRoster } from "@/hooks/useTutorRoster";
import { useAttendanceCode } from "@/hooks/useAttendanceCode";
import AttendanceCodeModal from "./AttendanceCodeModal";


export default function TutorAttendancePage({
  tutorId,
  tutorName,
}: {
  tutorId: string;
  tutorName: string;
}) {
  const { roster, loading, error, refresh } = useTutorRoster(tutorId);
  const [modalEntry, setModalEntry] = useState<TutorRosterEntry | null>(null);

  const {
    code,
    loading: generating,
    error: generateError,
    secondsLeft,
    assignmentOptions,
    generate,
    reset,
  } = useAttendanceCode();

  // Today's students first, then everyone else, each group alphabetical.
  const sortedRoster = useMemo(() => {
    return [...roster].sort((a, b) => {
      if (a.scheduledToday !== b.scheduledToday) {
        return a.scheduledToday ? -1 : 1;
      }
      return a.student.name.localeCompare(b.student.name);
    });
  }, [roster]);

  const scheduledTodayCount = roster.filter((r) => r.scheduledToday).length;
  const checkedInCount = roster.filter(
    (r) => r.attendance?.status === "present",
  ).length;

  function openCodeModal(entry: TutorRosterEntry) {
    setModalEntry(entry);
    generate(entry.student._id, entry.assignmentId);
  }

  function closeCodeModal() {
    setModalEntry(null);
    reset();
    refresh();
  }

  return (
    <div className="min-h-screen bg-navy-950 px-6 py-10 font-body text-cream sm:px-10">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div>
          <p className="font-script text-lg text-gold-400/90">{tutorName}</p>
          <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-cream">
            My students
          </h1>
          <p className="mt-1.5 text-sm text-ink-soft">
            Generate a check-in code when a student arrives.
          </p>
        </div>

        {/* KPI cards */}
        <div className="mt-7 grid grid-cols-3 gap-3">
          <KpiCard
            label="Scheduled today"
            value={loading ? null : scheduledTodayCount}
            accent="gold"
          />
          <KpiCard
            label="Checked in"
            value={loading ? null : checkedInCount}
            accent="success"
          />
          <KpiCard
            label="Total students"
            value={loading ? null : roster.length}
            accent="sky"
          />
        </div>

        {error && (
          <p className="mt-4 flex items-center gap-2 rounded-lg border border-red-500/25 bg-red-500/5 px-4 py-2.5 text-sm text-red-400">
            <AlertIcon className="h-4 w-4 shrink-0" />
            {error}
          </p>
        )}

        {/* Roster */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-navy-line bg-navy-900 shadow-panel">
          {loading && <ListSkeleton />}

          {!loading && roster.length === 0 && (
            <div className="flex flex-col items-center gap-1 p-10 text-center">
              <InboxIcon className="mb-1 h-7 w-7 text-ink-faint" />
              <p className="text-sm font-medium text-cream">
                No students assigned yet
              </p>
            </div>
          )}

          {!loading &&
            sortedRoster.map((entry) => {
              // "present" and "late" both mean the student has already
              // checked in today, so the button should offer to *view*
              // that code rather than prompt for a new one — text and
              // styling now agree on the same condition.
              const hasCheckedIn =
                entry.attendance?.status === "present" ||
                entry.attendance?.status === "late";

              return (
                <div
                  key={entry.assignmentId}
                  className="flex items-center gap-3 border-b border-navy-line/60 px-4 py-3.5 last:border-0"
                >
                  <Avatar name={entry.student.name} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-cream">
                      {entry.student.name}
                    </p>
                    <div className="mt-0.5 flex items-center gap-2">
                      {entry.scheduledToday && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-gold-500/10 px-2 py-0.5 text-[11px] font-medium text-gold-400">
                          <span className="h-1 w-1 rounded-full bg-gold-500" />
                          Today
                          {entry.scheduleStartTime &&
                            ` · ${entry.scheduleStartTime}`}
                        </span>
                      )}
                      <StatusLabel status={entry.attendance?.status} />
                    </div>
                  </div>

                  <button
                    onClick={() => openCodeModal(entry)}
                    className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition-all ${
                      hasCheckedIn
                        ? "border border-navy-line text-ink-soft hover:border-gold-600/50 hover:text-gold-400"
                        : "bg-gradient-to-r from-gold-600 to-gold-500 text-navy-950 shadow-gold hover:shadow-gold-lg"
                    }`}
                  >
                    <QrIcon className="h-3.5 w-3.5" />
                    {hasCheckedIn ? "View code" : "Generate code"}
                  </button>
                </div>
              );
            })}
        </div>
      </div>

      {modalEntry && (
        <AttendanceCodeModal
          studentName={modalEntry.student.name}
          code={code}
          loading={generating}
          error={generateError}
          secondsLeft={secondsLeft}
          assignmentOptions={assignmentOptions}
          onClose={closeCodeModal}
          onRetry={() =>
            generate(modalEntry.student._id, modalEntry.assignmentId)
          }
          onPickAssignment={(assignmentId) =>
            generate(modalEntry.student._id, assignmentId)
          }
        />
      )}
    </div>
  );
}

/* ---------------- Status label ---------------- */

function StatusLabel({
  status,
}: {
  status?: "pending" | "present" | "absent" | "late";
}) {
  if (!status || status === "pending") {
    return <p className="text-xs text-ink-soft">Not checked in</p>;
  }
  const styles = {
    present: { dot: "bg-success", label: "Checked in" },
    late: { dot: "bg-amber-400", label: "Checked in late" },
    absent: { dot: "bg-red-400", label: "Absent" },
  }[status];

  return (
    <p className="inline-flex items-center gap-1 text-xs text-ink-soft">
      <span className={`h-1.5 w-1.5 rounded-full ${styles.dot}`} />
      {styles.label}
    </p>
  );
}

/* ---------------- KPI card ---------------- */

function KpiCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number | null;
  accent: "gold" | "amber" | "success" | "sky";
}) {
  const dot = {
    gold: "bg-gold-500",
    amber: "bg-amber-400",
    success: "bg-success",
    sky: "bg-sky-400",
  }[accent];

  return (
    <div className="rounded-xl border border-navy-line bg-navy-900 px-4 py-3.5 shadow-sm">
      <div className="flex items-center gap-2">
        <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
        <p className="text-[11px] uppercase tracking-wide text-ink-faint">
          {label}
        </p>
      </div>
      {value === null ? (
        <div className="skeleton-shimmer mt-2 h-6 w-10 rounded bg-navy-line/60" />
      ) : (
        <p className="mt-1.5 truncate font-display text-2xl font-semibold text-cream">
          {value}
        </p>
      )}
    </div>
  );
}

/* ---------------- Small pieces ---------------- */

function Avatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gold-600/30 to-gold-500/10 font-display text-xs font-semibold text-gold-400">
      {initials}
    </span>
  );
}

function ListSkeleton() {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="skeleton-shimmer h-9 w-9 rounded-full bg-navy-line/60" />
          <div className="flex-1 space-y-1.5">
            <div className="skeleton-shimmer h-3 w-28 rounded bg-navy-line/60" />
            <div className="skeleton-shimmer h-2.5 w-20 rounded bg-navy-line/60" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------------- Inline icons ---------------- */

function AlertIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 9v4M12 17h.01" />
      <circle cx="12" cy="12" r="9" />
    </svg>
  );
}
function InboxIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M22 12h-6l-2 3h-4l-2-3H2" />
      <path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z" />
    </svg>
  );
}
function QrIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <path d="M14 14h3v3h-3zM19 14h2M14 19h2M19 19h2" />
    </svg>
  );
}