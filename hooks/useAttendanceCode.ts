"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ApiError,
  apiErrorMessage,
  generateAttendanceCode,
  type AttendanceAssignmentOption,
  type AttendanceCode,
} from "@/libs/clients/attendanceClient"; // adjust to your actual path

interface UseAttendanceCodeResult {
  code: AttendanceCode | null;
  loading: boolean;
  error: string;
  secondsLeft: number;
  /** Set when the student has multiple assignments and none matches
   *  today — the caller should let the user pick one, then call
   *  generate(studentId, chosenAssignmentId). */
  assignmentOptions: AttendanceAssignmentOption[] | null;
  generate: (studentId: string, assignmentId?: string) => Promise<void>;
  reset: () => void;
}

/**
 * Generates (or re-fetches) today's check-in code for a student and keeps
 * a live countdown to expiresAt. One call per student per day is enough —
 * the backend is idempotent, so re-calling generate() just returns the
 * same record until midnight.
 */
export function useAttendanceCode(): UseAttendanceCodeResult {
  const [code, setCode] = useState<AttendanceCode | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [assignmentOptions, setAssignmentOptions] = useState<
    AttendanceAssignmentOption[] | null
  >(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startCountdown = useCallback(
    (expiresAt: string) => {
      clearTimer();
      const tick = () => {
        const diff = Math.max(0, new Date(expiresAt).getTime() - Date.now());
        setSecondsLeft(Math.floor(diff / 1000));
      };
      tick();
      timerRef.current = setInterval(tick, 1000);
    },
    [clearTimer],
  );

  const generate = useCallback(
    async (studentId: string, assignmentId?: string) => {
      setLoading(true);
      setError("");
      setAssignmentOptions(null);
      try {
        const data = await generateAttendanceCode({ studentId, assignmentId });
        setCode(data);
        startCountdown(data.expiresAt);
      } catch (err) {
        if (err instanceof ApiError && err.status === 409) {
          const assignments = (
            err.body as { data?: { assignments?: AttendanceAssignmentOption[] } }
          )?.data?.assignments;
          if (assignments) {
            // Multiple assignments, none scheduled today — let the
            // caller present a picker and re-call generate() with a
            // choice.
            setAssignmentOptions(assignments);
            return;
          }
        }
        setError(apiErrorMessage(err, "Unable to generate a check-in code."));
      } finally {
        setLoading(false);
      }
    },
    [startCountdown],
  );

  const reset = useCallback(() => {
    clearTimer();
    setCode(null);
    setError("");
    setSecondsLeft(0);
    setAssignmentOptions(null);
  }, [clearTimer]);

  useEffect(() => clearTimer, [clearTimer]);

  return {
    code,
    loading,
    error,
    secondsLeft,
    assignmentOptions,
    generate,
    reset,
  };
}

export function formatCountdown(totalSeconds: number) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
}