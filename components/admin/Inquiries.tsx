"use client";

import {
  Inquiry,
  InquiryStatus,
  getInquiries,
  updateInquiryStatus,
} from "@/libs/api/inquiries";
import { useEffect, useMemo, useState } from "react";
// import {
//   Inquiry,
//   InquiryStatus,
//   getInquiries,
//   updateInquiryStatus,
// } from "@/lib/api/";

/**
 * Admin > Inquiries. Drops into the same AdminLayout as the Programs page
 * (Sidebar + Topbar wrap this in a `p-6` <main>). Talks to the real
 * backend — GET /inquiries and PATCH /inquiries/:id/status.
 *
 * Moving a row to "enrolled" mints + emails a one-time link the applicant
 * uses to fill out the rest of their enrollment. Because that fires an
 * actual email, the UI confirms before sending, and reflects the result
 * (sent / failed / already completed) rather than assuming success.
 */

const STATUS_ORDER: InquiryStatus[] = [
  "new",
  "contacted",
  "enrolled",
  "closed",
];

const STATUS_LABEL: Record<InquiryStatus, string> = {
  new: "New",
  contacted: "Contacted",
  enrolled: "Confirmed",
  closed: "Closed",
};

const STATUS_STYLE: Record<InquiryStatus, string> = {
  new: "border-white/15 text-ink-soft bg-white/3",
  contacted: "border-gold-600/25 text-gold-300 bg-gold-600/8",
  enrolled:
    "border-transparent text-[#1a1204] bg-linear-to-br from-gold-400 via-gold-600 to-gold-deep",
  closed: "border-white/10 text-ink-faint bg-white/2",
};

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
function IconMail() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5 stroke-current"
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3.5 6 8.5 7 8.5-7" />
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

