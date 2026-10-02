"use client";

import {
  AttendanceStatus,
  TutorRecord,
  TutorStats,
  getTutorRecords,
  getTutorStats,
} from "@/libs/api/monitor";
import { useEffect, useMemo, useState } from "react";

type MonitorFilter = "all" | "active" | "idle" | "low";

const FILTER_ORDER: MonitorFilter[] = ["all", "active", "idle", "low"];
const FILTER_LABEL: Record<MonitorFilter, string> = {
  all: "All",
  active: "Active today",
  idle: "No activity today",
  low: "Low attendance",
};
const LOW_RATE = 75;

const STATUS_STYLE: Record<AttendanceStatus, string> = {
  present: "border-emerald-500/25 bg-emerald-500/10 text-emerald-400",
  late: "border-gold-600/25 bg-gold-600/8 text-gold-300",
  absent: "border-red-500/25 bg-red-500/10 text-red-400",
  pending: "border-white/10 bg-white/3 text-ink-faint",
};

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

function timeAgo(iso: string | null) {
  if (!iso) return "No check-ins yet";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

const fmtTime = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
    : "—";
const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

/* ---------- icons ---------- */
const svgProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};
function IconSearch() {
  return (
    <svg {...svgProps} className="h-4 w-4 stroke-current">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.2-3.2" />
    </svg>
  );
}
function IconEye() {
  return (
    <svg {...svgProps} className="h-3.5 w-3.5 stroke-current">
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
function IconX() {
  return (
    <svg {...svgProps} className="h-3.5 w-3.5 stroke-current">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}
function IconCheck() {
  return (
    <svg {...svgProps} strokeWidth={2} className="h-3.5 w-3.5 stroke-current">
      <path d="m5 12 5 5L20 7" />
    </svg>
  );
}
function IconAlert() {
  return (
    <svg {...svgProps} strokeWidth={1.6} className="h-6 w-6 stroke-current">
      <path d="M12 9v4M12 17h.01" />
      <path d="M10.3 3.9 1.9 18a1.8 1.8 0 0 0 1.55 2.7h17.1a1.8 1.8 0 0 0 1.55-2.7L13.7 3.9a1.8 1.8 0 0 0-3.4 0Z" />
    </svg>
  );
}

/* ---------- small pieces ---------- */
function Spinner({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16">
      <span className="h-6 w-6 animate-spin rounded-full border-2 border-gold-600/30 border-t-gold-400" />
      <p className="mt-3 text-[0.84rem] text-ink-faint">{label}</p>
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div
      className="rounded-2xl border border-gold-600/15 px-5 py-4"
      style={{ background: "linear-gradient(160deg, #0e1c3a, #060e24)" }}
    >
      <p className="text-[0.76rem] text-ink-faint">{label}</p>
      <p className="mt-1 font-display text-[1.6rem] font-bold text-cream">
        {value}
      </p>
      {hint && <p className="mt-0.5 text-[0.74rem] text-ink-faint">{hint}</p>}
    </div>
  );
}

function RateBar({ rate }: { rate: number }) {
  const tone =
    rate >= 90 ? "bg-emerald-400" : rate >= LOW_RATE ? "bg-gold-400" : "bg-red-400";
  return (
    <div className="flex items-center gap-2.5">
      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-white/8">
        <div
          className={`h-full rounded-full ${tone}`}
          style={{ width: `${Math.min(rate, 100)}%` }}
        />
      </div>
      <span className="text-[0.82rem] tabular-nums text-ink-soft">{rate}%</span>
    </div>
  );
}

function StatusPill({ status }: { status: AttendanceStatus }) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-0.5 text-[0.72rem] font-medium capitalize ${STATUS_STYLE[status]}`}
    >
      {status}
    </span>
  );
}

function Toast({ message }: { message: string }) {
  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-xl border border-red-500/30 bg-navy-900 px-4.5 py-3 text-[0.85rem] text-cream shadow-panel"
      style={{ animation: "toastIn 0.3s ease-out" }}
    >
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-500/20 text-red-400">
        <IconAlert />
      </span>
      {message}
    </div>
  );
}

/* ---------- page ---------- */
export default function TutorMonitorPage() {
  const [tutors, setTutors] = useState<TutorStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<MonitorFilter>("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const [selected, setSelected] = useState<TutorStats | null>(null);
  const [records, setRecords] = useState<TutorRecord[]>([]);
  const [recordsLoading, setRecordsLoading] = useState(false);

  const [toast, setToast] = useState<string | null>(null);
  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2800);
  };

  const loadData = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await getTutorStats({
        from: from || undefined,
        to: to || undefined,
      });
      setTutors(res.data);
    } catch (err) {
      setLoadError(
        err instanceof Error
          ? err.message
          : "Couldn't load tutor activity. Please try refreshing.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from, to]);

  const openTutor = async (tutor: TutorStats) => {
    setSelected(tutor);
    setRecords([]);
    setRecordsLoading(true);
    try {
      const res = await getTutorRecords(tutor.tutorId);
      setRecords(res.data);
    } catch {
      showToast("Couldn't load this tutor's records. Please try again.");
    } finally {
      setRecordsLoading(false);
    }
  };

  const counts = useMemo(
    () => ({
      all: tutors.length,
      active: tutors.filter((t) => t.todayRecords > 0).length,
      idle: tutors.filter((t) => t.todayRecords === 0).length,
      low: tutors.filter((t) => t.attendanceRate < LOW_RATE).length,
    }),
    [tutors],
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tutors.filter((t) => {
      if (
        q &&
        !t.name.toLowerCase().includes(q) &&
        !t.email.toLowerCase().includes(q) &&
        !t.profession.toLowerCase().includes(q)
      )
        return false;
      if (filter === "active") return t.todayRecords > 0;
      if (filter === "idle") return t.todayRecords === 0;
      if (filter === "low") return t.attendanceRate < LOW_RATE;
      return true;
    });
  }, [tutors, query, filter]);

  const summary = useMemo(() => {
    const todayTotal = tutors.reduce((n, t) => n + t.todayRecords, 0);
    const todayPresent = tutors.reduce((n, t) => n + t.todayPresent, 0);
    const students = tutors.reduce((n, t) => n + t.studentCount, 0);
    const avg = tutors.length
      ? Math.round(
          (tutors.reduce((n, t) => n + t.attendanceRate, 0) / tutors.length) * 10,
        ) / 10
      : 0;
    return { todayTotal, todayPresent, students, avg };
  }, [tutors]);

  return (
    <div>
      <div className="mb-7">
        <h1 className="font-display text-[1.5rem] font-bold text-cream">
          Tutor monitor
        </h1>
        <p className="mt-1 text-[0.88rem] text-ink-soft">
          Track attendance and activity across all tutors and their students.
        </p>
      </div>

      {/* summary */}
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Tutors" value={tutors.length} />
        <StatCard label="Students covered" value={summary.students} />
        <StatCard
          label="Today's check-ins"
          value={`${summary.todayPresent}/${summary.todayTotal}`}
          hint="Present or late"
        />
        <StatCard
          label="Average attendance"
          value={`${summary.avg}%`}
          hint={`${counts.low} below ${LOW_RATE}%`}
        />
      </div>

      {/* toolbar */}
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative w-full sm:w-72">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint">
              <IconSearch />
            </span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tutor, email, profession..."
              className="w-full rounded-xl border border-gold-600/20 bg-white/3 py-2.5 pl-10 pr-3.5 text-[0.86rem] text-cream outline-none transition-colors duration-200 placeholder:text-ink-faint focus:border-gold-500 focus:bg-gold-600/5"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              aria-label="From date"
              className="rounded-xl border border-gold-600/20 bg-white/3 px-3 py-2 text-[0.8rem] text-cream outline-none focus:border-gold-500"
            />
            <span className="text-ink-faint">–</span>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              aria-label="To date"
              className="rounded-xl border border-gold-600/20 bg-white/3 px-3 py-2 text-[0.8rem] text-cream outline-none focus:border-gold-500"
            />
            {(from || to) && (
              <button
                type="button"
                onClick={() => {
                  setFrom("");
                  setTo("");
                }}
                className="rounded-lg px-2 py-1.5 text-[0.78rem] text-ink-faint transition-colors hover:text-ink-soft"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 rounded-xl border border-gold-600/15 bg-white/2 p-1">
          {FILTER_ORDER.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={`rounded-lg px-3.5 py-1.75 text-[0.8rem] font-medium transition-colors duration-200 ${
                filter === key
                  ? "bg-gold-600/20 text-gold-400"
                  : "text-ink-faint hover:text-ink-soft"
              }`}
            >
              {FILTER_LABEL[key]}{" "}
              <span className="opacity-70">({counts[key]})</span>
            </button>
          ))}
        </div>
      </div>

      {/* table */}
      <div
        className="overflow-hidden rounded-2xl border border-gold-600/15"
        style={{ background: "linear-gradient(160deg, #0e1c3a, #060e24)" }}
      >
        {loading ? (
          <Spinner label="Loading tutor activity…" />
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
        ) : visible.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-208 border-collapse text-left">
              <thead>
                <tr className="border-b border-gold-600/12 text-[0.72rem] font-semibold uppercase tracking-[0.06em] text-ink-faint">
                  <th className="px-5 py-3.5">Tutor</th>
                  <th className="px-5 py-3.5">Students</th>
                  <th className="px-5 py-3.5">Today</th>
                  <th className="px-5 py-3.5">Breakdown</th>
                  <th className="px-5 py-3.5">Attendance</th>
                  <th className="px-5 py-3.5">Last check-in</th>
                  <th className="px-5 py-3.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gold-600/8">
                {visible.map((t) => (
                  <tr
                    key={t.tutorId}
                    className="transition-colors duration-150 hover:bg-white/2"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold-600/15 text-[0.7rem] font-semibold text-gold-300">
                          {initials(t.name)}
                        </span>
                        <div>
                          <p className="text-[0.9rem] font-medium text-cream">
                            {t.name}
                          </p>
                          <p className="mt-0.5 text-[0.78rem] text-ink-faint">
                            {t.profession}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-[0.86rem] text-ink-soft">
                      {t.studentCount}
                    </td>
                    <td className="px-5 py-4">
                      {t.todayRecords > 0 ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-gold-600/25 bg-gold-600/8 px-2.5 py-1 text-[0.72rem] font-medium text-gold-300">
                          <IconCheck /> {t.todayPresent}/{t.todayRecords} in
                        </span>
                      ) : (
                        <span className="text-[0.78rem] text-ink-faint">
                          No sessions
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-[0.8rem] text-ink-soft">
                        <span className="text-emerald-400">{t.present}</span>{" "}
                        present &middot;{" "}
                        <span className="text-gold-300">{t.late}</span> late
                      </p>
                      <p className="mt-0.5 text-[0.76rem] text-ink-faint">
                        <span className="text-red-400">{t.absent}</span> absent
                        &middot; {t.pending} pending
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <RateBar rate={t.attendanceRate} />
                    </td>
                    <td className="px-5 py-4 text-[0.82rem] text-ink-soft">
                      {timeAgo(t.lastActivity)}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => openTutor(t)}
                          className="inline-flex items-center gap-1.5 rounded-full border border-gold-600/25 bg-gold-600/8 px-3 py-1.5 text-[0.76rem] font-medium text-gold-300 transition-colors duration-150 hover:bg-gold-600/15"
                        >
                          <IconEye /> View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <span className="mb-3.5 flex h-11 w-11 items-center justify-center rounded-full border border-gold-600/25 text-gold-400">
              <IconSearch />
            </span>
            <p className="text-[0.94rem] font-medium text-cream">
              No tutors found
            </p>
            <p className="mt-1 text-[0.82rem] text-ink-faint">
              Try a different search term, filter, or date range.
            </p>
          </div>
        )}
      </div>

      {/* tutor detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
          <div
            className="absolute inset-0 bg-black/55"
            style={{ animation: "fadeIn 0.2s ease-out" }}
            onClick={() => setSelected(null)}
          />
          <div
            className="relative flex max-h-[85vh] w-full max-w-160 flex-col rounded-2xl border border-gold-600/20 bg-navy-950 p-6 shadow-panel"
            style={{ animation: "fadeInUp 0.25s ease-out" }}
          >
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="absolute right-4 top-4 inline-flex items-center justify-center rounded-full border border-white/10 p-1.75 text-ink-faint transition-colors hover:text-cream"
              title="Close"
            >
              <IconX />
            </button>

            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-linear-to-br from-gold-400 via-gold-600 to-gold-deep text-[0.85rem] font-semibold text-[#1a1204]">
                {initials(selected.name)}
              </span>
              <div>
                <h3 className="text-[1.05rem] font-semibold text-cream">
                  {selected.name}
                </h3>
                <p className="text-[0.82rem] text-ink-faint">
                  {selected.email} &middot; {selected.studentCount} students
                </p>
              </div>
            </div>

            <div className="mb-4 grid grid-cols-4 gap-2.5 text-center">
              {(
                [
                  ["Present", selected.present, "text-emerald-400"],
                  ["Late", selected.late, "text-gold-300"],
                  ["Absent", selected.absent, "text-red-400"],
                  ["Pending", selected.pending, "text-ink-soft"],
                ] as const
              ).map(([label, value, color]) => (
                <div
                  key={label}
                  className="rounded-xl border border-white/8 bg-white/2 py-2.5"
                >
                  <p className={`text-[1.05rem] font-semibold ${color}`}>
                    {value}
                  </p>
                  <p className="text-[0.72rem] text-ink-faint">{label}</p>
                </div>
              ))}
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto rounded-xl border border-white/8">
              {recordsLoading ? (
                <Spinner label="Loading records…" />
              ) : records.length > 0 ? (
                <table className="w-full border-collapse text-left">
                  <thead className="sticky top-0 bg-navy-950">
                    <tr className="border-b border-gold-600/12 text-[0.72rem] font-semibold uppercase tracking-[0.06em] text-ink-faint">
                      <th className="px-4 py-3">Student</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">In / out</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gold-600/8">
                    {records.map((r) => (
                      <tr key={r._id}>
                        <td className="px-4 py-3 text-[0.84rem] text-cream">
                          {r.student?.name ?? "Unknown student"}
                        </td>
                        <td className="px-4 py-3 text-[0.8rem] text-ink-soft">
                          {fmtDate(r.date)}
                        </td>
                        <td className="px-4 py-3 text-[0.8rem] text-ink-faint">
                          {fmtTime(r.checkInTime)} &ndash;{" "}
                          {fmtTime(r.checkOutTime)}
                        </td>
                        <td className="px-4 py-3">
                          <StatusPill status={r.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="px-4 py-10 text-center text-[0.84rem] text-ink-faint">
                  No attendance records for this tutor yet.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast} />}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
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
        @keyframes toastIn {
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
    </div>
  );
}