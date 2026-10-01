"use client";

import { useEffect, useState, type FormEvent } from "react";
import { getPpts, createPpt, deletePpt, type Ppt } from "@/libs/api/ppts";
import { fetchPrograms } from "@/libs/api/programs";
import type { Program } from "@/constant/request/type";

type NewPptInput = {
  title: string;
  lesson: string;
  description: string;
  programId: string;
  file: File | null;
};

function IconPlus() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 stroke-current"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function IconFile() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5 stroke-current"
    >
      <path d="M14 3v4a1 1 0 0 0 1 1h4" />
      <path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2Z" />
    </svg>
  );
}

function IconClose() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4.5 w-4.5 stroke-current"
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

function IconUpload() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5 stroke-current"
    >
      <path d="M12 16V4M12 4 7 9M12 4l5 5" />
      <path d="M4 16v2.5A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5V16" />
    </svg>
  );
}

function IconTrash() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 stroke-current"
    >
      <path d="M4 7h16M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2m2 0-1 13a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 7" />
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

function AddPptModal({
  open,
  onClose,
  onSubmit,
  programOptions,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: NewPptInput) => Promise<void>;
  programOptions: Program[];
}) {
  const [title, setTitle] = useState("");
  const [lesson, setLesson] = useState("");
  const [description, setDescription] = useState("");
  const [programId, setProgramId] = useState(programOptions[0]?.id ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Keep the selection valid if the options load in after the modal
    // is already mounted (e.g. programs finish fetching).
    if (!programId && programOptions.length > 0) {
      setProgramId(programOptions[0].id);
    }
  }, [programOptions, programId]);

  if (!open) return null;

  const resetAndClose = () => {
    setTitle("");
    setLesson("");
    setDescription("");
    setProgramId(programOptions[0]?.id ?? "");
    setFile(null);
    setError(null);
    onClose();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Give the PPT a title.");
      return;
    }
    if (!lesson.trim()) {
      setError("Enter which lesson this belongs to.");
      return;
    }
    if (!programId) {
      setError("Select a program.");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        lesson: lesson.trim(),
        description: description.trim(),
        programId,
        file,
      });
      resetAndClose();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Couldn't add this PPT. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={submitting ? undefined : resetAndClose}
      />

      <div
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-gold-600/15"
        style={{ background: "linear-gradient(160deg, #0e1c3a, #060e24)" }}
      >
        <div className="flex items-center justify-between border-b border-gold-600/12 px-6 py-4.5">
          <h2 className="font-display text-[1.15rem] font-bold text-cream">
            Add PPT
          </h2>
          <button
            type="button"
            onClick={resetAndClose}
            disabled={submitting}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full text-ink-faint transition-colors hover:bg-white/5 hover:text-cream disabled:opacity-40"
          >
            <IconClose />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5">
          <div className="mb-4">
            <label
              htmlFor="ppt-title"
              className="mb-1.5 block text-[0.8rem] font-medium text-ink-soft"
            >
              PPT Title
            </label>
            <input
              id="ppt-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Introduction to Photosynthesis"
              disabled={submitting}
              className="w-full rounded-xl border border-gold-600/20 bg-white/3 px-3.5 py-2.5 text-[0.86rem] text-cream outline-none transition-colors duration-200 placeholder:text-ink-faint focus:border-gold-500 focus:bg-gold-600/5 disabled:opacity-50"
            />
          </div>

          <div className="mb-4 grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="ppt-program"
                className="mb-1.5 block text-[0.8rem] font-medium text-ink-soft"
              >
                Program
              </label>
              <select
                id="ppt-program"
                value={programId}
                onChange={(e) => setProgramId(e.target.value)}
                disabled={submitting || programOptions.length === 0}
                className="w-full rounded-xl border border-gold-600/20 bg-white/3 px-3.5 py-2.5 text-[0.86rem] text-cream outline-none transition-colors duration-200 focus:border-gold-500 focus:bg-gold-600/5 disabled:opacity-50"
              >
                {programOptions.length === 0 && (
                  <option value="">No programs</option>
                )}
                {programOptions.map((p) => (
                  <option key={p.id} value={p.id} className="bg-navy-950">
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="ppt-lesson"
                className="mb-1.5 block text-[0.8rem] font-medium text-ink-soft"
              >
                Lesson
              </label>
              <input
                id="ppt-lesson"
                type="text"
                value={lesson}
                onChange={(e) => setLesson(e.target.value)}
                placeholder="e.g. Lesson 3"
                disabled={submitting}
                className="w-full rounded-xl border border-gold-600/20 bg-white/3 px-3.5 py-2.5 text-[0.86rem] text-cream outline-none transition-colors duration-200 placeholder:text-ink-faint focus:border-gold-500 focus:bg-gold-600/5 disabled:opacity-50"
              />
            </div>
          </div>

          <div className="mb-4">
            <label
              htmlFor="ppt-description"
              className="mb-1.5 block text-[0.8rem] font-medium text-ink-soft"
            >
              Description <span className="text-ink-faint">(optional)</span>
            </label>
            <textarea
              id="ppt-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Brief notes about what this covers..."
              disabled={submitting}
              className="w-full resize-none rounded-xl border border-gold-600/20 bg-white/3 px-3.5 py-2.5 text-[0.86rem] text-cream outline-none transition-colors duration-200 placeholder:text-ink-faint focus:border-gold-500 focus:bg-gold-600/5 disabled:opacity-50"
            />
          </div>

          <div className="mb-5">
            <label className="mb-1.5 block text-[0.8rem] font-medium text-ink-soft">
              File <span className="text-ink-faint">(optional)</span>
            </label>
            <label
              htmlFor="ppt-file"
              className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-gold-600/25 bg-white/3 px-4 py-6 text-center transition-colors hover:border-gold-500 hover:bg-gold-600/5"
            >
              <span className="text-gold-400">
                <IconUpload />
              </span>
              <span className="text-[0.82rem] text-ink-soft">
                {file ? file.name : "Click to upload PPT, PDF, DOC, or DOCX"}
              </span>
              <input
                id="ppt-file"
                type="file"
                accept=".ppt,.pptx,.pdf,.doc,.docx"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                disabled={submitting}
                className="hidden"
              />
            </label>
          </div>

          {error && <p className="mb-4 text-[0.82rem] text-red-400">{error}</p>}

          <div className="flex justify-end gap-2.5">
            <button
              type="button"
              onClick={resetAndClose}
              disabled={submitting}
              className="rounded-xl border border-gold-600/20 px-4 py-2 text-[0.82rem] font-medium text-ink-soft transition-colors hover:bg-white/5 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-gold-500 px-4 py-2 text-[0.82rem] font-semibold text-navy-950 transition-colors hover:bg-gold-400 disabled:opacity-60"
            >
              {submitting ? "Adding…" : "Add PPT"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function TeacherPptsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [ppts, setPpts] = useState<Ppt[]>([]);
  const [programOptions, setProgramOptions] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [pptsResult, programsResult] = await Promise.all([
        getPpts(),
        fetchPrograms(),
      ]);
      setPpts(pptsResult);
      setProgramOptions(programsResult);
    } catch (err) {
      setLoadError(
        err instanceof Error
          ? err.message
          : "Couldn't load PPTs. Please try refreshing.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddPpt = async (input: NewPptInput) => {
    const formData = new FormData();
    formData.set("title", input.title);
    formData.set("lesson", input.lesson);
    formData.set("description", input.description);
    formData.set("programId", input.programId);
    if (input.file) formData.set("file", input.file);

    const created = await createPpt(formData); // lets the modal show the error if this throws
    setPpts((prev) => [created, ...prev]);
  };

  const handleDelete = async (id: string) => {
    const previous = ppts;
    setPpts((prev) => prev.filter((p) => p.id !== id)); // optimistic
    try {
      await deletePpt(id);
    } catch (err) {
      setPpts(previous); // roll back on failure
      setLoadError(
        err instanceof Error ? err.message : "Couldn't delete this PPT.",
      );
    }
  };

  return (
    <div>
      <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-[1.5rem] font-bold text-cream">
            Lesson PPTs
          </h1>
          <p className="mt-1 text-[0.88rem] text-ink-soft">
            {ppts.length} presentation{ppts.length === 1 ? "" : "s"} added.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="flex items-center justify-center gap-1.5 rounded-xl bg-gold-500 px-4 py-2.5 text-[0.84rem] font-semibold text-navy-950 transition-colors hover:bg-gold-400"
        >
          <IconPlus />
          Add PPT
        </button>
      </div>

      <div
        className="overflow-hidden rounded-2xl border border-gold-600/15"
        style={{ background: "linear-gradient(160deg, #0e1c3a, #060e24)" }}
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center px-6 py-16">
            <span className="h-6 w-6 animate-spin rounded-full border-2 border-gold-600/30 border-t-gold-400" />
            <p className="mt-3 text-[0.84rem] text-ink-faint">Loading PPTs…</p>
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
        ) : ppts.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <span className="mb-3.5 flex h-11 w-11 items-center justify-center rounded-full border border-gold-600/25 text-gold-400">
              <IconFile />
            </span>
            <p className="text-[0.94rem] font-medium text-cream">No PPTs yet</p>
            <p className="mt-1 text-[0.82rem] text-ink-faint">
              Click &quot;Add PPT&quot; to attach a presentation to a lesson.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gold-600/8">
            {ppts.map((ppt) => (
              <li key={ppt.id} className="flex items-start gap-3.5 px-5 py-4">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gold-600/15 text-gold-300">
                  <IconFile />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-[0.9rem] font-medium text-cream">
                      {ppt.fileUrl ? (
                        <a
                          href={ppt.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline"
                        >
                          {ppt.title}
                        </a>
                      ) : (
                        ppt.title
                      )}
                    </p>
                    {ppt.program?.label && (
                      <span className="rounded-full border border-white/10 bg-white/3 px-2 py-0.5 text-[0.72rem] text-ink-soft">
                        {ppt.program.label}
                      </span>
                    )}
                    <span className="rounded-full border border-white/10 bg-white/3 px-2 py-0.5 text-[0.72rem] text-ink-soft">
                      {ppt.lesson}
                    </span>
                  </div>
                  {ppt.description && (
                    <p className="mt-1 text-[0.8rem] text-ink-faint">
                      {ppt.description}
                    </p>
                  )}
                  {ppt.fileName && (
                    <p className="mt-1 text-[0.76rem] text-ink-faint">
                      {ppt.fileName}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(ppt.id)}
                  aria-label={`Delete ${ppt.title}`}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink-faint transition-colors hover:bg-red-500/10 hover:text-red-400"
                >
                  <IconTrash />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <AddPptModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleAddPpt}
        programOptions={programOptions}
      />
    </div>
  );
}
