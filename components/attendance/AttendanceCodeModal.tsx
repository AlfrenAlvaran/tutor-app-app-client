"use client";

import { useEffect } from "react";
import { formatCountdown } from "@/hooks/useAttendanceCode";
import type {
  AttendanceAssignmentOption,
  AttendanceCode,
} from "@/libs/clients/attendanceClient"; // adjust to your actual path

export default function AttendanceCodeModal({
  studentName,
  code,
  loading,
  error,
  secondsLeft,
  assignmentOptions,
  onClose,
  onRetry,
  onPickAssignment,
}: {
  studentName: string;
  code: AttendanceCode | null;
  loading: boolean;
  error: string;
  secondsLeft: number;
  assignmentOptions: AttendanceAssignmentOption[] | null;
  onClose: () => void;
  onRetry: () => void;
  onPickAssignment: (assignmentId: string) => void;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const expiringSoon = secondsLeft > 0 && secondsLeft < 30 * 60;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/70 px-5 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="attendance-modal-heading"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-sm rounded-2xl border border-navy-line bg-navy-900 p-7 shadow-panel">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-script text-sm text-gold-400/90">
              Check-in pass
            </p>
            <h2
              id="attendance-modal-heading"
              className="mt-0.5 font-display text-xl font-semibold text-cream"
            >
              {studentName}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1 text-ink-faint transition-colors hover:bg-navy-800 hover:text-cream"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-6">
          {!loading && assignmentOptions && assignmentOptions.length > 0 && (
            <div>
              <p className="text-sm text-ink-soft">
                {studentName.split(" ")[0]} has more than one tutor and
                isn&apos;t scheduled today. Who are they checking in with?
              </p>
              <div className="mt-4 flex flex-col gap-2">
                {assignmentOptions.map((option) => (
                  <button
                    key={option.assignmentId}
                    onClick={() => onPickAssignment(option.assignmentId)}
                    className="flex items-center justify-between rounded-lg border border-navy-line px-3.5 py-2.5 text-left text-sm text-cream transition-colors hover:border-gold-600/50 hover:bg-navy-800/50"
                  >
                    <span>
                      {option.scheduleDay || "No fixed day"}
                      {option.scheduleStartTime &&
                        ` · ${option.scheduleStartTime}`}
                    </span>
                    <ChevronIcon className="h-4 w-4 text-ink-faint" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {loading && !code && !assignmentOptions && (
            <div className="flex flex-col items-center gap-3 py-10">
              <span className="h-6 w-6 animate-spin rounded-full border-[2px] border-gold-500 border-t-transparent" />
              <p className="text-sm text-ink-soft">Generating code…</p>
            </div>
          )}

          {!loading && error && !code && !assignmentOptions && (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <AlertIcon className="h-6 w-6 text-red-400" />
              <p className="text-sm text-red-400">{error}</p>
              <button
                onClick={onRetry}
                className="mt-1 rounded-lg border border-navy-line px-3 py-1.5 text-xs font-medium text-ink-soft transition-colors hover:border-gold-600/50 hover:text-gold-400"
              >
                Try again
              </button>
            </div>
          )}

          {code && (
            <>
              <div className="mb-4 flex items-center justify-between rounded-lg bg-navy-800/60 px-3.5 py-2.5">
                <span className="text-xs text-ink-soft">Checking in with</span>
                <span className="text-sm font-medium text-cream">
                  {code.tutor.name}
                </span>
              </div>
              {code.schedule.day && (
                <p className="mb-4 text-center text-xs text-ink-faint">
                  Usually {code.schedule.day}
                  {code.schedule.startTime && `, ${code.schedule.startTime}`}
                  {code.schedule.endTime && ` – ${code.schedule.endTime}`}
                </p>
              )}

              <div className="flex items-center justify-center rounded-xl border border-navy-line bg-cream p-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={code.qrDataUrl}
                  alt={`QR check-in code for ${studentName}`}
                  className="h-44 w-44"
                />
              </div>

              <p className="mt-5 text-center text-[11px] uppercase tracking-wide text-ink-faint">
                Or enter this code
              </p>
              <p className="mt-1 text-center font-display text-2xl font-semibold tracking-wide text-cream">
                {code.refCode}
              </p>

              <div className="mt-5 flex items-center justify-between border-t border-navy-line pt-4">
                <span className="flex items-center gap-1.5 text-xs text-ink-soft">
                  <ClockIcon className="h-3.5 w-3.5" />
                  Expires at midnight
                </span>
                <span
                  className={`font-display text-sm font-semibold tabular-nums ${
                    expiringSoon ? "text-amber-400" : "text-gold-400"
                  }`}
                >
                  {formatCountdown(secondsLeft)}
                </span>
              </div>

              <p className="mt-4 text-center text-xs leading-relaxed text-ink-faint">
                Show this screen to {studentName.split(" ")[0]}, or let them
                scan it themselves at check-in.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function ChevronIcon(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="M9 18l6-6-6-6" />
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
function ClockIcon(props: React.SVGProps<SVGSVGElement>) {
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
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
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