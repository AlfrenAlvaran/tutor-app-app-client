"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  fetchTodayAttendance,
  fetchCheckInQr,
  fetchCheckOutQr,
  type AttendanceQr,
  type AttendanceStatus,
} from "@/libs/api/attendance";
import { ApiError } from "@/libs/api/errors";

const POLL_MS = 3000;

/** Polls today's attendance status for a student so the kiosk screen can react
 *  the moment a tutor scans them in or out. */
export function useTodayAttendance(studentId: string) {
  const [status, setStatus] = useState<AttendanceStatus>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    try {
      const data = await fetchTodayAttendance(studentId);
      setStatus(data.status);
      setError("");
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        // No check-in yet today — expected, not an error.
        setStatus(null);
        setError("");
      } else {
        setError(err instanceof Error ? err.message : "Unable to load attendance.");
      }
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    if (!studentId) return;
    refresh();
    const id = setInterval(refresh, POLL_MS);
    return () => clearInterval(id);
  }, [studentId, refresh]);

  return { status, loading, error, refresh };
}

/**
 * Fetches the right QR (check-in or check-out) for the student's current
 * status, and refetches automatically once the code expires.
 */
export function useAttendanceQr(studentId: string, status: AttendanceStatus) {
  const [qr, setQr] = useState<AttendanceQr | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(async () => {
    if (!studentId || status === "completed") return;
    setLoading(true);
    try {
      const data =
        status === "checked_in"
          ? await fetchCheckOutQr(studentId)
          : await fetchCheckInQr(studentId);
      setQr(data);
      setError("");

      const msUntilExpiry = new Date(data.expiresAt).getTime() - Date.now();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(load, Math.max(msUntilExpiry, 1000));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to generate QR code.");
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