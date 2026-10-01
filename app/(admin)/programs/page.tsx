"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

import { Program as ApiProgram } from "@/constant/request/type";
import { createProgram, deleteProgram, fetchAllPrograms, updateProgram } from "@/libs/api/programs";

type ProgramStatus = "active" | "inactive";

interface Program {
  id: string;
  name: string;
  category: string;
  price: number;
  duration: string;
  durationInDays: number;

  status: ProgramStatus;
  description: string;
}

type ProgramDraft = Omit<Program, "id">;

function toUiProgram(p: ApiProgram): Program {
  return {
    id: p.id,
    name: p.label,
    category: p.category,
    price: p.price,
    duration: p.duration,
    durationInDays: p.durationInDays,
    status: p.active ? "active" : "inactive",
    description: p.description ?? "",
  };
}

function toApiPayload(draft: Partial<ProgramDraft>) {
  const payload: Record<string, unknown> = {};
  if (draft.name !== undefined) payload.label = draft.name;
  if (draft.category !== undefined) payload.category = draft.category;
  if (draft.price !== undefined) payload.price = draft.price;
  if (draft.durationInDays !== undefined) payload.durationInDays = draft.durationInDays;
  if (draft.duration !== undefined) payload.duration = draft.duration;
  if (draft.description !== undefined) payload.description = draft.description;
  if (draft.status !== undefined) payload.active = draft.status === "active";
  return payload;
}

const PAGE_SIZE_OPTIONS = [5, 10, 25, 50];

function peso(amount: number) {
  return `\u20b1${amount.toLocaleString("en-PH")}`;
}

function IconPlus() {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 stroke-current">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
function IconSearch() {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 stroke-current">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.2-3.2" />
    </svg>
  );
}
function IconEdit() {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 stroke-current">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}
function IconTrash() {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 stroke-current">
      <path d="M4 7h16" />
      <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
      <path d="M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13" />
    </svg>
  );
}
function IconAlert() {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 stroke-current">
      <path d="M12 9v4M12 17h.01" />
      <path d="M10.3 3.9 1.9 18a1.8 1.8 0 0 0 1.55 2.7h17.1a1.8 1.8 0 0 0 1.55-2.7L13.7 3.9a1.8 1.8 0 0 0-3.4 0Z" />
    </svg>
  );
}
function IconClose() {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4.5 w-4.5 stroke-current">
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}
function IconChevronLeft() {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 stroke-current">
      <path d="M15 6l-6 6 6 6" />
    </svg>
  );
}
function IconChevronRight() {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 stroke-current">
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}
function IconChevronsLeft() {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 stroke-current">
      <path d="M18 17l-5-5 5-5M11 17l-5-5 5-5" />
    </svg>
  );
}
function IconChevronsRight() {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 stroke-current">
      <path d="M6 17l5-5-5-5M13 17l5-5-5-5" />
    </svg>
  );
}

