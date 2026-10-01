import axios from "axios";
import { api } from "../clients";

export type AttendanceStatus = "pending" | "present" | "absent" | "late";

export interface AttendanceRecord {
  _id: string;
  student: string;
  tutor: string;
  assignment: string | null;
  date: string;
  refCode: string;
  qrPayload: string;
  status: AttendanceStatus;
  checkInTime: string | null;
  checkOutTime: string | null;
  expiresAt: string;
  notes: string;
}

interface AttendanceEnvelope {
  success: boolean;
  data?: AttendanceRecord;
  reused?: boolean;
  message?: string;
}

function extractErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    return (error.response?.data as { message?: string } | undefined)?.message || fallback;
  }
  return fallback;
}

/**
 * STUDENT: generate (or reuse) today's ref code / QR payload.
 * No body params needed — the backend derives the student from the auth
 * token and the tutor from the student's own assignedTutor.
 */
export async function generateAttendance(): Promise<{ record: AttendanceRecord; reused: boolean }> {
  try {
    const response = await api.post<AttendanceEnvelope>("/participation/generate", {});

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || "Couldn't generate an attendance code.");
    }

    return { record: response.data.data, reused: Boolean(response.data.reused) };
  } catch (error) {
    throw new Error(extractErrorMessage(error, "Couldn't generate an attendance code. Please try again."));
  }
}

/**
 * TEACHER: scan or type a student's refCode to check them in for today.
 */
export async function checkInByRefCode(refCode: string): Promise<AttendanceRecord> {
  try {
    const response = await api.post<AttendanceEnvelope>("/participation/check-in", { refCode });

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || "Couldn't check in with that code.");
    }

    return response.data.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, "Couldn't check in with that code."));
  }
}

/**
 * TEACHER: mark checkout for an already checked-in student.
 */
export async function checkOutByRefCode(refCode: string): Promise<AttendanceRecord> {
  try {
    const response = await api.post<AttendanceEnvelope>("/participation/check-out", { refCode });

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || "Couldn't check out with that code.");
    }

    return response.data.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, "Couldn't check out with that code."));
  }
}