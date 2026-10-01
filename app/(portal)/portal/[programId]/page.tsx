"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getPpts, type Ppt } from "@/libs/api/ppts";
import { generateAttendance, type AttendanceRecord } from "@/libs/api/attendance";
import { toDownloadUrl } from "@/utils/cloudinaryDownload";

function IconDownload() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 stroke-current"
    >
      <path d="M12 3v12M12 15 7 10M12 15l5-5" />
      <path d="M4 17v2.5A1.5 1.5 0 0 0 5.5 21h13a1.5 1.5 0 0 0 1.5-1.5V17" />
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

function IconHash() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 stroke-current"
    >
      <path d="M4 9h16M4 15h16M10 3 8 21M16 3l-2 18" />
    </svg>
  );
}

function IconCopy() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 stroke-current"
    >
      <rect x="9" y="9" width="12" height="12" rx="2" />
      <path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1" />
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

function IconX() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 stroke-current"
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

function RefNumberModal({
  record,
  reused,
  onClose,
}: {
  record: AttendanceRecord;
  reused: boolean;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(record.refCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard unavailable — silently ignore
    }
  };

  // Encode the richer qrPayload in the QR image; refCode stays the
  // short human-typeable fallback shown as text below it.
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=10&color=0e1c3a&bgcolor=ffffff&data=${encodeURIComponent(
    record.qrPayload,
  )}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm overflow-hidden rounded-2xl border border-gold-600/20 shadow-2xl"
        style={{ background: "linear-gradient(160deg, #0e1c3a, #060e24)" }}
      >
        <div className="flex items-start justify-between px-5 pt-5">
          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-gold-600/25 text-gold-400">
            <IconHash />
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1.5 text-ink-faint transition-colors hover:bg-white/5 hover:text-cream"
          >
            <IconX />
          </button>
        </div>

        <div className="px-5 pb-5 pt-3">
          <p className="text-[0.94rem] font-medium text-cream">
            {reused ? "Today's reference number" : "Reference number generated"}
          </p>
          <p className="mt-1 text-[0.8rem] text-ink-faint">
            {reused
              ? "You already generated a code today — show this one to your tutor."
              : "Show this to your tutor, or let them scan the QR code."}
          </p>

          {/* QR code */}
          <div className="mt-4 flex justify-center rounded-xl border border-gold-600/15 bg-white p-4">
            <img
              src={qrSrc}
              alt={`QR code for reference number ${record.refCode}`}
              width={180}
              height={180}
              className="h-[180px] w-[180px]"
            />
          </div>

          <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-gold-600/15 bg-white/3 px-4 py-3">
            <span className="truncate font-mono text-[0.9rem] tracking-wide text-gold-300">
              {record.refCode}
            </span>
            <button
              type="button"
              onClick={handleCopy}
              className="flex shrink-0 items-center gap-1.5 rounded-lg border border-gold-600/20 px-2.5 py-1.5 text-[0.76rem] font-medium text-ink-soft transition-colors hover:bg-white/5 hover:text-cream"
            >
              {copied ? <IconCheck /> : <IconCopy />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>

          <p className="mt-3 text-center text-[0.74rem] text-ink-faint">
            Status: <span className="capitalize text-ink-soft">{record.status}</span>
          </p>

          <button
            type="button"
            onClick={onClose}
            className="mt-5 w-full rounded-xl bg-gradient-to-b from-gold-400 to-gold-600 px-4 py-2.5 text-[0.85rem] font-semibold text-[#0e1c3a] transition-opacity hover:opacity-90"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

export default function StudentPptsPage() {
  // Route is /portal/[programId] — e.g. /portal/6a982688a16734299bd09ff4
  const params = useParams<{ programId: string }>();
  const programId = params.programId;

  const [ppts, setPpts] = useState<Ppt[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [attendance, setAttendance] = useState<AttendanceRecord | null>(null);
  const [attendanceReused, setAttendanceReused] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  const loadData = async () => {
    if (!programId) {
      // No programId param at all — most likely the route this component
      // is mounted at doesn't actually have a [programId] dynamic segment
      // matching what useParams() expects here. Surface it instead of
      // spinning forever.
      setLoading(false);
      setLoadError("Couldn't determine which program to load PPTs for.");
      return;
    }
    setLoading(true);
    setLoadError(null);
    try {
      // getPpts forwards programId as a query param -> GET /ppts?programId=...
      // The backend's listPpts already scopes this to the student's
      // enrolled (status: "completed") programs and 403s otherwise.
      const result = await getPpts(programId);
      setPpts(result);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [programId]);

  const handleGenerateRef = async () => {
    setGenerating(true);
    setGenerateError(null);
    try {
      const { record, reused } = await generateAttendance();
      setAttendance(record);
      setAttendanceReused(reused);
    } catch (err) {
      setGenerateError(
        err instanceof Error ? err.message : "Couldn't generate an attendance code.",
      );
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="mb-7">
          <h1 className="font-display text-[1.5rem] font-bold text-cream">
            Lesson PPTs
          </h1>
          <p className="mt-1 text-[0.88rem] text-ink-soft">
            {ppts.length} presentation{ppts.length === 1 ? "" : "s"} available.
          </p>
        </div>

        <div className="flex flex-col items-end gap-1.5">
          <button
            type="button"
            onClick={handleGenerateRef}
            disabled={generating}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-b from-gold-400 to-gold-600 px-4 py-2.5 text-[0.82rem] font-semibold text-[#0e1c3a] shadow-[0_4px_16px_-4px_rgba(212,175,55,0.4)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {generating ? (
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#0e1c3a]/30 border-t-[#0e1c3a]" />
            ) : (
              <IconHash />
            )}
            {generating ? "Generating…" : "Generate Ref Number"}
          </button>
          {generateError && (
            <p className="max-w-64 text-right text-[0.76rem] text-red-400">{generateError}</p>
          )}
        </div>
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
              Your tutor hasn&apos;t added any presentations for this program.
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
                    <span className="rounded-full border border-white/10 bg-white/3 px-2 py-0.5 text-[0.72rem] text-ink-soft">
                      {ppt.lesson}
                    </span>
                  </div>
                  {ppt.description && (
                    <p className="mt-1 text-[0.8rem] text-ink-faint">
                      {ppt.description}
                    </p>
                  )}
                </div>
                {ppt.fileUrl && (
                  <a
                    href={toDownloadUrl(ppt.fileUrl, ppt.fileName)}
                    aria-label={`Download ${ppt.title}`}
                    className="flex shrink-0 items-center gap-1.5 rounded-lg border border-gold-600/20 px-2.5 py-1.5 text-[0.76rem] font-medium text-ink-soft transition-colors hover:bg-white/5 hover:text-cream"
                  >
                    <IconDownload />
                    Download
                  </a>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {attendance && (
        <RefNumberModal
          record={attendance}
          reused={attendanceReused}
          onClose={() => setAttendance(null)}
        />
      )}
    </div>
  );
}