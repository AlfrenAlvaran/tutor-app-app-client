"use client";

import {
  AssignableStudent,
  AssignmentFilter,
  SCHEDULE_DAYS,
  ScheduleDay,
  Tutor,
  assignTutor,
  getAssignableStudents,
  getTutors,
  reassignTutor,
  unassignTutor,
} from "@/libs/api/assignments";
import { useEffect, useMemo, useState } from "react";

const FILTER_ORDER: AssignmentFilter[] = [
  "all",
  "unassigned",
  "assigned",
  "completed",
];

const FILTER_LABEL: Record<AssignmentFilter, string> = {
  all: "All",
  unassigned: "Unassigned",
  assigned: "Assigned",
  completed: "Session complete",
};

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
function IconUserPlus() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5 stroke-current"
    >
      <circle cx="9" cy="8" r="3.5" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      <path d="M18 8v5M15.5 10.5h5" />
    </svg>
  );
}
function IconSwap() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5 stroke-current"
    >
      <path d="M4 7h13l-3-3M20 17H7l3 3" />
    </svg>
  );
}
function IconX() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5 stroke-current"
    >
      <path d="M18 6 6 18M6 6l12 12" />
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

function TutorBadge({ student }: { student: AssignableStudent }) {
  if (student.sessionFinished) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-gold-600/25 bg-gold-600/8 px-2.5 py-1 text-[0.72rem] font-medium text-gold-300">
        <IconCheck /> Sessions complete
      </span>
    );
  }
  if (student.assignedTutor) {
    return (
      <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/3 px-2.5 py-1 text-[0.78rem] text-ink-soft">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gold-600/15 text-[0.62rem] font-semibold text-gold-300">
          {initials(student.assignedTutor.name)}
        </span>
        {student.assignedTutor.name}
      </span>
    );
  }
  return (
    <span className="text-[0.78rem] text-ink-faint">Not yet assigned</span>
  );
}

function Toast({
  message,
  tone = "gold",
}: {
  message: string;
  tone?: "gold" | "red";
}) {
  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-xl border px-4.5 py-3 text-[0.85rem] text-cream shadow-panel ${
        tone === "gold"
          ? "border-gold-600/30 bg-navy-900"
          : "border-red-500/30 bg-navy-900"
      }`}
      style={{ animation: "toastIn 0.3s ease-out" }}
    >
      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
          tone === "gold"
            ? "bg-gold-600/20 text-gold-400"
            : "bg-red-500/20 text-red-400"
        }`}
      >
        {tone === "gold" ? <IconCheck /> : <IconAlert />}
      </span>
      {message}
    </div>
  );
}