function EmailStatusChip({ inquiry }: { inquiry: Inquiry }) {
  if (inquiry.formCompleted) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-gold-600/25 bg-gold-600/8 px-2.5 py-1 text-[0.72rem] font-medium text-gold-300">
        <IconCheck /> Form completed
      </span>
    );
  }
  if (inquiry.status === "enrolled" && inquiry.emailSent) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/3 px-2.5 py-1 text-[0.72rem] font-medium text-ink-soft">
        <IconMail /> Link sent
      </span>
    );
  }
  if (inquiry.status === "enrolled" && inquiry.emailError) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/25 bg-red-500/10 px-2.5 py-1 text-[0.72rem] font-medium text-red-400">
        Send failed
      </span>
    );
  }
  return <span className="text-[0.72rem] text-ink-faint">—</span>;
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

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | InquiryStatus>("all");

  const [pendingConfirm, setPendingConfirm] = useState<Inquiry | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const [toast, setToast] = useState<{
    message: string;
    tone: "gold" | "red";
  } | null>(null);
  const showToast = (message: string, tone: "gold" | "red" = "gold") => {
    setToast({ message, tone });
    setTimeout(() => setToast(null), 2800);
  };

  const loadInquiries = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await getInquiries({
        status: filter === "all" ? undefined : filter,
        search: query || undefined,
        limit: 50,
      });
      setInquiries(res.data);
    } catch (err) {
      setLoadError("Couldn't load inquiries. Please try refreshing.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(loadInquiries, 250); // light debounce for search
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, query]);

  const counts = useMemo(() => {
    const base: Record<"all" | InquiryStatus, number> = {
      all: inquiries.length,
      new: 0,
      contacted: 0,
      enrolled: 0,
      closed: 0,
    };
    inquiries.forEach((i) => {
      base[i.status] += 1;
    });
    return base;
  }, [inquiries]);

  const applyStatusChange = async (inquiry: Inquiry, status: InquiryStatus) => {
    setUpdatingId(inquiry.id);
    try {
      const res = await updateInquiryStatus(inquiry.id, status);
      setInquiries((prev) =>
        prev.map((i) => (i.id === inquiry.id ? res.data : i)),
      );
      if (res.enrollmentLinkSent) {
        showToast(`Enrollment link emailed to ${inquiry.email}.`);
      } else if (
        status === "enrolled" &&
        !res.data.emailSent &&
        res.data.emailError
      ) {
        showToast(`Status updated, but the email failed to send.`, "red");
      } else {
        showToast(
          `${inquiry.name} marked as ${STATUS_LABEL[status].toLowerCase()}.`,
        );
      }
    } catch (err) {
      showToast("Couldn't update status. Please try again.", "red");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleStatusSelect = (inquiry: Inquiry, status: InquiryStatus) => {
    if (status === inquiry.status) return;
    // Confirming sends a real email, so gate it behind an explicit step.
    if (status === "enrolled") {
      setPendingConfirm(inquiry);
      return;
    }
    applyStatusChange(inquiry, status);
  };

  const confirmEnroll = async () => {
    if (!pendingConfirm) return;
    setConfirming(true);
    await applyStatusChange(pendingConfirm, "enrolled");
    setConfirming(false);
    setPendingConfirm(null);
  };

  return (
    <div>
      <div className="mb-7">
        <h1 className="font-display text-[1.5rem] font-bold text-cream">
          Inquiries
        </h1>
        <p className="mt-1 text-[0.88rem] text-ink-soft">
          Review enrollment inquiries and confirm applicants to send them their
          enrollment form.
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
            placeholder="Search name, email, phone..."
            className="w-full rounded-xl border border-gold-600/20 bg-white/3 py-2.5 pl-10 pr-3.5 text-[0.86rem] text-cream outline-none transition-colors duration-200 placeholder:text-ink-faint focus:border-gold-500 focus:bg-gold-600/5"
          />
        </div>

        <div className="flex flex-wrap gap-1.5 rounded-xl border border-gold-600/15 bg-white/2 p-1">
          {(["all", ...STATUS_ORDER] as const).map((key) => (
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
              {key === "all" ? "All" : STATUS_LABEL[key]}{" "}
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
              Loading inquiries…
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
              onClick={loadInquiries}
              className="mt-4 rounded-xl border border-gold-600/20 px-4 py-2 text-[0.82rem] font-medium text-ink-soft transition-colors hover:bg-white/5"
            >
              Try again
            </button>
          </div>
        ) : inquiries.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-160 border-collapse text-left">
              <thead>
                <tr className="border-b border-gold-600/12 text-[0.72rem] font-semibold uppercase tracking-[0.06em] text-ink-faint">
                  <th className="px-5 py-3.5">Applicant</th>
                  <th className="px-5 py-3.5">Program</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Enrollment email</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gold-600/8">
                {inquiries.map((inquiry) => (
                  <tr
                    key={inquiry.id}
                    className="transition-colors duration-150 hover:bg-white/2"
                  >
                    <td className="px-5 py-4">
                      <p className="text-[0.9rem] font-medium text-cream">
                        {inquiry.name}
                      </p>
                      <p className="mt-0.5 text-[0.78rem] text-ink-faint">
                        {inquiry.email} &middot; {inquiry.phone}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-[0.86rem] text-ink-soft">
                        {inquiry.program}
                      </p>
                      <p className="mt-0.5 text-[0.76rem] text-ink-faint">
                        {inquiry.mode}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <div className="relative inline-block">
                        <select
                          value={inquiry.status}
                          disabled={updatingId === inquiry.id}
                          onChange={(e) =>
                            handleStatusSelect(
                              inquiry,
                              e.target.value as InquiryStatus,
                            )
                          }
                          className={`appearance-none rounded-full border px-3.5 py-1.5 pr-7 text-[0.78rem] font-medium capitalize outline-none transition-opacity duration-150 disabled:opacity-50 ${STATUS_STYLE[inquiry.status]}`}
                        >
                          {STATUS_ORDER.map((s) => (
                            <option
                              key={s}
                              value={s}
                              className="bg-navy-950 text-cream"
                            >
                              {STATUS_LABEL[s]}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <EmailStatusChip inquiry={inquiry} />
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
              No inquiries found
            </p>
            <p className="mt-1 text-[0.82rem] text-ink-faint">
              Try a different search term or filter.
            </p>
          </div>
        )}
      </div>

      {/* Confirm-and-send modal */}
      {pendingConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
          <div
            className="absolute inset-0 bg-black/55"
            style={{ animation: "fadeIn 0.2s ease-out" }}
            onClick={() => !confirming && setPendingConfirm(null)}
          />
          <div
            className="relative w-full max-w-96 rounded-2xl border border-gold-600/20 bg-navy-950 p-6 shadow-panel"
            style={{ animation: "fadeInUp 0.25s ease-out" }}
          >
            <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-linear-to-br from-gold-400 via-gold-600 to-gold-deep text-[#1a1204]">
              <IconMail />
            </span>
            <h3 className="mb-1.5 text-[1.05rem] font-semibold text-cream">
              Confirm & email enrollment link?
            </h3>
            <p className="mb-6 text-[0.86rem] leading-relaxed text-ink-soft">
              <span className="font-medium text-cream">
                {pendingConfirm.name}
              </span>{" "}
              will be marked as confirmed and immediately emailed a link to
              complete their enrollment details.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setPendingConfirm(null)}
                disabled={confirming}
                className="flex-1 rounded-xl border border-gold-600/20 py-2.5 text-[0.86rem] font-medium text-ink-soft transition-colors duration-200 hover:bg-white/5 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmEnroll}
                disabled={confirming}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-linear-to-br from-gold-400 via-gold-600 to-gold-deep py-2.5 text-[0.86rem] font-semibold text-[#1a1204] shadow-gold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {confirming ? (
                  <>
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#1a1204]/30 border-t-[#1a1204]" />
                    Sending...
                  </>
                ) : (
                  "Confirm & send link"
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
