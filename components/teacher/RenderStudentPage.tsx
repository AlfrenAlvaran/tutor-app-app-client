"use client";

import {
  TeacherStudent,
  getStudentsByTeacher,
} from "@/libs/api/teacherAssignments";
import { checkInByRefCode, type AttendanceRecord } from "@/libs/api/attendance";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function IconSearch() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 stroke-current"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.2-3.2" />
    </svg>
  );
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

function IconScan() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 stroke-current"
    >
      <path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2" />
      <path d="M3 12h18" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 stroke-current"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

/**
 * Teacher-facing check-in card. Manual entry today (type or paste the
 * refCode a student shows you); swap the input for a camera-based QR
 * reader later without touching checkInByRefCode itself.
 */
function CheckInCard() {
  const [refCode, setRefCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AttendanceRecord | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = refCode.trim();
    if (!trimmed) return;

    setSubmitting(true);
    setError(null);
    setResult(null);
    try {
      const record = await checkInByRefCode(trimmed);
      setResult(record);
      setRefCode("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't check in with that code.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="mb-6 overflow-hidden rounded-2xl border border-gold-600/15 p-5"
      style={{ background: "linear-gradient(160deg, #0e1c3a, #060e24)" }}
    >
      <div className="mb-3.5 flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold-600/15 text-gold-300">
          <IconScan />
        </span>
        <div>
          <p className="text-[0.9rem] font-medium text-cream">Check in a student</p>
          <p className="text-[0.76rem] text-ink-faint">Enter the code they show you, then press Enter.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          value={refCode}
          onChange={(e) => setRefCode(e.target.value)}
          placeholder="e.g. 7F3K-9QZP"
          autoCapitalize="characters"
          className="flex-1 rounded-xl border border-gold-600/20 bg-white/3 px-3.5 py-2.75 font-mono text-[0.88rem] tracking-wide text-cream outline-none transition-colors duration-200 placeholder:text-ink-faint placeholder:tracking-normal focus:border-gold-500 focus:bg-gold-600/5"
        />
        <button
          type="submit"
          disabled={submitting || !refCode.trim()}
          className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-gold-400 to-gold-600 px-5 py-2.75 text-[0.85rem] font-semibold text-[#0e1c3a] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? (
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#0e1c3a]/30 border-t-[#0e1c3a]" />
          ) : (
            <IconCheck />
          )}
          {submitting ? "Checking in…" : "Check in"}
        </button>
      </form>

      {error && <p className="mt-3 text-[0.8rem] text-red-400">{error}</p>}

      {result && (
        <div className="mt-3 flex items-center gap-2.5 rounded-xl border border-emerald-500/25 bg-emerald-500/8 px-4 py-3">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
            <IconCheck />
          </span>
          <p className="text-[0.82rem] text-cream">
            Marked <span className="font-semibold capitalize">{result.status}</span>
            {result.checkInTime && (
              <>
                {" "}at{" "}
                {new Date(result.checkInTime).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </>
            )}
            .
          </p>
        </div>
      )}
    </div>
  );
}

export default function TeacherStudentsPage() {
  // Synchronous — the user was already resolved server-side by TutorLayout
  // and handed down through AuthProvider. No fetching, no await, no async
  // component here.
  const { user } = useAuth();
  const teacherId = user.tutorId;

  const [teacherName, setTeacherName] = useState<string | null>(user.name ?? null);
  const [students, setStudents] = useState<TeacherStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const loadData = async (id: string) => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await getStudentsByTeacher(id);
      setTeacherName(res.teacher?.name ?? user.name ?? null);
      setStudents(res.students);
    } catch (err) {
      setLoadError(
        err instanceof Error
          ? err.message
          : "Couldn't load this teacher's students. Please try refreshing.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (teacherId) {
      loadData(teacherId);
    } else {
      // Account has role "tutor" but no linked Tutor profile document
      // (the email join in getMe/sanitizeUser found nothing). This is a
      // real, visible error state, not a silent empty list.
      setLoading(false);
      setLoadError(
        "No tutor profile is linked to this account yet. Contact an admin to get this set up.",
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teacherId]);

  const filteredStudents = useMemo(() => {
    if (!query) return students;
    const q = query.toLowerCase();
    return students.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.program.toLowerCase().includes(q),
    );
  }, [students, query]);

  return (
    <div>
      <div className="mb-7">
        <h1 className="font-display text-[1.5rem] font-bold text-cream">
          {teacherName ? `${teacherName}'s students` : "Teacher's students"}
        </h1>
        <p className="mt-1 text-[0.88rem] text-ink-soft">
          {students.length} student{students.length === 1 ? "" : "s"} currently
          assigned.
        </p>
      </div>

      <CheckInCard />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-72">
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint">
            <IconSearch />
          </span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search student, program..."
            className="w-full rounded-xl border border-gold-600/20 bg-white/3 py-2.5 pl-10 pr-3.5 text-[0.86rem] text-cream outline-none transition-colors duration-200 placeholder:text-ink-faint focus:border-gold-500 focus:bg-gold-600/5"
          />
        </div>
      </div>

      <div
        className="overflow-hidden rounded-2xl border border-gold-600/15"
        style={{ background: "linear-gradient(160deg, #0e1c3a, #060e24)" }}
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center px-6 py-16">
            <span className="h-6 w-6 animate-spin rounded-full border-2 border-gold-600/30 border-t-gold-400" />
            <p className="mt-3 text-[0.84rem] text-ink-faint">
              Loading students…
            </p>
          </div>
        ) : loadError ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <span className="mb-3.5 flex h-11 w-11 items-center justify-center rounded-full border border-red-500/25 text-red-400">
              <IconAlert />
            </span>
            <p className="text-[0.94rem] font-medium text-cream">
              {loadError}
            </p>
            {teacherId && (
              <button
                type="button"
                onClick={() => loadData(teacherId)}
                className="mt-4 rounded-xl border border-gold-600/20 px-4 py-2 text-[0.82rem] font-medium text-ink-soft transition-colors hover:bg-white/5"
              >
                Try again
              </button>
            )}
          </div>
        ) : filteredStudents.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-176 border-collapse text-left">
              <thead>
                <tr className="border-b border-gold-600/12 text-[0.72rem] font-semibold uppercase tracking-[0.06em] text-ink-faint">
                  <th className="px-5 py-3.5">Student</th>
                  <th className="px-5 py-3.5">Program</th>
                  <th className="px-5 py-3.5">Schedule</th>
                  <th className="px-5 py-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gold-600/8">
                {filteredStudents.map((student) => (
                  <tr
                    key={student.assignmentId}
                    className="transition-colors duration-150 hover:bg-white/2"
                  >
                    <td className="px-5 py-4">
                      <Link href={`/my-students/${student.programId}`} className="flex items-center gap-2.5">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gold-600/15 text-[0.66rem] font-semibold text-gold-300">
                          {initials(student.name)}
                        </span>
                        <div>
                          <p className="text-[0.9rem] font-medium text-cream">
                            {student.name}
                          </p>
                          <p className="mt-0.5 text-[0.78rem] text-ink-faint">
                            {student.email}
                          </p>
                        </div>
                      </Link>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-[0.86rem] text-ink-soft">
                        {student.program}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      {student.scheduleDay ? (
                        <>
                          <p className="text-[0.86rem] text-ink-soft">
                            {student.scheduleDay}
                          </p>
                          <p className="mt-0.5 text-[0.76rem] text-ink-faint">
                            {student.scheduleStartTime} &ndash;{" "}
                            {student.scheduleEndTime}
                          </p>
                        </>
                      ) : (
                        <p className="text-[0.78rem] text-ink-faint">
                          No slot set
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center rounded-full border border-white/10 bg-white/3 px-2.5 py-1 text-[0.76rem] capitalize text-ink-soft">
                        {student.status}
                      </span>
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
              No students found
            </p>
            <p className="mt-1 text-[0.82rem] text-ink-faint">
              {students.length === 0
                ? "This teacher has no students assigned yet."
                : "Try a different search term."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}