/** Builds a page list with ellipsis markers, e.g. [1, "...", 4, 5, 6, "...", 12] */
function buildPageList(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages = new Set<number>([1, 2, total - 1, total, current - 1, current, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);

  const result: (number | "ellipsis")[] = [];
  sorted.forEach((page, i) => {
    if (i > 0 && page - sorted[i - 1] > 1) result.push("ellipsis");
    result.push(page);
  });
  return result;
}

function Pagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  rangeStart,
  rangeEnd,
  onPageChange,
  onPageSizeChange,
}: {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  rangeStart: number;
  rangeEnd: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}) {
  const pageList = buildPageList(page, totalPages);

  return (
    <div className="flex flex-col gap-4 border-t border-gold-600/12 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3 text-[0.8rem] text-ink-faint">
        <span>
          Showing <span className="font-medium text-ink-soft">{rangeStart}</span>
          {"\u2013"}
          <span className="font-medium text-ink-soft">{rangeEnd}</span> of{" "}
          <span className="font-medium text-ink-soft">{totalItems}</span>
        </span>
        <span className="h-3.5 w-px bg-gold-600/15" />
        <label className="flex items-center gap-1.5">
          Rows
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="rounded-lg border border-gold-600/20 bg-white/3 px-2 py-1 text-[0.8rem] text-ink-soft outline-none focus:border-gold-500"
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size} className="bg-navy-950 text-cream">
                {size}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(1)}
          disabled={page === 1}
          aria-label="First page"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-faint transition-colors duration-150 hover:bg-white/5 hover:text-cream disabled:pointer-events-none disabled:opacity-30"
        >
          <IconChevronsLeft />
        </button>
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1}
          aria-label="Previous page"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-faint transition-colors duration-150 hover:bg-white/5 hover:text-cream disabled:pointer-events-none disabled:opacity-30"
        >
          <IconChevronLeft />
        </button>

        {pageList.map((item, i) =>
          item === "ellipsis" ? (
            <span key={`e${i}`} className="flex h-8 w-8 items-center justify-center text-[0.8rem] text-ink-faint">
              {"\u2026"}
            </span>
          ) : (
            <button
              key={item}
              type="button"
              onClick={() => onPageChange(item)}
              aria-current={item === page ? "page" : undefined}
              className={`flex h-8 w-8 items-center justify-center rounded-lg text-[0.8rem] font-medium transition-colors duration-150 ${
                item === page
                  ? "bg-gold-600/20 text-gold-400"
                  : "text-ink-faint hover:bg-white/5 hover:text-cream"
              }`}
            >
              {item}
            </button>
          ),
        )}

        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          aria-label="Next page"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-faint transition-colors duration-150 hover:bg-white/5 hover:text-cream disabled:pointer-events-none disabled:opacity-30"
        >
          <IconChevronRight />
        </button>
        <button
          type="button"
          onClick={() => onPageChange(totalPages)}
          disabled={page === totalPages}
          aria-label="Last page"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-faint transition-colors duration-150 hover:bg-white/5 hover:text-cream disabled:pointer-events-none disabled:opacity-30"
        >
          <IconChevronsRight />
        </button>
      </div>
    </div>
  );
}

function StatusSwitch({
  checked,
  onChange,
  busy,
}: {
  checked: boolean;
  onChange: () => void;
  busy?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      disabled={busy}
      aria-pressed={checked}
      className="flex items-center gap-2.5 disabled:opacity-50"
    >
      <span
        className={`relative shrink-0 rounded-full border transition-colors duration-200 ${
          checked ? "border-gold-500 bg-gold-600/50" : "border-white/15 bg-white/5"
        }`}
        style={{ width: 34, height: 19 }}
      >
        <span
          className={`absolute rounded-full transition-transform duration-200 ${
            checked ? "bg-gold-400" : "bg-ink-faint"
          }`}
          style={{
            width: 13,
            height: 13,
            top: 2,
            left: 2,
            transform: checked ? "translateX(15px)" : "translateX(0)",
          }}
        />
      </span>
      <span
        className={`text-[0.8rem] font-medium ${checked ? "text-gold-400" : "text-ink-faint"}`}
      >
        {checked ? "Active" : "Inactive"}
      </span>
    </button>
  );
}

function Toast({ message }: { message: string }) {
  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-xl border border-gold-600/30 bg-navy-900 px-4.5 py-3 text-[0.85rem] text-cream shadow-panel"
      style={{ animation: "toastIn 0.3s ease-out" }}
    >
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gold-600/20 text-gold-400">
        <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 stroke-current">
          <path d="m5 12 5 5L20 7" />
        </svg>
      </span>
      {message}
    </div>
  );
}

