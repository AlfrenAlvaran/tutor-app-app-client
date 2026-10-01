"use client";

import { useState } from "react";
import {
  type Assignment,
  type ScheduleDay,
  type ScheduleSlot,
  type CreateAssignmentPayload,
  SCHEDULE_DAYS,
} from "@/constant/request/type";

import { fetchAllStudents } from "@/libs/api/students";
import { useEffect } from "react";
import type { Student } from "@/constant/request/type";
import { useAssignments, useAssignmentStats } from "@/hooks/Useassignments";
import { useTutors } from "@/hooks/useTutors";

const uid = () => Math.random().toString(36).slice(2, 10);

function timeLabel(t: string) {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

function dayShort(day: ScheduleDay) {
  return day.slice(0, 3);
}

type EditableSlot = {
  day: ScheduleDay;
  startTime: string;
  endTime: string;
  localId: string;
};




export default function AssignTutorPage() {
  const { assignments, loading, error, createAssignment, updateAssignment, removeAssignment, toggleStatus } =
    useAssignments();
  const { stats } = useAssignmentStats();
  const { tutors, loading: tutorsLoading } = useTutors();

  const [students, setStudents] = useState<Student[] | null>(null);
  const [studentsError, setStudentsError] = useState("");

  useEffect(() => {
    fetchAllStudents()
      .then(setStudents)
      .catch((err) =>
        setStudentsError(err instanceof Error ? err.message : "Unable to load students."),
      );
  }, []);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  function openCreate() {
    setEditingAssignment(null);
    setModalOpen(true);
  }

  function openEdit(assignment: Assignment) {
    setEditingAssignment(assignment);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingAssignment(null);
  }

  async function handleSubmit(payload: CreateAssignmentPayload) {
    setBusyId(editingAssignment?._id ?? "new");
    try {
      if (editingAssignment) {
        await updateAssignment(editingAssignment._id, payload);
      } else {
        await createAssignment(payload);
      }
      closeModal();
    } catch {

    } finally {
      setBusyId(null);
    }
  }

  async function handleToggleStatus(assignment: Assignment) {
    setBusyId(assignment._id);
    try {
      await toggleStatus(assignment._id);
    } finally {
      setBusyId(null);
    }
  }

  async function handleRemove(assignment: Assignment) {
    const tutorName = assignment.tutor?.name ?? "this tutor";
    const studentName = assignment.student?.name ?? "this student";
    if (!window.confirm(`Remove ${tutorName}'s assignment to ${studentName}?`)) {
      return;
    }
    setBusyId(assignment._id);
    try {
      await removeAssignment(assignment._id);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="min-h-screen bg-navy-950 px-6 py-10 font-body text-cream sm:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-script text-lg text-gold-400/90">Tutoring</p>
            <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-cream">
              Tutor Assignments
            </h1>
            <p className="mt-1.5 text-sm text-ink-soft">
              Match students with tutors and set their weekly schedule.
            </p>
          </div>
          <button
            onClick={openCreate}
            className="group flex h-fit items-center gap-2 rounded-xl bg-linear-to-r from-gold-600 to-gold-500 px-5 py-3 font-body text-sm font-semibold text-navy-950 shadow-gold transition-all duration-150 hover:shadow-gold-lg active:scale-[0.98]"
          >
            <PlusIcon className="h-4 w-4 transition-transform duration-150 group-hover:rotate-90" />
            Assign tutor
          </button>
        </div>

        <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <KpiCard label="Total assignments" value={stats.total} accent="gold" />
          <KpiCard label="Active" value={stats.active} accent="success" />
          <KpiCard label="Tutors in use" value={stats.tutorsInUse} accent="sky" />
          <KpiCard label="Weekly hours" value={stats.weeklyHours} accent="amber" />
        </div>

        {(error || studentsError) && (
          <p className="mt-4 flex items-center gap-2 rounded-lg border border-red-500/25 bg-red-500/5 px-4 py-2.5 text-sm text-red-400">
            <AlertIcon className="h-4 w-4 shrink-0" />
            {studentsError || "Unable to load assignments."}
          </p>
        )}

        {/* Table */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-navy-line bg-navy-900 shadow-panel">
          {loading && <TableSkeleton />}

          {!loading && assignments.length === 0 && (
            <EmptyState
              title="No assignments yet"
              subtitle="Assign a tutor to get started."
            />
          )}

          {!loading && assignments.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-225 border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-navy-line text-[11px] uppercase tracking-wide text-ink-faint">
                    <th className="px-5 py-3.5 font-medium">Student</th>
                    <th className="px-5 py-3.5 font-medium">Tutor</th>
                    <th className="px-5 py-3.5 font-medium">Subject</th>
                    <th className="px-5 py-3.5 font-medium">Schedule</th>
                    <th className="px-5 py-3.5 font-medium">Status</th>
                    <th className="px-5 py-3.5 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {assignments
                    .filter((a): a is Assignment => a != null)
                    .map((a) => (
                    <tr
                      key={a._id}
                      className="group border-b border-navy-line/60 transition-colors last:border-0 hover:bg-navy-800/40"
                    >
                      <td className="px-5 py-3.5">
                        <p className="font-medium text-cream">
                          {a.student?.name ?? "Unknown student"}
                        </p>
                        {a.student?.program && (
                          <p className="text-xs text-ink-faint">{a.student.program}</p>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-ink-soft">
                        {a.tutor?.name ?? "Unknown tutor"}
                      </td>
                      <td className="px-5 py-3.5 text-ink-soft">{a.subject}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex flex-wrap gap-1.5">
                          {(a.schedule ?? []).map((slot, i) => (
                            <span
                              key={slot._id ?? i}
                              className="whitespace-nowrap rounded-full bg-navy-800 px-2.5 py-1 text-[11px] font-medium text-gold-400"
                            >
                              {dayShort(slot.day)} · {timeLabel(slot.startTime)}–
                              {timeLabel(slot.endTime)}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <button
                          onClick={() => handleToggleStatus(a)}
                          disabled={busyId === a._id}
                          className="disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <StatusBadge status={a.status} busy={busyId === a._id} />
                        </button>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-2 opacity-90 transition-opacity group-hover:opacity-100">
                          <button
                            onClick={() => openEdit(a)}
                            disabled={busyId === a._id}
                            className="rounded-lg border border-navy-line px-2.5 py-1.5 text-xs font-medium text-ink-soft transition-colors hover:border-gold-600/50 hover:text-gold-400 disabled:opacity-50"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleRemove(a)}
                            disabled={busyId === a._id}
                            className="rounded-lg border border-red-500/25 px-2.5 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/10 disabled:opacity-50"
                          >
                            Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {modalOpen && (
        <AssignTutorModal
          key={editingAssignment?._id ?? "new"}
          students={students ?? []}
          tutors={tutors}
          tutorsLoading={tutorsLoading}
          initial={editingAssignment}
          busy={busyId !== null}
          onSubmit={handleSubmit}
          onClose={closeModal}
        />
      )}

      <style jsx global>{`
        .input-base {
          width: 100%;
          font-family: var(--font-body), sans-serif;
          font-size: 14.5px;
          color: var(--color-cream);
          background: rgba(6, 14, 36, 0.55);
          border: 1px solid var(--color-navy-line);
          border-radius: 8px;
          padding: 10px 12px;
          transition:
            border-color 0.15s ease,
            box-shadow 0.15s ease;
        }
        .input-base::placeholder {
          color: var(--color-ink-faint);
        }
        .input-base:focus {
          outline: none;
          border-color: var(--color-gold-600);
          box-shadow: 0 0 0 3px rgba(201, 162, 39, 0.18);
        }
      `}</style>
    </div>
  );
}

/* ---------------- Modal: assign / edit ---------------- */

function AssignTutorModal({
  students,
  tutors,
  tutorsLoading,
  initial,
  busy,
  onSubmit,
  onClose,
}: {
  students: Student[];
  tutors: { id: string; name: string; profession: string }[];
  tutorsLoading: boolean;
  initial: Assignment | null;
  busy: boolean;
  onSubmit: (payload: CreateAssignmentPayload) => void;
  onClose: () => void;
}) {
  const [studentId, setStudentId] = useState(initial?.student?._id ?? "");
  const [tutorId, setTutorId] = useState(initial?.tutor?._id ?? "");
  const [subject, setSubject] = useState(initial?.subject ?? "");
  const [schedule, setSchedule] = useState<EditableSlot[]>(
    (initial?.schedule?.length
      ? initial.schedule
      : [{ day: "Monday" as ScheduleDay, startTime: "15:00", endTime: "16:00" }]
    ).map((s) => ({ day: s.day, startTime: s.startTime, endTime: s.endTime, localId: uid() })),
  );
  const [error, setError] = useState("");

  const canSubmit =
    studentId &&
    tutorId &&
    subject.trim() &&
    schedule.length > 0 &&
    schedule.every((s) => s.startTime && s.endTime && s.endTime > s.startTime);

  function addSlot() {
    setSchedule((prev) => [
      ...prev,
      { localId: uid(), day: "Monday", startTime: "15:00", endTime: "16:00" },
    ]);
  }

  function updateSlot(localId: string, patch: Partial<Omit<EditableSlot, "localId">>) {
    setSchedule((prev) =>
      prev.map((s) => (s.localId === localId ? { ...s, ...patch } : s)),
    );
  }

  function removeSlot(localId: string) {
    setSchedule((prev) => prev.filter((s) => s.localId !== localId));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) {
      setError("Fill in student, tutor, subject, and a valid time for every day.");
      return;
    }
    setError("");
    onSubmit({
      studentId,
      tutorId,
      subject: subject.trim(),
      schedule: schedule.map(({ day, startTime, endTime }) => ({
        day,
        startTime,
        endTime,
      })),
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/70 px-5 py-8 backdrop-blur-sm animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-navy-line bg-navy-900 p-7 shadow-panel animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-150">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-display text-xl font-semibold text-cream">
              {initial ? "Edit assignment" : "Assign tutor"}
            </h2>
            <p className="mt-1.5 text-sm text-ink-soft">
              Pick a student, a tutor, and their weekly schedule.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1 text-ink-faint transition-colors hover:bg-navy-800 hover:text-cream"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-medium text-cream">Student</span>
            <select
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="input-base"
              required
            >
              <option value="">Select a student</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-medium text-cream">Tutor</span>
            <select
              value={tutorId}
              onChange={(e) => {
                const id = e.target.value;
                setTutorId(id);
                const t = tutors.find((tu) => tu.id === id);
                if (t && !subject) setSubject(t.profession);
              }}
              className="input-base"
              disabled={tutorsLoading}
              required
            >
              <option value="">
                {tutorsLoading ? "Loading tutors…" : "Select a tutor"}
              </option>
              {tutors.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} — {t.profession}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-medium text-cream">Subject</span>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Mathematics"
              className="input-base"
              required
            />
          </label>

          {/* Schedule repeater */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-medium text-cream">Schedule</span>
              <button
                type="button"
                onClick={addSlot}
                className="flex items-center gap-1 text-xs font-medium text-gold-400 hover:text-gold-300"
              >
                <PlusIcon className="h-3 w-3" /> Add day
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {schedule.map((slot) => (
                <div
                  key={slot.localId}
                  className="flex items-center gap-2 rounded-lg border border-navy-line bg-navy-950/40 p-2.5"
                >
                  <select
                    value={slot.day}
                    onChange={(e) =>
                      updateSlot(slot.localId, { day: e.target.value as ScheduleDay })
                    }
                    className="input-base w-26 py-2! text-[13px]"
                  >
                    {SCHEDULE_DAYS.map((d) => (
                      <option key={d} value={d}>
                        {dayShort(d)}
                      </option>
                    ))}
                  </select>
                  <input
                    type="time"
                    value={slot.startTime}
                    onChange={(e) => updateSlot(slot.localId, { startTime: e.target.value })}
                    className="input-base py-2! text-[13.5px]"
                  />
                  <span className="text-ink-faint">–</span>
                  <input
                    type="time"
                    value={slot.endTime}
                    onChange={(e) => updateSlot(slot.localId, { endTime: e.target.value })}
                    className="input-base py-2! text-[13.5px]"
                  />
                  <button
                    type="button"
                    onClick={() => removeSlot(slot.localId)}
                    disabled={schedule.length === 1}
                    aria-label="Remove day"
                    className="shrink-0 rounded-md p-1.5 text-ink-faint transition-colors hover:bg-red-500/10 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <CloseIcon className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {error && (
            <p className="flex items-center gap-1.5 text-[13.5px] text-red-400">
              <AlertIcon className="h-3.5 w-3.5 shrink-0" />
              {error}
            </p>
          )}

          <div className="mt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2.5 text-sm font-medium text-ink-soft transition-colors hover:text-cream"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit || busy}
              className="flex items-center gap-2 rounded-lg bg-linear-to-r from-gold-600 to-gold-500 px-5 py-2.5 text-sm font-semibold text-navy-950 shadow-gold transition-all hover:shadow-gold-lg disabled:bg-navy-800 disabled:bg-none disabled:text-ink-faint disabled:shadow-none"
            >
              {busy && (
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-[1.5px] border-current border-t-transparent" />
              )}
              {busy ? "Saving…" : initial ? "Save changes" : "Assign tutor"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


function KpiCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: "gold" | "amber" | "success" | "sky";
}) {
  const dot = {
    gold: "bg-gold-500",
    amber: "bg-amber-400",
    success: "bg-success",
    sky: "bg-sky-400",
  }[accent];

  return (
    <div className="rounded-xl border border-navy-line bg-navy-900 px-4 py-3.5 shadow-sm transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-panel">
      <div className="flex items-center gap-2">
        <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
        <p className="text-[11px] uppercase tracking-wide text-ink-faint">{label}</p>
      </div>
      <p className="mt-1.5 font-display text-2xl font-semibold text-cream">{value}</p>
    </div>
  );
}

function StatusBadge({
  status,
  busy,
}: {
  status: Assignment["status"];
  busy?: boolean;
}) {
  const isActive = status === "active";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide transition-colors ${
        isActive ? "bg-success/15 text-success" : "bg-ink-faint/15 text-ink-soft"
      } ${busy ? "opacity-60" : ""}`}
    >
      {busy ? (
        <span className="h-2.5 w-2.5 animate-spin rounded-full border-[1.5px] border-current border-t-transparent" />
      ) : (
        <span className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-success" : "bg-ink-faint"}`} />
      )}
      {isActive ? "Active" : "Paused"}
    </span>
  );
}

function EmptyState({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 p-12 text-center">
      <InboxIcon className="mb-2 h-8 w-8 text-ink-faint" />
      <p className="text-sm font-medium text-cream">{title}</p>
      <p className="text-sm text-ink-soft">{subtitle}</p>
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="p-5">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="mb-3 flex items-center gap-4 rounded-lg border border-navy-line/50 bg-navy-800/30 px-4 py-3.5 last:mb-0"
        >
          <div className="h-3 w-28 rounded bg-navy-line/60" />
          <div className="h-3 w-24 rounded bg-navy-line/60" />
          <div className="h-3 w-16 rounded bg-navy-line/60" />
          <div className="h-5 w-20 rounded-full bg-navy-line/60" />
          <div className="ml-auto h-3 w-16 rounded bg-navy-line/60" />
        </div>
      ))}
    </div>
  );
}

/* ---------------- Inline icons ---------------- */

function PlusIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" {...props}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
function CloseIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}
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