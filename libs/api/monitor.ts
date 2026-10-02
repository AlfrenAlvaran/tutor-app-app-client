const BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

export type AttendanceStatus = "pending" | "present" | "absent" | "late";

export interface TutorStats {
  tutorId: string;
  name: string;
  email: string;
  profession: string;
  totalRecords: number;
  present: number;
  late: number;
  absent: number;
  pending: number;
  todayRecords: number;
  todayPresent: number;
  studentCount: number;
  lastActivity: string | null;
  attendanceRate: number;
}

export interface TutorRecord {
  _id: string;
  date: string;
  status: AttendanceStatus;
  checkInTime: string | null;
  checkOutTime: string | null;
  notes?: string;
  student: { _id: string; name: string; email?: string } | null;
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { credentials: "include" });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.success === false) {
    throw new Error(json.message ?? `Request failed (${res.status})`);
  }
  return json as T;
}

export const getTutorStats = (params?: { from?: string; to?: string }) => {
  const qs = new URLSearchParams();
  if (params?.from) qs.set("from", params.from);
  if (params?.to) qs.set("to", params.to);
  const q = qs.toString();
  return get<{ data: TutorStats[] }>(`/tutors/monitor/tutors${q ? `?${q}` : ""}`);
};

export const getTutorRecords = (tutorId: string) =>
  get<{ data: TutorRecord[] }>(`/monitor/tutors/${tutorId}`);