const emptyDraft = (): ProgramDraft => ({
  name: "",
  category: "",
  price: 0,
  duration: "",
  durationInDays: 0,
  status: "active",
  description: "",
});

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | ProgramStatus>("all");

  const [drawer, setDrawer] = useState<{ mode: "create" | "edit"; program?: Program } | null>(null);
  const [draft, setDraft] = useState<ProgramDraft>(emptyDraft());
  const [saving, setSaving] = useState(false);

  const [pendingDelete, setPendingDelete] = useState<Program | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2400);
  };

  const loadPrograms = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await fetchAllPrograms();
      setPrograms(data.map(toUiProgram));
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Failed to load programs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPrograms();
  }, []);

  const filtered = useMemo(() => {
    return programs.filter((p) => {
      const matchesFilter = filter === "all" || p.status === filter;
      const matchesQuery =
        !query.trim() ||
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.category.toLowerCase().includes(query.toLowerCase());
      return matchesFilter && matchesQuery;
    });
  }, [programs, query, filter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  useEffect(() => {
    setPage(1);
  }, [query, filter, pageSize]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  const rangeStart = filtered.length === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(page * pageSize, filtered.length);

  const counts = useMemo(
    () => ({
      all: programs.length,
      active: programs.filter((p) => p.status === "active").length,
      inactive: programs.filter((p) => p.status === "inactive").length,
    }),
    [programs],
  );

  const openCreate = () => {
    setDraft(emptyDraft());
    setDrawer({ mode: "create" });
  };

  const openEdit = (program: Program) => {
    setDraft({
      name: program.name,
      category: program.category,
      price: program.price,
      duration: program.duration,
      durationInDays: program.durationInDays,
      status: program.status,
      description: program.description,
    });
    setDrawer({ mode: "edit", program });
  };

  const closeDrawer = () => {
    if (saving) return;
    setDrawer(null);
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();

    if (!draft.name.trim() || !draft.category.trim()) {
      showToast("Name and category are required.");
      return;
    }

    if (!Number.isFinite(draft.price) || draft.price <= 0) {
      showToast("Price must be greater than 0.");
      return;
    }

    if (!Number.isFinite(draft.durationInDays) || draft.durationInDays <= 0) {
      showToast("Duration (days) must be greater than 0.");
      return;
    }

    setSaving(true);
    try {
      if (drawer?.mode === "edit" && drawer.program) {
        const updated = await updateProgram(drawer.program.id, toApiPayload(draft));
        const uiProgram = toUiProgram(updated);
        setPrograms((prev) => prev.map((p) => (p.id === uiProgram.id ? uiProgram : p)));
        showToast("Program updated.");
      } else {
        const created = await createProgram(toApiPayload(draft) as Parameters<typeof createProgram>[0]);
        setPrograms((prev) => [toUiProgram(created), ...prev]);
        showToast("Program created.");
      }
      setDrawer(null);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (program: Program) => {
    setTogglingId(program.id);
    try {
      const updated = await updateProgram(program.id, {
        active: program.status !== "active",
      });
      const uiProgram = toUiProgram(updated);
      setPrograms((prev) => prev.map((p) => (p.id === uiProgram.id ? uiProgram : p)));
      showToast(
        uiProgram.status === "inactive"
          ? `${program.name} marked inactive.`
          : `${program.name} marked active.`,
      );
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Status update failed.");
    } finally {
      setTogglingId(null);
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await deleteProgram(pendingDelete.id);
      setPrograms((prev) => prev.filter((p) => p.id !== pendingDelete.id));
      showToast(`${pendingDelete.name} deleted.`);
      setPendingDelete(null);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Delete failed.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-[1.5rem] font-bold text-cream">Programs</h1>
          <p className="mt-1 text-[0.88rem] text-ink-soft">
            Manage the tutoring programs available for enrollment.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="flex items-center justify-center gap-2 rounded-xl bg-linear-to-br from-gold-400 via-gold-600 to-gold-deep px-4.5 py-2.75 text-[0.88rem] font-semibold text-[#1a1204] shadow-gold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-gold-lg"
        >
          <IconPlus />
          Add Program
        </button>
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
            placeholder="Search programs..."
            className="w-full rounded-xl border border-gold-600/20 bg-white/3 py-2.5 pl-10 pr-3.5 text-[0.86rem] text-cream outline-none transition-colors duration-200 placeholder:text-ink-faint focus:border-gold-500 focus:bg-gold-600/5"
          />
        </div>

        <div className="flex gap-1.5 rounded-xl border border-gold-600/15 bg-white/2 p-1">
          {(["all", "active", "inactive"] as const).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={`rounded-lg px-3.5 py-1.75 text-[0.8rem] font-medium capitalize transition-colors duration-200 ${
                filter === key
                  ? "bg-gold-600/20 text-gold-400"
                  : "text-ink-faint hover:text-ink-soft"
              }`}
            >
              {key} <span className="opacity-70">({counts[key]})</span>
            </button>
          ))}
        </div>
      </div>

      <div
        className="overflow-hidden rounded-2xl border border-gold-600/15"
        style={{ background: "linear-gradient(160deg, #0e1c3a, #060e24)" }}
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <span className="h-6 w-6 animate-spin rounded-full border-2 border-gold-600/30 border-t-gold-400" />
            <p className="mt-3.5 text-[0.86rem] text-ink-faint">Loading programs...</p>
          </div>
        ) : loadError ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <span className="mb-3.5 flex h-11 w-11 items-center justify-center rounded-full bg-red-500/12 text-red-400">
              <IconAlert />
            </span>
            <p className="text-[0.94rem] font-medium text-cream">Couldn&apos;t load programs</p>
            <p className="mt-1 text-[0.82rem] text-ink-faint">{loadError}</p>
            <button
              type="button"
              onClick={loadPrograms}
              className="mt-4 rounded-lg border border-gold-600/20 px-4 py-2 text-[0.82rem] text-ink-soft transition-colors duration-200 hover:bg-white/5"
            >
              Retry
            </button>
          </div>
        ) : filtered.length > 0 ? (
          <>
          <div className="overflow-x-auto">
            <table className="w-full min-w-165 border-collapse text-left">
              <thead>
                <tr className="border-b border-gold-600/12 text-[0.72rem] font-semibold uppercase tracking-[0.06em] text-ink-faint">
                  <th className="px-5 py-3.5">Program</th>
                  <th className="px-5 py-3.5">Price</th>
                  <th className="px-5 py-3.5">Duration</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gold-600/8">
                {paginated.map((program) => (
                  <tr key={program.id} className="transition-colors duration-150 hover:bg-white/2">
                    <td className="px-5 py-4">
                      <p className="text-[0.9rem] font-medium text-cream">{program.name}</p>
                      <p className="mt-0.5 text-[0.78rem] text-ink-faint">{program.category}</p>
                    </td>
                    <td className="px-5 py-4 text-[0.86rem] text-ink-soft">
                      {peso(program.price)}
                      <span className="text-ink-faint"> /session</span>
                    </td>
                    <td className="px-5 py-4 text-[0.86rem] text-ink-soft">
                      {program.duration || `${program.durationInDays} days`}
                      <span className="ml-1 text-[0.76rem] text-ink-faint">
                        ({program.durationInDays}d)
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <StatusSwitch
                        checked={program.status === "active"}
                        onChange={() => toggleStatus(program)}
                        busy={togglingId === program.id}
                      />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEdit(program)}
                          aria-label={`Edit ${program.name}`}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-faint transition-colors duration-150 hover:bg-gold-600/12 hover:text-gold-400"
                        >
                          <IconEdit />
                        </button>
                        <button
                          type="button"
                          onClick={() => setPendingDelete(program)}
                          aria-label={`Delete ${program.name}`}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-faint transition-colors duration-150 hover:bg-red-500/12 hover:text-red-400"
                        >
                          <IconTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            page={page}
            totalPages={totalPages}
            totalItems={filtered.length}
            pageSize={pageSize}
            rangeStart={rangeStart}
            rangeEnd={rangeEnd}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <span className="mb-3.5 flex h-11 w-11 items-center justify-center rounded-full border border-gold-600/25 text-gold-400">
              <IconSearch />
            </span>
            <p className="text-[0.94rem] font-medium text-cream">No programs found</p>
            <p className="mt-1 text-[0.82rem] text-ink-faint">
              Try a different search term or filter.
            </p>
          </div>
        )}
      </div>

      {/* Create / edit drawer */}
      {drawer && (
        <div className="fixed inset-0 z-40 flex justify-end">
          <div
            className="absolute inset-0 bg-black/50"
            style={{ animation: "fadeIn 0.2s ease-out" }}
            onClick={closeDrawer}
          />
          <div
            className="relative flex h-full w-full max-w-108 flex-col border-l border-gold-600/20 bg-navy-950 shadow-panel"
            style={{ animation: "slideIn 0.25s ease-out" }}
          >
            <div className="flex items-center justify-between border-b border-gold-600/12 px-6 py-5">
              <h2 className="font-display text-[1.15rem] font-bold text-cream">
                {drawer.mode === "edit" ? "Edit program" : "Add program"}
              </h2>
              <button
                type="button"
                onClick={closeDrawer}
                aria-label="Close"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-faint transition-colors hover:bg-white/5 hover:text-cream"
              >
                <IconClose />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex flex-1 flex-col overflow-y-auto px-6 py-5">
              <label className="mb-1.5 block text-[0.78rem] font-semibold uppercase tracking-[0.06em] text-ink-faint">
                Program name
              </label>
              <input
                type="text"
                required
                value={draft.name}
                onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                placeholder="e.g. Elementary Math Foundations"
                className="mb-4.5 w-full rounded-xl border border-gold-600/20 bg-white/3 px-3.5 py-2.75 text-[0.88rem] text-cream outline-none transition-colors duration-200 placeholder:text-ink-faint focus:border-gold-500 focus:bg-gold-600/5"
              />

              <label className="mb-1.5 block text-[0.78rem] font-semibold uppercase tracking-[0.06em] text-ink-faint">
                Category
              </label>
              <input
                type="text"
                required
                value={draft.category}
                onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value }))}
                placeholder="e.g. Mathematics"
                className="mb-4.5 w-full rounded-xl border border-gold-600/20 bg-white/3 px-3.5 py-2.75 text-[0.88rem] text-cream outline-none transition-colors duration-200 placeholder:text-ink-faint focus:border-gold-500 focus:bg-gold-600/5"
              />

              <div className="mb-4.5 grid grid-cols-2 gap-3.5">
                <div>
                  <label className="mb-1.5 block text-[0.78rem] font-semibold uppercase tracking-[0.06em] text-ink-faint">
                    Price (per session)
                  </label>
                  <input
                    type="number"
                    min={1}
                    step="0.01"
                    required
                    value={draft.price === 0 ? "" : draft.price}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, price: e.target.value === "" ? 0 : Number(e.target.value) }))
                    }
                    placeholder="e.g. 500"
                    className="w-full rounded-xl border border-gold-600/20 bg-white/3 px-3.5 py-2.75 text-[0.88rem] text-cream outline-none transition-colors duration-200 placeholder:text-ink-faint focus:border-gold-500 focus:bg-gold-600/5"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-[0.78rem] font-semibold uppercase tracking-[0.06em] text-ink-faint">
                    Duration (label)
                  </label>
                  <input
                    type="text"
                    required
                    value={draft.duration}
                    onChange={(e) => setDraft((d) => ({ ...d, duration: e.target.value }))}
                    placeholder="e.g. 3 months"
                    className="w-full rounded-xl border border-gold-600/20 bg-white/3 px-3.5 py-2.75 text-[0.88rem] text-cream outline-none transition-colors duration-200 placeholder:text-ink-faint focus:border-gold-500 focus:bg-gold-600/5"
                  />
                </div>
              </div>

              <label className="mb-1.5 block text-[0.78rem] font-semibold uppercase tracking-[0.06em] text-ink-faint">
                Duration in days
              </label>
              <input
                type="number"
                min={1}
                step="1"
                required
                value={draft.durationInDays === 0 ? "" : draft.durationInDays}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    durationInDays: e.target.value === "" ? 0 : Number(e.target.value),
                  }))
                }
                placeholder="e.g. 90"
                className="mb-1.5 w-full rounded-xl border border-gold-600/20 bg-white/3 px-3.5 py-2.75 text-[0.88rem] text-cream outline-none transition-colors duration-200 placeholder:text-ink-faint focus:border-gold-500 focus:bg-gold-600/5"
              />
              <p className="mb-4.5 text-[0.76rem] text-ink-faint">
                Used to auto-detect when a student&apos;s attendance session is complete. The label above is just for display.
              </p>

              <label className="mb-1.5 block text-[0.78rem] font-semibold uppercase tracking-[0.06em] text-ink-faint">
                Description
              </label>
              <textarea
                value={draft.description}
                onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
                placeholder="What learners can expect from this program..."
                className="mb-4.5 min-h-22 w-full resize-y rounded-xl border border-gold-600/20 bg-white/3 px-3.5 py-2.75 text-[0.88rem] text-cream outline-none transition-colors duration-200 placeholder:text-ink-faint focus:border-gold-500 focus:bg-gold-600/5"
              />

              <div className="mb-6 flex items-center justify-between rounded-xl border border-gold-600/15 bg-white/2 px-4 py-3.25">
                <div>
                  <p className="text-[0.86rem] font-medium text-cream">Program status</p>
                  <p className="text-[0.76rem] text-ink-faint">
                    Inactive programs are hidden from enrollment.
                  </p>
                </div>
                <StatusSwitch
                  checked={draft.status === "active"}
                  onChange={() =>
                    setDraft((d) => ({ ...d, status: d.status === "active" ? "inactive" : "active" }))
                  }
                />
              </div>

              <div className="mt-auto flex gap-3 border-t border-gold-600/12 pt-5">
                <button
                  type="button"
                  onClick={closeDrawer}
                  disabled={saving}
                  className="flex-1 rounded-xl border border-gold-600/20 py-2.75 text-[0.88rem] font-medium text-ink-soft transition-colors duration-200 hover:bg-white/5 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-linear-to-br from-gold-400 via-gold-600 to-gold-deep py-2.75 text-[0.88rem] font-semibold text-[#1a1204] shadow-gold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-gold-lg disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
                >
                  {saving ? (
                    <>
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#1a1204]/30 border-t-[#1a1204]" />
                      Saving...
                    </>
                  ) : drawer.mode === "edit" ? (
                    "Save changes"
                  ) : (
                    "Create program"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {pendingDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
          <div
            className="absolute inset-0 bg-black/55"
            style={{ animation: "fadeIn 0.2s ease-out" }}
            onClick={() => !deleting && setPendingDelete(null)}
          />
          <div
            className="relative w-full max-w-95 rounded-2xl border border-gold-600/20 bg-navy-950 p-6 shadow-panel"
            style={{ animation: "fadeInUp 0.25s ease-out" }}
          >
            <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-red-500/12 text-red-400">
              <IconAlert />
            </span>
            <h3 className="mb-1.5 text-[1.05rem] font-semibold text-cream">Delete program?</h3>
            <p className="mb-6 text-[0.86rem] leading-relaxed text-ink-soft">
              This will permanently remove{" "}
              <span className="font-medium text-cream">{pendingDelete.name}</span> and it will no
              longer appear anywhere in the enrollment flow. This can&apos;t be undone.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setPendingDelete(null)}
                disabled={deleting}
                className="flex-1 rounded-xl border border-gold-600/20 py-2.5 text-[0.86rem] font-medium text-ink-soft transition-colors duration-200 hover:bg-white/5 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleting}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-500 py-2.5 text-[0.86rem] font-semibold text-white transition-colors duration-200 hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {deleting ? (
                  <>
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Deleting...
                  </>
                ) : (
                  "Delete program"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast} />}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}