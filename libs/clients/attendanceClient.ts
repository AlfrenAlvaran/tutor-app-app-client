const ROOT = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
const API_BASE = `${ROOT}`;

// Matches app.use("/v1/api/participation", participationRouter).
// If NEXT_PUBLIC_API_BASE_URL already includes this prefix, drop it here.
const BASE_PATH = "/v1/api/participation";

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  message?: string;
};

/**
 * Thrown by apiFetch on any non-2xx response. Carries the parsed body
 * (when present) so callers can inspect status-specific payloads —
 * e.g. the { assignments: [...] } data a 409 from /attendance/generate
 * comes back with.
 */
export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

export function apiErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) return error.message || fallback;
  return fallback;
}

async function apiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<ApiEnvelope<T>> {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
    ...init,
  });

  const body = (await res.json().catch(() => null)) as ApiEnvelope<T> | null;

  if (!res.ok || !body) {
    console.error(
      `[attendance api] ${init?.method ?? "GET"} ${API_BASE}${path} -> ${res.status}`,
      body,
    );
    throw new ApiError(
      body?.message || `Request to ${path} failed with status ${res.status}`,
      res.status,
      body,
    );
  }

  return body;
}

function buildQuery(params: Record<string, string | undefined>) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") search.set(key, value);
  });
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

// ---- Types ----

export type AttendanceStatus = "pending" | "present" | "absent" | "late";

export type AttendanceCode = {
  attendanceId: string;
  refCode: string;
  qrDataUrl: string;
  status: AttendanceStatus;
  expiresAt: string;
  tutor: { id: string; name: string };
  schedule: { day: string; startTime: string; endTime: string };
};

export type AttendanceAssignmentOption = {
  assignmentId: string;
  teacherId: string;
  scheduleDay: string;
  scheduleStartTime: string;
  scheduleEndTime: string;
};

export type AttendanceRecord = {
  _id: string;
  student: string;
  tutor: string;
  status: AttendanceStatus;
  refCode: string;
  checkInTime: string | null;
  checkOutTime: string | null;
  expiresAt: string;
};

export type TutorRosterEntry = {
  assignmentId: string;
  student: { _id: string; name: string; email: string };
  scheduleDay: string;
  scheduleStartTime: string;
  scheduleEndTime: string;
  scheduledToday: boolean;
  attendance: AttendanceRecord | null;
};

// ---- Endpoints ----

/**
 * Throws ApiError with status 409 when the student has more than one
 * assignment and none matches today — err.body.data.assignments holds
 * the options to present to the user.
 */
export async function generateAttendanceCode(payload: {
  studentId: string;
  assignmentId?: string;
}): Promise<AttendanceCode> {
  const res = await apiFetch<AttendanceCode>(`${BASE_PATH}/generate`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res.data;
}

export async function verifyAttendance(
  refCode: string,
): Promise<{ record: AttendanceRecord }> {
  const res = await apiFetch<{ record: AttendanceRecord }>(
    `${BASE_PATH}/verify`,
    { method: "POST", body: JSON.stringify({ refCode }) },
  );
  return res.data;
}

export async function checkOutAttendance(
  refCode: string,
): Promise<{ record: AttendanceRecord }> {
  const res = await apiFetch<{ record: AttendanceRecord }>(
    `${BASE_PATH}/checkout`,
    { method: "POST", body: JSON.stringify({ refCode }) },
  );
  return res.data;
}

export async function getAttendanceByStudent(
  studentId: string,
): Promise<AttendanceRecord[]> {
  const res = await apiFetch<{ records: AttendanceRecord[] }>(
    `${BASE_PATH}/student/${studentId}`,
  );
  return res.data.records;
}

export async function getAttendanceByDay(params: {
  date?: string;
  tutorId?: string;
}): Promise<AttendanceRecord[]> {
  const query = buildQuery({ date: params.date, tutorId: params.tutorId });
  const res = await apiFetch<{ records: AttendanceRecord[] }>(
    `${BASE_PATH}/day${query}`,
  );
  return res.data.records;
}

export async function getTutorRoster(
  tutorId: string,
): Promise<TutorRosterEntry[]> {
  const res = await apiFetch<{ roster: TutorRosterEntry[] }>(
    `${BASE_PATH}/roster/${tutorId}`,
  );
  return res.data.roster;
}

export async function getStudentAssignments(
  studentId: string,
): Promise<AttendanceAssignmentOption[]> {
  const res = await apiFetch<{ assignments: AttendanceAssignmentOption[] }>(
    `${BASE_PATH}/assignments/${studentId}`,
  );
  return res.data.assignments;
}

export async function updateAttendanceStatus(
  id: string,
  status: AttendanceStatus,
): Promise<{ record: AttendanceRecord }> {
  const res = await apiFetch<{ record: AttendanceRecord }>(
    `${BASE_PATH}/${id}/status`,
    { method: "PATCH", body: JSON.stringify({ status }) },
  );
  return res.data;
}