export default function AssignmentsPage() {
  const [students, setStudents] = useState<AssignableStudent[]>([]);
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<AssignmentFilter>("all");

  const [assignTarget, setAssignTarget] = useState<AssignableStudent | null>(
    null,
  );
  const [tutorQuery, setTutorQuery] = useState("");
  const [selectedTutorId, setSelectedTutorId] = useState<string | null>(null);
  const [assignDay, setAssignDay] = useState<ScheduleDay>("");
  const [assignStart, setAssignStart] = useState("");
  const [assignEnd, setAssignEnd] = useState("");
  const [saving, setSaving] = useState(false);

  const [unassignTarget, setUnassignTarget] =
    useState<AssignableStudent | null>(null);
  const [unassigning, setUnassigning] = useState(false);

  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const [toast, setToast] = useState<{
    message: string;
    tone: "gold" | "red";
  } | null>(null);
  const showToast = (message: string, tone: "gold" | "red" = "gold") => {
    setToast({ message, tone });
    setTimeout(() => setToast(null), 2800);
  };

  const loadData = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [studentRes, tutorRes] = await Promise.allSettled([
        getAssignableStudents({
          filter,
          search: query || undefined,
          limit: 50,
        }),
        getTutors(),
      ]);

      if (studentRes.status === "rejected") {
        throw new Error(
          `Students: ${studentRes.reason?.message ?? studentRes.reason}`,
        );
      }
      setStudents(studentRes.value.data);

      if (tutorRes.status === "fulfilled") {
        setTutors(tutorRes.value.data);
      } else {
        console.error("[assignments] getTutors failed:", tutorRes.reason);
      }
    } catch (err) {
      setLoadError(
        err instanceof Error
          ? err.message
          : "Couldn't load assignments. Please try refreshing.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(loadData, 250);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, query]);

  const counts = useMemo(() => {
    const base: Record<AssignmentFilter, number> = {
      all: students.length,
      unassigned: 0,
      assigned: 0,
      completed: 0,
    };
    students.forEach((s) => {
      if (s.sessionFinished) base.completed += 1;
      else if (s.assignedTutor) base.assigned += 1;
      else base.unassigned += 1;
    });
    return base;
  }, [students]);

  const filteredTutors = useMemo(() => {
    if (!tutorQuery) return tutors;
    const q = tutorQuery.toLowerCase();
    return tutors.filter((t) => t.name.toLowerCase().includes(q));
  }, [tutors, tutorQuery]);

  const openAssignModal = (student: AssignableStudent) => {
    setAssignTarget(student);
    setSelectedTutorId(student.assignedTutor?.id ?? null);
    setAssignDay((student.scheduleDay as ScheduleDay) || "");
    setAssignStart(student.scheduleStartTime || "");
    setAssignEnd(student.scheduleEndTime || "");
    setTutorQuery("");
  };

  const closeAssignModal = () => {
    if (saving) return;
    setAssignTarget(null);
  };

  const confirmAssign = async () => {
    if (!assignTarget || !selectedTutorId) return;
    const tutorId = selectedTutorId;
    const target = assignTarget;
    setSaving(true);
    try {
      const isReassign = Boolean(target.assignedTutor);
      const action = isReassign ? reassignTutor : assignTutor;
      await action(target.id, {
        tutorId,
        scheduleDay: assignDay || undefined,
        scheduleStartTime: assignStart || undefined,
        scheduleEndTime: assignEnd || undefined,
      });

      const tutorName = tutors.find((t) => t.id === tutorId)?.name ?? "";
      setStudents((prev) =>
        prev.map((s) =>
          s.id === target.id
            ? {
                ...s,
                assignedTutor: { id: tutorId, name: tutorName },
                scheduleDay: assignDay,
                scheduleStartTime: assignStart,
                scheduleEndTime: assignEnd,
              }
            : s,
        ),
      );
      showToast(
        `${target.name} ${isReassign ? "reassigned to" : "assigned to"} ${tutorName || "the tutor"}.`,
      );
      setAssignTarget(null);
    } catch (err) {
      console.error("[assignments] save failed:", err);
      showToast("Couldn't save the assignment. Please try again.", "red");
    } finally {
      setSaving(false);
    }
  };

  const confirmUnassign = async () => {
    if (!unassignTarget) return;
    setUnassigning(true);
    setUpdatingId(unassignTarget.id);
    try {
      await unassignTutor(unassignTarget.id);
      setStudents((prev) =>
        prev.map((s) =>
          s.id === unassignTarget.id
            ? {
                ...s,
                assignedTutor: null,
                scheduleDay: "",
                scheduleStartTime: "",
                scheduleEndTime: "",
              }
            : s,
        ),
      );
      showToast(`${unassignTarget.name} is now unassigned.`);
      setUnassignTarget(null);
    } catch (err) {
      console.error("[assignments] unassign failed:", err);
      showToast("Couldn't remove the assignment. Please try again.", "red");
    } finally {
      setUnassigning(false);
      setUpdatingId(null);
    }
  };

  return (
    <div>
      <div className="mb-7">
        <h1 className="font-display text-[1.5rem] font-bold text-cream">
          Tutor assignments
        </h1>
        <p className="mt-1 text-[0.88rem] text-ink-soft">
          Match enrolled students with a tutor and set their weekly schedule.
        </p>
      </div>

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

      <div
        className="overflow-hidden rounded-2xl border border-gold-600/15"
        style={{ background: "linear-gradient(160deg, #0e1c3a, #060e24)" }}
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center px-6 py-16">
            <span className="h-6 w-6 animate-spin rounded-full border-2 border-gold-600/30 border-t-gold-400" />
            <p className="mt-3 text-[0.84rem] text-ink-faint">
              Loading assignments…
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
            <button
              type="button"
              onClick={loadData}
              className="mt-4 rounded-xl border border-gold-600/20 px-4 py-2 text-[0.82rem] font-medium text-ink-soft transition-colors hover:bg-white/5"
            >
              Try again
            </button>
          </div>
        ) : students.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-176 border-collapse text-left">
              <thead>
                <tr className="border-b border-gold-600/12 text-[0.72rem] font-semibold uppercase tracking-[0.06em] text-ink-faint">
                  <th className="px-5 py-3.5">Student</th>
                  <th className="px-5 py-3.5">Program</th>
                  <th className="px-5 py-3.5">Schedule</th>
                  <th className="px-5 py-3.5">Tutor</th>
                  <th className="px-5 py-3.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gold-600/8">
                {students.map((student, index) => (
                  <tr
                    key={student.id || `student-${index}`}
                    className="transition-colors duration-150 hover:bg-white/2"
                  >
                    <td className="px-5 py-4">
                      <p className="text-[0.9rem] font-medium text-cream">
                        {student.name}
                      </p>
                      <p className="mt-0.5 text-[0.78rem] text-ink-faint">
                        {student.email}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-[0.86rem] text-ink-soft">
                        {student.program}
                      </p>
                      <p className="mt-0.5 text-[0.76rem] text-ink-faint">
                        {student.mode}
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
                          {student.schedulePreference || "No preference set"}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <TutorBadge student={student} />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        {!student.sessionFinished && (
                          <button
                            type="button"
                            disabled={updatingId === student.id}
                            onClick={() => openAssignModal(student)}
                            className="inline-flex items-center gap-1.5 rounded-full border border-gold-600/25 bg-gold-600/8 px-3 py-1.5 text-[0.76rem] font-medium text-gold-300 transition-colors duration-150 hover:bg-gold-600/15 disabled:opacity-50"
                          >
                            {student.assignedTutor ? (
                              <IconSwap />
                            ) : (
                              <IconUserPlus />
                            )}
                            {student.assignedTutor ? "Reassign" : "Assign"}
                          </button>
                        )}
                        {student.assignedTutor && !student.sessionFinished && (
                          <button
                            type="button"
                            disabled={updatingId === student.id}
                            onClick={() => setUnassignTarget(student)}
                            className="inline-flex items-center justify-center rounded-full border border-white/10 p-1.75 text-ink-faint transition-colors duration-150 hover:border-red-500/25 hover:text-red-400 disabled:opacity-50"
                            title="Remove assignment"
                          >
                            <IconX />
                          </button>
                        )}
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
              No students found
            </p>
            <p className="mt-1 text-[0.82rem] text-ink-faint">
              Try a different search term or filter.
            </p>
          </div>
        )}
      </div>

      {assignTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
          <div
            className="absolute inset-0 bg-black/55"
            style={{ animation: "fadeIn 0.2s ease-out" }}
            onClick={closeAssignModal}
          />
          <div
            className="relative w-full max-w-106 rounded-2xl border border-gold-600/20 bg-navy-950 p-6 shadow-panel"
            style={{ animation: "fadeInUp 0.25s ease-out" }}
          >
            <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-linear-to-br from-gold-400 via-gold-600 to-gold-deep text-[#1a1204]">
              <IconUserPlus />
            </span>
            <h3 className="mb-1.5 text-[1.05rem] font-semibold text-cream">
              {assignTarget.assignedTutor ? "Reassign tutor" : "Assign a tutor"}
            </h3>
            <p className="mb-5 text-[0.86rem] leading-relaxed text-ink-soft">
              Choose a tutor and set a weekly slot for{" "}
              <span className="font-medium text-cream">
                {assignTarget.name}
              </span>
              .
            </p>

            <div className="relative mb-3">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint">
                <IconSearch />
              </span>
              <input
                type="text"
                value={tutorQuery}
                onChange={(e) => setTutorQuery(e.target.value)}
                placeholder="Search tutors..."
                className="w-full rounded-xl border border-gold-600/20 bg-white/3 py-2.5 pl-10 pr-3.5 text-[0.86rem] text-cream outline-none transition-colors duration-200 placeholder:text-ink-faint focus:border-gold-500 focus:bg-gold-600/5"
              />
            </div>

            <div className="mb-4 max-h-40 overflow-y-auto rounded-xl border border-white/8">
              {filteredTutors.length > 0 ? (
                filteredTutors.map((tutor, index) => (
                  <button
                    key={tutor.id || `tutor-${index}`}
                    type="button"
                    onClick={() => setSelectedTutorId(tutor.id)}
                    className={`flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-[0.85rem] transition-colors duration-150 ${
                      selectedTutorId === tutor.id
                        ? "bg-gold-600/12 text-cream"
                        : "text-ink-soft hover:bg-white/4"
                    }`}
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold-600/15 text-[0.66rem] font-semibold text-gold-300">
                      {initials(tutor.name)}
                    </span>
                    <span className="flex-1">
                      {tutor.name}
                      {tutor.subject && (
                        <span className="ml-1.5 text-[0.76rem] text-ink-faint">
                          &middot; {tutor.subject}
                        </span>
                      )}
                    </span>
                    {selectedTutorId === tutor.id && (
                      <span className="text-gold-400">
                        <IconCheck />
                      </span>
                    )}
                  </button>
                ))
              ) : (
                <p className="px-3.5 py-4 text-[0.82rem] text-ink-faint">
                  No tutors match that search.
                </p>
              )}
            </div>

            <div className="mb-5 grid grid-cols-3 gap-2.5">
              <select
                value={assignDay}
                onChange={(e) => setAssignDay(e.target.value as ScheduleDay)}
                className="rounded-xl border border-gold-600/20 bg-white/3 px-2.5 py-2 text-[0.8rem] text-cream outline-none focus:border-gold-500"
              >
                <option value="" className="bg-navy-950">
                  Day
                </option>
                {SCHEDULE_DAYS.map((day) => (
                  <option key={day} value={day} className="bg-navy-950">
                    {day}
                  </option>
                ))}
              </select>
              <input
                type="time"
                value={assignStart}
                onChange={(e) => setAssignStart(e.target.value)}
                className="rounded-xl border border-gold-600/20 bg-white/3 px-2.5 py-2 text-[0.8rem] text-cream outline-none focus:border-gold-500"
              />
              <input
                type="time"
                value={assignEnd}
                onChange={(e) => setAssignEnd(e.target.value)}
                className="rounded-xl border border-gold-600/20 bg-white/3 px-2.5 py-2 text-[0.8rem] text-cream outline-none focus:border-gold-500"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={closeAssignModal}
                disabled={saving}
                className="flex-1 rounded-xl border border-gold-600/20 py-2.5 text-[0.86rem] font-medium text-ink-soft transition-colors duration-200 hover:bg-white/5 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmAssign}
                disabled={saving || !selectedTutorId}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-linear-to-br from-gold-400 via-gold-600 to-gold-deep py-2.5 text-[0.86rem] font-semibold text-[#1a1204] shadow-gold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {saving ? (
                  <>
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#1a1204]/30 border-t-[#1a1204]" />
                    Saving...
                  </>
                ) : assignTarget.assignedTutor ? (
                  "Save reassignment"
                ) : (
                  "Confirm assignment"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {unassignTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
          <div
            className="absolute inset-0 bg-black/55"
            style={{ animation: "fadeIn 0.2s ease-out" }}
            onClick={() => !unassigning && setUnassignTarget(null)}
          />
          <div
            className="relative w-full max-w-96 rounded-2xl border border-gold-600/20 bg-navy-950 p-6 shadow-panel"
            style={{ animation: "fadeInUp 0.25s ease-out" }}
          >
            <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-full border border-red-500/25 text-red-400">
              <IconAlert />
            </span>
            <h3 className="mb-1.5 text-[1.05rem] font-semibold text-cream">
              Remove this assignment?
            </h3>
            <p className="mb-6 text-[0.86rem] leading-relaxed text-ink-soft">
              <span className="font-medium text-cream">
                {unassignTarget.name}
              </span>{" "}
              will be unassigned from{" "}
              {unassignTarget.assignedTutor?.name ?? "their tutor"} and their
              schedule slot will be cleared.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setUnassignTarget(null)}
                disabled={unassigning}
                className="flex-1 rounded-xl border border-gold-600/20 py-2.5 text-[0.86rem] font-medium text-ink-soft transition-colors duration-200 hover:bg-white/5 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmUnassign}
                disabled={unassigning}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 py-2.5 text-[0.86rem] font-semibold text-red-400 transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {unassigning ? (
                  <>
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-red-400/30 border-t-red-400" />
                    Removing...
                  </>
                ) : (
                  "Remove assignment"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} tone={toast.tone} />}

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