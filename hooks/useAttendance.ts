"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { generateAttendance, type AttendanceRecord } from "@/libs/api/attendance";

const POLL_MS = 3000;

export type AttendanceStatus = null | "checked_in" | "completed";

export interface AttendanceQr {
  refCode: string;
  qrPayload: string;
  expiresAt: string;
}

function deriveStatus(record: AttendanceRecord): AttendanceStatus {
  if (record.checkOutTime) return "completed";
  if (record.checkInTime) return "checked_in";
  return null;
}

/** Polls today's attendance so the screen reacts when the tutor scans in/out. */
export function useTodayAttendance(studentId: string) {
  const [status, setStatus] = useState<AttendanceStatus>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    try {
      const { record } = await generateAttendance(); // reuses today's record
      setStatus(deriveStatus(record));
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load attendance.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!studentId) {
      setLoading(false);
      return;
    }
    refresh();
    const id = setInterval(refresh, POLL_MS);
    return () => clearInterval(id);
  }, [studentId, refresh]);

  return { status, loading, error, refresh };
}

/** Fetches the student's QR (same refCode is used for check-in and check-out)
 *  and refetches automatically once it expires. */
export function useAttendanceQr(studentId: string, status: AttendanceStatus) {
  const [qr, setQr] = useState<AttendanceQr | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(async () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    if (!studentId || status === "completed") {
      setQr(null);
      setLoading(false);
      return;
    }

    try {
      const { record } = await generateAttendance();
      setQr({
        refCode: record.refCode,
        qrPayload: record.qrPayload,
        expiresAt: record.expiresAt,
      });
      setError("");

      const msUntilExpiry = new Date(record.expiresAt).getTime() - Date.now();
      timeoutRef.current = setTimeout(load, Math.max(msUntilExpiry, 1000));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to generate QR code.");
      timeoutRef.current = setTimeout(load, 5000); // retry on failure
    } finally {
      setLoading(false);
    }
  }, [studentId, status]);

  useEffect(() => {
    load();
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [load]);

  return { qr, loading, error, reload: load };
}