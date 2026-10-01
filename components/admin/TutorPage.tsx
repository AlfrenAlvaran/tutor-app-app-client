"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Tutor } from "@/constant/request/type";
import {
  tutorFormSchema,
  type TutorFormValues,
} from "@/libs/validation/tutorSchema";
import { useTutors } from "@/hooks/useTutors";

const EMPTY_FORM: TutorFormValues = {
  name: "",
  email: "",
  profession: "",
  bio: "",
};

export default function TutorsAdminPage() {
  const {
    tutors,
    loading,
    error,
    createTutor,
    updateTutor,
    deleteTutor,
    totalCount,
    professionCounts,
    missingBioCount,
  } = useTutors();

  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [modalDefaults, setModalDefaults] =
    useState<TutorFormValues>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const [rowBusyId, setRowBusyId] = useState<string | null>(null);

  useEffect(() => {
    if (!tutors.length) {
      setSelectedId(null);
      return;
    }
    setSelectedId((prev) =>
      prev && tutors.some((t) => t.id === prev) ? prev : tutors[0].id,
    );
  }, [tutors]);

  const filteredTutors = useMemo(() => {
    if (!search.trim()) return tutors;
    const q = search.trim().toLowerCase();
    return tutors.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.profession.toLowerCase().includes(q) ||
        t.email.toLowerCase().includes(q),
    );
  }, [tutors, search]);

  const selectedTutor = useMemo(
    () => tutors.find((t) => t.id === selectedId) ?? null,
    [tutors, selectedId],
  );

  // Profession with the most tutors — shown as a KPI card. Undefined
  // when there are no tutors yet.
  const topProfession = useMemo(() => {
    const entries = Object.entries(professionCounts);
    if (entries.length === 0) return null;
    return entries.reduce((a, b) => (b[1] > a[1] ? b : a));
  }, [professionCounts]);

  function openCreateModal() {
    setModalMode("create");
    setModalDefaults(EMPTY_FORM);
    setSaveError("");
    setModalOpen(true);
  }

  function openEditModal(tutor: Tutor) {
    setModalMode("edit");
    setModalDefaults({
      name: tutor.name,
      email: tutor.email,
      profession: tutor.profession,
      bio: tutor.bio ?? "",
    });
    setSaveError("");
    setModalOpen(true);
  }

  async function handleFormSubmit(values: TutorFormValues) {
    setSaving(true);
    setSaveError("");
    try {
      if (modalMode === "create") {
        const created = await createTutor(values);
        setSelectedId(created.id);
      } else if (selectedTutor) {
        await updateTutor(selectedTutor.id, values);
      }
      setModalOpen(false);
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : "Unable to save tutor.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(tutor: Tutor) {
    if (
      !window.confirm(`Remove ${tutor.name} from tutors? This can't be undone.`)
    ) {
      return;
    }
    setRowBusyId(tutor.id);
    try {
      await deleteTutor(tutor.id);
      setSelectedId((prev) => (prev === tutor.id ? null : prev));
    } catch {
      // useTutors already surfaces a toast on failure
    } finally {
      setRowBusyId(null);
    }
  }

  return (
    <div className="min-h-screen bg-navy-950 px-6 py-10 font-body text-cream sm:px-10">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-script text-lg text-gold-400/90">Faculty</p>
            <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-cream">
              Tutors
            </h1>
            <p className="mt-1.5 text-sm text-ink-soft">
              Manage tutor profiles and keep their bios up to date.
            </p>
          </div>
          <button
            onClick={openCreateModal}
            className="group flex h-fit items-center gap-2 rounded-xl bg-gradient-to-r from-gold-600 to-gold-500 px-5 py-3 font-body text-sm font-semibold text-navy-950 shadow-gold transition-all duration-150 hover:shadow-gold-lg active:scale-[0.98]"
          >
            <PlusIcon className="h-4 w-4 transition-transform duration-150 group-hover:rotate-90" />
            Add tutor
          </button>
        </div>

        {/* KPI cards */}
        <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <KpiCard
            label="Total tutors"
            value={loading ? null : totalCount}
            accent="gold"
          />
          <KpiCard
            label="Missing bio"
            value={loading ? null : missingBioCount}
            accent={missingBioCount > 0 ? "amber" : "success"}
          />
          <KpiCard
            label="Top profession"
            value={loading ? null : (topProfession?.[0] ?? "—")}
            sublabel={
              !loading && topProfession
                ? `${topProfession[1]} tutor${topProfession[1] === 1 ? "" : "s"}`
                : undefined
            }
            accent="sky"
          />
        </div>

        {error && (
          <p className="mt-4 flex items-center gap-2 rounded-lg border border-red-500/25 bg-red-500/5 px-4 py-2.5 text-sm text-red-400">
            <AlertIcon className="h-4 w-4 shrink-0" />
            Unable to load tutors. Please refresh and try again.
          </p>
        )}

        {/* Main layout: list + detail */}
        <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-[340px_1fr]">
          {/* Left: search + tutor list */}
          <div className="overflow-hidden rounded-2xl border border-navy-line bg-navy-900 shadow-panel">
            <div className="border-b border-navy-line p-3.5">
              <div className="relative">
                <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search tutors…"
                  className="input-base pl-9"
                />
              </div>
            </div>

            <div className="max-h-[560px] overflow-y-auto">
              {loading && <ListSkeleton />}

              {!loading && tutors.length === 0 && (
                <div className="flex flex-col items-center gap-1 p-8 text-center">
                  <InboxIcon className="mb-1 h-7 w-7 text-ink-faint" />
                  <p className="text-sm font-medium text-cream">
                    No tutors yet
                  </p>
                  <p className="text-sm text-ink-soft">
                    Add one to get started.
                  </p>
                </div>
              )}

              {!loading && tutors.length > 0 && filteredTutors.length === 0 && (
                <p className="p-8 text-center text-sm text-ink-soft">
                  No tutors match your search.
                </p>
              )}

              {!loading &&
                filteredTutors.map((tutor) => (
                  <button
                    key={tutor.id}
                    onClick={() => setSelectedId(tutor.id)}
                    className={`flex w-full items-center gap-3 border-b border-navy-line/60 px-4 py-3.5 text-left transition-colors last:border-0 hover:bg-navy-800/50 ${
                      selectedId === tutor.id ? "bg-navy-800/70" : ""
                    }`}
                  >
                    <Avatar name={tutor.name} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-cream">
                        {tutor.name}
                      </p>
                      <p className="truncate text-xs text-ink-soft">
                        {tutor.profession}
                      </p>
                    </div>
                    {!tutor.bio?.trim() && (
                      <span
                        title="Missing bio"
                        className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400"
                      />
                    )}
                    {selectedId === tutor.id && (
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" />
                    )}
                  </button>
                ))}
            </div>
          </div>

          {/* Right: detail / bio panel */}
          <div className="rounded-2xl border border-navy-line bg-navy-900 p-7 shadow-panel">
            {loading && (
              <div className="skeleton-shimmer space-y-4">
                <div className="h-6 w-40 rounded bg-navy-line/60" />
                <div className="h-4 w-28 rounded bg-navy-line/60" />
                <div className="mt-6 h-24 rounded bg-navy-line/60" />
              </div>
            )}

            {!loading && !selectedTutor && (
              <div className="flex h-full min-h-[300px] flex-col items-center justify-center gap-2 text-center">
                <UserIcon className="h-8 w-8 text-ink-faint" />
                <p className="text-sm font-medium text-cream">Select a tutor</p>
                <p className="text-sm text-ink-soft">
                  Choose someone from the list to view their bio.
                </p>
              </div>
            )}

            {!loading && selectedTutor && (
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <Avatar name={selectedTutor.name} size="lg" />
                    <div>
                      <h2 className="font-display text-xl font-semibold text-cream">
                        {selectedTutor.name}
                      </h2>
                      <p className="mt-0.5 text-sm text-gold-400">
                        {selectedTutor.profession}
                      </p>
                      <p className="mt-0.5 text-sm text-ink-soft">
                        {selectedTutor.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      onClick={() => openEditModal(selectedTutor)}
                      className="flex items-center gap-1.5 rounded-lg border border-navy-line px-3 py-2 text-xs font-medium text-ink-soft transition-colors hover:border-gold-600/50 hover:text-gold-400"
                    >
                      <EditIcon className="h-3.5 w-3.5" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(selectedTutor)}
                      disabled={rowBusyId === selectedTutor.id}
                      className="rounded-lg border border-red-500/25 px-3 py-2 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/10 disabled:opacity-50"
                    >
                      Remove
                    </button>
                  </div>
                </div>

                <div className="mt-6 border-t border-navy-line pt-6">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-ink-faint">
                    Bio
                  </p>
                  {selectedTutor.bio ? (
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-ink-soft">
                      {selectedTutor.bio}
                    </p>
                  ) : (
                    <p className="mt-2 text-sm italic text-ink-faint">
                      No bio added yet.{" "}
                      <button
                        onClick={() => openEditModal(selectedTutor)}
                        className="not-italic text-gold-400 hover:underline"
                      >
                        Add one
                      </button>
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {modalOpen && (
        <TutorModal
          mode={modalMode}
          defaultValues={modalDefaults}
          saving={saving}
          saveError={saveError}
          onSubmit={handleFormSubmit}
          onClose={() => setModalOpen(false)}
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
        textarea.input-base {
          resize: vertical;
          min-height: 120px;
          line-height: 1.5;
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

/* ---------------- KPI card ---------------- */

function KpiCard({
  label,
  value,
  sublabel,
  accent,
}: {
  label: string;
  value: string | number | null;
  sublabel?: string;
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
      {value === null ? (
        <div className="skeleton-shimmer mt-2 h-6 w-16 rounded bg-navy-line/60" />
      ) : (
        <>
          <p className="mt-1.5 truncate font-display text-2xl font-semibold text-cream">
            {value}
          </p>
          {sublabel && (
            <p className="mt-0.5 text-xs text-ink-faint">{sublabel}</p>
          )}
        </>
      )}
    </div>
  );
}

/* ---------------- Modal ---------------- */

function TutorModal({
  mode,
  defaultValues,
  saving,
  saveError,
  onSubmit,
  onClose,
}: {
  mode: "create" | "edit";
  defaultValues: TutorFormValues;
  saving: boolean;
  saveError: string;
  onSubmit: (values: TutorFormValues) => void;
  onClose: () => void;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<TutorFormValues>({
    resolver: zodResolver(tutorFormSchema),
    mode: "onChange",
    defaultValues,
  });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/70 px-5 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tutor-modal-heading"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-lg rounded-2xl border border-navy-line bg-navy-900 p-7 shadow-panel">
        <div className="flex items-start justify-between">
          <h2
            id="tutor-modal-heading"
            className="font-display text-xl font-semibold text-cream"
          >
            {mode === "create" ? "Add tutor" : "Edit tutor"}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1 text-ink-faint transition-colors hover:bg-navy-800 hover:text-cream"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-6 flex flex-col gap-4"
          noValidate
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5">
              <span className="text-[13px] font-medium text-cream">Name</span>
              <input
                type="text"
                {...register("name")}
                placeholder="Full name"
                className="input-base"
                autoFocus
              />
              <FieldError message={errors.name?.message} />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-[13px] font-medium text-cream">
                Profession
              </span>
              <input
                type="text"
                {...register("profession")}
                placeholder="e.g. Mathematics Teacher"
                className="input-base"
              />
              <FieldError message={errors.profession?.message} />
            </label>
          </div>

          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-medium text-cream">Email</span>
            <input
              type="email"
              {...register("email")}
              placeholder="tutor@email.com"
              className="input-base"
            />
            <FieldError message={errors.email?.message} />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-medium text-cream">Bio</span>
            <textarea
              {...register("bio")}
              placeholder="A short background: credentials, teaching style, experience…"
              className="input-base"
              rows={5}
            />
            <FieldError message={errors.bio?.message} />
          </label>

          {saveError && (
            <p className="flex items-center gap-1.5 text-[13.5px] text-red-400">
              <AlertIcon className="h-3.5 w-3.5 shrink-0" />
              {saveError}
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
              disabled={!isValid || saving}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-gold-600 to-gold-500 px-5 py-2.5 text-sm font-semibold text-navy-950 shadow-gold transition-all hover:shadow-gold-lg disabled:bg-navy-800 disabled:bg-none disabled:text-ink-faint disabled:shadow-none"
            >
              {saving && (
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-[1.5px] border-current border-t-transparent" />
              )}
              {saving
                ? "Saving…"
                : mode === "create"
                  ? "Add tutor"
                  : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <span className="flex items-center gap-1 text-xs text-red-400">
      <AlertIcon className="h-3 w-3 shrink-0" />
      {message}
    </span>
  );
}

/* ---------------- Small pieces ---------------- */

function Avatar({ name, size = "sm" }: { name: string; size?: "sm" | "lg" }) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const dims = size === "lg" ? "h-14 w-14 text-base" : "h-9 w-9 text-xs";

  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gold-600/30 to-gold-500/10 font-display font-semibold text-gold-400 ${dims}`}
    >
      {initials || <UserIcon className="h-4 w-4" />}
    </span>
  );
}

function ListSkeleton() {
  return (
    <div className="skeleton-shimmer space-y-3 p-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-navy-line/60" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 w-28 rounded bg-navy-line/60" />
            <div className="h-2.5 w-20 rounded bg-navy-line/60" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------------- Inline icons ---------------- */

function PlusIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      {...props}
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
function SearchIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      {...props}
    >
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  );
}
function EditIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  );
}
function AlertIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 9v4M12 17h.01" />
      <circle cx="12" cy="12" r="9" />
    </svg>
  );
}
function InboxIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M22 12h-6l-2 3h-4l-2-3H2" />
      <path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z" />
    </svg>
  );
}
function UserIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
function CloseIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}
