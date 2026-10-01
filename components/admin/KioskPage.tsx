"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useAttendanceQr, useTodayAttendance } from "@/hooks/useAttendance";

function useCountdown(expiresAt?: string) {
  const [msLeft, setMsLeft] = useState(0);

  useEffect(() => {
    if (!expiresAt) return;
    const tick = () => setMsLeft(Math.max(new Date(expiresAt).getTime() - Date.now(), 0));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  const totalSeconds = Math.floor(msLeft / 1000);
  const mm = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const ss = String(totalSeconds % 60).padStart(2, "0");
  return { label: `${mm}:${ss}`, expired: msLeft <= 0 };
}

export default function AttendanceKioskPage() {
  const params = useParams<{ studentId: string }>();
  const studentId = params.studentId;

  const { status, loading: statusLoading, error: statusError } = useTodayAttendance(studentId);
  const { qr, loading: qrLoading, error: qrError } = useAttendanceQr(studentId, status);
  const countdown = useCountdown(qr?.expiresAt);

  const stage = status === "checked_in" ? "check-out" : "check-in";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-navy-950 px-6 py-10 font-body text-cream">
      <p className="font-script text-lg text-gold-400/90">Tutoring · Attendance</p>

      {status === "completed" ? (
        <CompletedCard />
      ) : (
        <div className="mt-6 flex w-full max-w-sm flex-col items-center gap-6 rounded-2xl border border-navy-line bg-navy-900 p-8 shadow-panel">
          {qr?.display && (
            <div className="text-center">
              <h1 className="font-display text-2xl font-semibold text-cream">
                {qr.display.name}
              </h1>
              {qr.display.program && (
                <p className="mt-1 text-sm text-ink-soft">{qr.display.program}</p>
              )}
            </div>
          )}

          <span className="rounded-full bg-navy-800 px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-gold-400">
            {stage}
          </span>

          <div className="flex h-64 w-64 items-center justify-center rounded-xl bg-cream p-4">
            {qrLoading && !qr ? (
              <span className="h-8 w-8 animate-spin rounded-full border-2 border-navy-900 border-t-transparent" />
            ) : qr ? (
              <QRCodeSVG value={qr.qrToken} size={224} bgColor="transparent" fgColor="#0B1330" />
            ) : null}
          </div>

          <p className="text-xs uppercase tracking-wide text-ink-faint">
            {countdown.expired ? "Refreshing code…" : `Refreshes in ${countdown.label}`}
          </p>

          <p className="text-center text-sm text-ink-soft">
            Show this code to your tutor to {stage === "check-out" ? "check out" : "check in"}.
          </p>

          {(statusError || qrError) && (
            <p className="text-center text-xs text-red-400">{statusError || qrError}</p>
          )}
        </div>
      )}

      {statusLoading && <p className="mt-4 text-xs text-ink-faint">Loading…</p>}
    </div>
  );
}

function CompletedCard() {
  return (
    <div className="mt-6 flex w-full max-w-sm flex-col items-center gap-3 rounded-2xl border border-navy-line bg-navy-900 p-10 text-center shadow-panel">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-success/15 text-success">
        <CheckIcon className="h-7 w-7" />
      </span>
      <h1 className="font-display text-xl font-semibold text-cream">All set for today</h1>
      <p className="text-sm text-ink-soft">Your attendance is complete. See you next session!</p>
    </div>
  );
}

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}