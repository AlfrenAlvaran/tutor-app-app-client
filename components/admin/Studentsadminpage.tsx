"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import type { Student } from "@/constant/request/type";
import type { Program } from "@/constant/request/type";
import {
  deleteStudent,
  fetchAllStudents,
  issueEnrollment,
  markSessionFinished,
} from "@/libs/api/students";
import { fetchAllPrograms } from "@/libs/api/programs";

// Independent of any single program — mirrors PROGRAM_MODES on the backend.
const MODES = ["Online", "Onsite", "Hybrid"];

const ENROLL_PAGE_BASE =
  process.env.NEXT_PUBLIC_APP_BASE_URL?.replace(/\/$/, "") ||
  (typeof window !== "undefined" ? window.location.origin : "");

function enrollmentLink(token: string) {
  return `${ENROLL_PAGE_BASE}/enroll/${token}`;
}

type IssueFormState = {
  name: string;
  program: string;
  mode: string;
};

const EMPTY_ISSUE_FORM: IssueFormState = { name: "", program: "", mode: "" };

type SortKey = "name" | "program" | "mode" | "status" | "session";
type SortDir = "asc" | "desc";

export default function StudentsAdminPage() {
  const [students, setStudents] = useState<Student[] | null>(null);
  const [loadError, setLoadError] = useState("");
  const [loading, setLoading] = useState(true);

  const [programs, setPrograms] = useState<Program[]>([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [issueForm, setIssueForm] = useState<IssueFormState>(EMPTY_ISSUE_FORM);
  const [issuing, setIssuing] = useState(false);
  const [issueError, setIssueError] = useState("");
  const [issuedLink, setIssuedLink] = useState<string | null>(null);

  const [rowBusyId, setRowBusyId] = useState<string | null>(null);
  const [rowError, setRowError] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // --- Search / filter / sort state ---
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "completed" | "pending">("all");
  const [modeFilter, setModeFilter] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  async function loadStudents() {
    setLoading(true);
    setLoadError("");
    try {
      const data = await fetchAllStudents();
      setStudents(data);
    } catch (err) {
      setLoadError(
        err instanceof Error ? err.message : "Unable to load enrollments.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStudents();
    fetchAllPrograms()
      .then(setPrograms)
      .catch(() => setPrograms([]));
  }, []);

  const canIssue =
    issueForm.name.trim().length > 0 && issueForm.program && issueForm.mode;

  function openModal() {
    setIssueForm(EMPTY_ISSUE_FORM);
    setIssueError("");
    setIssuedLink(null);
    setModalOpen(true);
  }

  const closeModal = useCallback(() => setModalOpen(false), []);

  // Close modal on Escape
  useEffect(() => {
    if (!modalOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeModal();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modalOpen, closeModal]);

  async function handleIssueSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canIssue) return;

    setIssuing(true);
    setIssueError("");
    try {
      const student = await issueEnrollment({
        name: issueForm.name.trim(),
        program: issueForm.program,
        mode: issueForm.mode,
      });
      setIssuedLink(enrollmentLink(student.token));
      setStudents((prev) => (prev ? [student, ...prev] : [student]));
    } catch (err) {
      setIssueError(
        err instanceof Error ? err.message : "Unable to issue enrollment.",
      );
    } finally {
      setIssuing(false);
    }
  }

  async function handleToggleSession(student: Student) {
    setRowBusyId(student.id);
    setRowError("");
    try {
      const next = !student.sessionFinished;
      const updated = await markSessionFinished(student.id, {
        sessionFinished: next,
      });
      setStudents(
        (prev) => prev?.map((s) => (s.id === updated.id ? updated : s)) ?? null,
      );
    } catch (err) {
      setRowError(
        err instanceof Error ? err.message : "Unable to update session status.",
      );
    } finally {
      setRowBusyId(null);
    }
  }

  async function handleDelete(student: Student) {
    if (
      !window.confirm(
        `Delete the enrollment record for ${student.name}? This can't be undone.`,
      )
    ) {
      return;
    }
    setRowBusyId(student.id);
    setRowError("");
    try {
      await deleteStudent(student.id);
      setStudents((prev) => prev?.filter((s) => s.id !== student.id) ?? null);
    } catch (err) {
      setRowError(
        err instanceof Error ? err.message : "Unable to delete enrollment.",
      );
    } finally {
      setRowBusyId(null);
    }
  }

  async function handleCopy(student: Student) {
    try {
      await navigator.clipboard.writeText(enrollmentLink(student.token));
      setCopiedId(student.id);
      setTimeout(
        () => setCopiedId((id) => (id === student.id ? null : id)),
        1600,
      );
    } catch {
      setRowError("Couldn't copy the link — copy it manually from the row.");
    }
  }

  function programLabel(student: Student) {
    return typeof student.program === "string"
      ? student.program
      : student.program.label;
  }

  // --- KPIs ---
  const kpis = useMemo(() => {
    const all = students ?? [];
    const completed = all.filter((s) => s.status === "completed").length;
    const pending = all.length - completed;
    const sessionsFinished = all.filter((s) => s.sessionFinished).length;
    return { total: all.length, completed, pending, sessionsFinished };
  }, [students]);

  // --- Filtering + sorting ---
  const visibleStudents = useMemo(() => {
    let list = students ?? [];

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          programLabel(s).toLowerCase().includes(q) ||
          s.token.toLowerCase().includes(q),
      );
    }

    if (statusFilter !== "all") {
      list = list.filter((s) => s.status === statusFilter);
    }

    if (modeFilter !== "all") {
      list = list.filter((s) => s.mode === modeFilter);
    }

    const dir = sortDir === "asc" ? 1 : -1;
    list = [...list].sort((a, b) => {
      switch (sortKey) {
        case "name":
          return a.name.localeCompare(b.name) * dir;
        case "program":
          return programLabel(a).localeCompare(programLabel(b)) * dir;
        case "mode":
          return a.mode.localeCompare(b.mode) * dir;
        case "status":
          return a.status.localeCompare(b.status) * dir;
        case "session":
          return (Number(a.sessionFinished) - Number(b.sessionFinished)) * dir;
        default:
          return 0;
      }
    });

    return list;
  }, [students, search, statusFilter, modeFilter, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const hasActiveFilters =
    search.trim().length > 0 || statusFilter !== "all" || modeFilter !== "all";

  function clearFilters() {
    setSearch("");
    setStatusFilter("all");
    setModeFilter("all");
  }

  return (
    <div className="min-h-screen bg-navy-950 px-6 py-10 font-body text-cream sm:px-10">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-script text-lg text-gold-400/90">Admissions</p>
            <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-cream">
              Enrollments
            </h1>
            <p className="mt-1.5 text-sm text-ink-soft">
              Issue enrollment passes and track where each one stands.
            </p>
          </div>
          {/* <button
            onClick={openModal}
            className="group flex h-fit items-center gap-2 rounded-xl bg-gradient-to-r from-gold-600 to-gold-500 px-5 py-3 font-body text-sm font-semibold text-navy-950 shadow-gold transition-all duration-150 hover:shadow-gold-lg active:scale-[0.98]"
          >
            <PlusIcon className="h-4 w-4 transition-transform duration-150 group-hover:rotate-90" />
            Issue enrollment
          </button> */}
        </div>

        {/* KPI cards */}
        <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <KpiCard label="Total" value={kpis.total} accent="gold" />
          <KpiCard label="Pending" value={kpis.pending} accent="amber" />
          <KpiCard label="Completed" value={kpis.completed} accent="success" />
          <KpiCard
            label="Sessions finished"
            value={kpis.sessionsFinished}
            accent="sky"
          />
        </div>

        {rowError && (
          <p className="mt-4 flex items-center gap-2 rounded-lg border border-red-500/25 bg-red-500/5 px-4 py-2.5 text-sm text-red-400 animate-in fade-in slide-in-from-top-1">
            <AlertIcon className="h-4 w-4 shrink-0" />
            {rowError}
          </p>
        )}

        {/* Toolbar: search + filters */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by child, program, or ref…"
              className="input-base pl-9"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className="input-base select-gold sm:w-44"
          >
            <option value="all">All statuses</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
          </select>

          <select
            value={modeFilter}
            onChange={(e) => setModeFilter(e.target.value)}
            className="input-base select-gold sm:w-40"
          >
            <option value="all">All modes</option>
            {MODES.map((mode) => (
              <option key={mode} value={mode}>
                {mode}
              </option>
            ))}
          </select>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="whitespace-nowrap rounded-lg border border-navy-line px-3 py-2.5 text-xs font-medium text-ink-soft transition-colors hover:border-gold-600/50 hover:text-gold-400"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Table */}
        <div className="mt-4 overflow-hidden rounded-2xl border border-navy-line bg-navy-900 shadow-panel">
          {loading && <TableSkeleton />}

          {!loading && loadError && (
            <p className="p-8 text-center text-sm text-red-400">{loadError}</p>
          )}

          {!loading && !loadError && (students ?? []).length === 0 && (
            <EmptyState
              title="No enrollments yet"
              subtitle="Issue one to get started."
            />
          )}

          {!loading &&
            !loadError &&
            (students ?? []).length > 0 &&
            visibleStudents.length === 0 && (
              <EmptyState
                title="No matches"
                subtitle="Try adjusting your search or filters."
                action={
                  <button
                    onClick={clearFilters}
                    className="mt-3 rounded-lg border border-gold-600/40 px-3 py-1.5 text-xs font-medium text-gold-400 hover:bg-gold-600/10"
                  >
                    Clear filters
                  </button>
                }
              />
            )}

          {!loading && !loadError && visibleStudents.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-navy-line text-[11px] uppercase tracking-wide text-ink-faint">
                    <SortableHeader
                      label="Child"
                      active={sortKey === "name"}
                      dir={sortDir}
                      onClick={() => toggleSort("name")}
                    />
                    <SortableHeader
                      label="Program"
                      active={sortKey === "program"}
                      dir={sortDir}
                      onClick={() => toggleSort("program")}
                    />
                    <SortableHeader
                      label="Mode"
                      active={sortKey === "mode"}
                      dir={sortDir}
                      onClick={() => toggleSort("mode")}
                    />
                    <SortableHeader
                      label="Status"
                      active={sortKey === "status"}
                      dir={sortDir}
                      onClick={() => toggleSort("status")}
                    />
                    <SortableHeader
                      label="Session"
                      active={sortKey === "session"}
                      dir={sortDir}
                      onClick={() => toggleSort("session")}
                    />
                    <th className="px-5 py-3.5 font-medium">Ref</th>
                    <th className="px-5 py-3.5 font-medium text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {visibleStudents.map((student) => (
                    <tr
                      key={student.id}
                      className="group border-b border-navy-line/60 transition-colors last:border-0 hover:bg-navy-800/40"
                    >
                      <td className="px-5 py-3.5 font-medium text-cream">
                        {student.name}
                      </td>
                      <td className="px-5 py-3.5 text-ink-soft">
                        {programLabel(student)}
                      </td>
                      <td className="px-5 py-3.5 text-ink-soft">
                        {student.mode}
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={student.status} />
                      </td>
                      <td className="px-5 py-3.5">
                        <button
                          onClick={() => handleToggleSession(student)}
                          disabled={
                            rowBusyId === student.id ||
                            student.status !== "completed"
                          }
                          title={
                            student.status !== "completed"
                              ? "Available once the enrollment is completed"
                              : "Click to toggle"
                          }
                          className="disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <SessionBadge
                            finished={student.sessionFinished}
                            busy={rowBusyId === student.id}
                          />
                        </button>
                      </td>
                      <td className="px-5 py-3.5 font-mono text-[13px] tracking-wide text-gold-500">
                        {student.token.slice(0, 8).toUpperCase()}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-2 opacity-90 transition-opacity group-hover:opacity-100">
                          <button
                            onClick={() => handleCopy(student)}
                            className="flex items-center gap-1.5 rounded-lg border border-navy-line px-2.5 py-1.5 text-xs font-medium text-ink-soft transition-colors hover:border-gold-600/50 hover:text-gold-400"
                          >
                            {copiedId === student.id ? (
                              <>
                                <CheckIcon className="h-3.5 w-3.5" /> Copied
                              </>
                            ) : (
                              <>
                                <LinkIcon className="h-3.5 w-3.5" /> Copy link
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => handleDelete(student)}
                            disabled={rowBusyId === student.id}
                            className="rounded-lg border border-red-500/25 px-2.5 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/10 disabled:opacity-50"
                          >
                            Delete
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

        {!loading && !loadError && (students ?? []).length > 0 && (
          <p className="mt-3 text-xs text-ink-faint">
            Showing {visibleStudents.length} of {students?.length ?? 0} enrollments
          </p>
        )}
      </div>

      {modalOpen && (
        <IssueEnrollmentModal
          form={issueForm}
          setForm={setIssueForm}
          programs={programs}
          canIssue={canIssue}
          issuing={issuing}
          issueError={issueError}
          issuedLink={issuedLink}
          onSubmit={handleIssueSubmit}
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
        @keyframes pulse-soft {
          0%,
          100% {
            opacity: 0.5;
          }
          50% {
            opacity: 0.9;
          }
        }
        .skeleton-shimmer {
          animation: pulse-soft 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

/* ---------------- Small presentational pieces ---------------- */

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
        <p className="text-[11px] uppercase tracking-wide text-ink-faint">
          {label}
        </p>
      </div>
      <p className="mt-1.5 font-display text-2xl font-semibold text-cream">
        {value}
      </p>
    </div>
  );
}

function SortableHeader({
  label,
  active,
  dir,
  onClick,
}: {
  label: string;
  active: boolean;
  dir: SortDir;
  onClick: () => void;
}) {
  return (
    <th className="px-5 py-3.5 font-medium">
      <button
        onClick={onClick}
        className={`flex items-center gap-1 transition-colors hover:text-gold-400 ${
          active ? "text-gold-400" : ""
        }`}
      >
        {label}
        <ChevronIcon
          className={`h-3 w-3 transition-transform duration-150 ${
            active ? "opacity-100" : "opacity-0 group-hover:opacity-40"
          } ${active && dir === "desc" ? "rotate-180" : ""}`}
        />
      </button>
    </th>
  );
}

function StatusBadge({ status }: { status: Student["status"] }) {
  const isCompleted = status === "completed";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide transition-colors ${
        isCompleted
          ? "bg-success/15 text-success"
          : "bg-gold-600/15 text-gold-500"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          isCompleted ? "bg-success" : "bg-gold-500"
        }`}
      />
      {isCompleted ? "Completed" : "Pending"}
    </span>
  );
}

function SessionBadge({
  finished,
  busy,
}: {
  finished: boolean;
  busy?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide transition-colors ${
        finished
          ? "bg-success/15 text-success"
          : "bg-ink-faint/15 text-ink-soft"
      } ${busy ? "opacity-60" : ""}`}
    >
      {busy ? (
        <span className="h-2.5 w-2.5 animate-spin rounded-full border-[1.5px] border-current border-t-transparent" />
      ) : (
        <span
          className={`h-1.5 w-1.5 rounded-full ${
            finished ? "bg-success" : "bg-ink-faint"
          }`}
        />
      )}
      {finished ? "Finished" : "In progress"}
    </span>
  );
}

function EmptyState({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 p-12 text-center">
      <InboxIcon className="mb-2 h-8 w-8 text-ink-faint" />
      <p className="text-sm font-medium text-cream">{title}</p>
      <p className="text-sm text-ink-soft">{subtitle}</p>
      {action}
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="p-5">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="skeleton-shimmer mb-3 flex items-center gap-4 rounded-lg border border-navy-line/50 bg-navy-800/30 px-4 py-3.5 last:mb-0"
          style={{ animationDelay: `${i * 0.08}s` }}
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

function IssueEnrollmentModal({
  form,
  setForm,
  programs,
  canIssue,
  issuing,
  issueError,
  issuedLink,
  onSubmit,
  onClose,
}: {
  form: IssueFormState;
  setForm: React.Dispatch<React.SetStateAction<IssueFormState>>;
  programs: Program[];
  canIssue: boolean | string;
  issuing: boolean;
  issueError: string;
  issuedLink: string | null;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/70 px-5 backdrop-blur-sm animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="issue-modal-heading"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md rounded-2xl border border-navy-line bg-navy-900 p-7 shadow-panel animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-150">
        {!issuedLink ? (
          <>
            <div className="flex items-start justify-between">
              <div>
                <h2
                  id="issue-modal-heading"
                  className="font-display text-xl font-semibold text-cream"
                >
                  Issue enrollment
                </h2>
                <p className="mt-1.5 text-sm text-ink-soft">
                  This creates a one-time link a guardian uses to complete the
                  rest of the form.
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

            <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
              <label className="flex flex-col gap-1.5">
                <span className="text-[13px] font-medium text-cream">
                  Child&apos;s name
                </span>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Full name"
                  className="input-base"
                  autoFocus
                  required
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-[13px] font-medium text-cream">
                  Program
                </span>
                <select
                  value={form.program}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, program: e.target.value }))
                  }
                  className="input-base select-gold"
                  required
                >
                  <option value="">Select a program</option>
                  {programs.map((program) => (
                    <option key={program.id} value={program.id}>
                      {program.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-[13px] font-medium text-cream">Mode</span>
                <select
                  value={form.mode}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, mode: e.target.value }))
                  }
                  className="input-base select-gold"
                  required
                >
                  <option value="">Select a mode</option>
                  {MODES.map((mode) => (
                    <option key={mode} value={mode}>
                      {mode}
                    </option>
                  ))}
                </select>
              </label>

              {issueError && (
                <p className="flex items-center gap-1.5 text-[13.5px] text-red-400">
                  <AlertIcon className="h-3.5 w-3.5 shrink-0" />
                  {issueError}
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
                  disabled={!canIssue || issuing}
                  className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-gold-600 to-gold-500 px-5 py-2.5 text-sm font-semibold text-navy-950 shadow-gold transition-all hover:shadow-gold-lg disabled:bg-navy-800 disabled:bg-none disabled:text-ink-faint disabled:shadow-none"
                >
                  {issuing && (
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-[1.5px] border-current border-t-transparent" />
                  )}
                  {issuing ? "Issuing…" : "Issue pass"}
                </button>
              </div>
            </form>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-success/15 text-success">
                <CheckIcon className="h-4 w-4" />
              </span>
              <h2 className="font-display text-xl font-semibold text-cream">
                Pass issued
              </h2>
            </div>
            <p className="mt-1.5 text-sm text-ink-soft">
              Share this link with the guardian to complete enrollment.
            </p>
            <div className="mt-4 flex items-center gap-2 rounded-lg border border-navy-line bg-navy-950/60 px-3 py-2.5">
              <span className="flex-1 truncate font-mono text-[13px] text-gold-400">
                {issuedLink}
              </span>
              <button
                onClick={() => navigator.clipboard.writeText(issuedLink)}
                className="shrink-0 rounded-md border border-gold-600/40 px-2.5 py-1 text-xs font-medium text-gold-400 hover:bg-gold-600/10"
              >
                Copy
              </button>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={onClose}
                className="rounded-lg bg-gradient-to-r from-gold-600 to-gold-500 px-5 py-2.5 text-sm font-semibold text-navy-950 shadow-gold hover:shadow-gold-lg"
              >
                Done
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ---------------- Inline icons (no external icon lib) ---------------- */

function PlusIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" {...props}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
function SearchIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  );
}
function ChevronIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}
function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}
function LinkIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M10 13a5 5 0 007.07 0l2-2a5 5 0 00-7.07-7.07l-1 1" />
      <path d="M14 11a5 5 0 00-7.07 0l-2 2a5 5 0 007.07 7.07l1-1" />
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
function CloseIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}