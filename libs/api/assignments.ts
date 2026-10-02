const ROOT = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
const API_BASE = `${ROOT}`;

export type AssignmentFilter = "all" | "unassigned" | "assigned" | "completed";

export const SCHEDULE_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

export type ScheduleDay = (typeof SCHEDULE_DAYS)[number] | "";

export type Tutor = {
  id: string;
  name: string;
  subject?: string;
};

export type AssignableStudent = {
  id: string;
  name: string;
  email: string;
  program: string;
  mode: string;
  schedulePreference: string;
  scheduleDay: string;
  scheduleStartTime: string;
  scheduleEndTime: string;
  sessionFinished: boolean;
  assignedTutor: { id: string; name: string } | null;
};

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  message?: string;
};

type RawStudent = {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  program?: string | { _id: string; name: string };
  mode: string;
  schedulePreference?: string;
  scheduleDay?: string;
  scheduleStartTime?: string;
  scheduleEndTime?: string;
  sessionFinished?: boolean;
  assignedTutor?: string | { _id: string; name: string } | null;
};

type RawTutor = {
  _id?: string;
  id?: string;
  name: string;
  subject?: string;
};

type RawAssignment = {
  _id: string;
  student_id: string | { _id: string };
  teacher_id: string | { _id: string; name: string };
};

type AssignPayload = {
  tutorId: string;
  scheduleDay?: ScheduleDay;
  scheduleStartTime?: string;
  scheduleEndTime?: string;
};

async function apiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<ApiEnvelope<T>> {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  // Read as text first: DELETE (and 204 responses) often have an empty body.
  const text = await res.text().catch(() => "");
  let body: ApiEnvelope<T> | null = null;
  if (text) {
    try {
      body = JSON.parse(text) as ApiEnvelope<T>;
    } catch {
      body = null;
    }
  }

  if (!res.ok) {
    console.error(
      `[assignments api] ${init?.method ?? "GET"} ${API_BASE}${path} -> ${res.status}`,
      body ?? text,
    );
    throw new Error(
      body?.message || `Request to ${path} failed with status ${res.status}`,
    );
  }

  // Successful response with no JSON body (e.g. 204 No Content)
  if (!body) {
    return { success: true, data: null as T };
  }

  return body;
}

function buildQuery(params: Record<string, string | number | undefined>) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") search.set(key, String(value));
  });
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

function programName(program: RawStudent["program"]) {
  if (!program) return "";
  return typeof program === "string" ? program : program.name;
}

function mapTutorRef(
  ref: RawStudent["assignedTutor"],
): AssignableStudent["assignedTutor"] {
  if (!ref) return null;
  if (typeof ref === "string") return { id: ref, name: "" };
  return { id: ref._id, name: ref.name };
}

function mapStudent(raw: RawStudent): AssignableStudent {
  const id = raw._id ?? raw.id;
  if (!id) {
    console.error(
      "[assignments] student record is missing both _id and id:",
      raw,
    );
  }
  return {
    id: id ?? "",
    name: raw.name,
    email: raw.email,
    program: programName(raw.program),
    mode: raw.mode,
    schedulePreference: raw.schedulePreference ?? "",
    scheduleDay: raw.scheduleDay ?? "",
    scheduleStartTime: raw.scheduleStartTime ?? "",
    scheduleEndTime: raw.scheduleEndTime ?? "",
    sessionFinished: Boolean(raw.sessionFinished),
    assignedTutor: mapTutorRef(raw.assignedTutor),
  };
}

function mapTutor(raw: RawTutor): Tutor {
  const id = raw._id ?? raw.id;
  if (!id) {
    console.error(
      "[assignments] tutor record is missing both _id and id:",
      raw,
    );
  }
  return { id: id ?? "", name: raw.name, subject: raw.subject };
}

export async function getAssignableStudents(params: {
  filter?: AssignmentFilter;
  search?: string;
  limit?: number;
}): Promise<{ data: AssignableStudent[] }> {
  const query = buildQuery({
    search: params.search,
    limit: params.limit,
  });
  const res = await apiFetch<RawStudent[]>(
    `/assign-students/assignable${query}`,
  );

  if (!Array.isArray(res.data)) {
    console.error(
      "[assignments] /assign-students/assignable returned an unexpected shape:",
      res,
    );
    throw new Error(
      "Students: the server response didn't include the expected student list",
    );
  }

  let students = res.data.map(mapStudent);

  if (params.filter === "unassigned") {
    students = students.filter((s) => !s.assignedTutor && !s.sessionFinished);
  } else if (params.filter === "assigned") {
    students = students.filter((s) => s.assignedTutor && !s.sessionFinished);
  } else if (params.filter === "completed") {
    students = students.filter((s) => s.sessionFinished);
  }

  return { data: students };
}

export async function getTutors(): Promise<{ data: Tutor[] }> {
  const res = await apiFetch<RawTutor[]>("/tutors");
  return { data: (res.data ?? []).map(mapTutor) };
}

async function findAssignmentIdForStudent(
  studentId: string,
): Promise<string | null> {
  const res = await apiFetch<RawAssignment[]>(
    `/assign-students/student/${studentId}`,
  );
  const [assignment] = res.data ?? [];
  return assignment ? assignment._id : null;
}

export async function assignTutor(
  studentId: string,
  payload: AssignPayload,
): Promise<void> {
  await apiFetch<RawAssignment>("/assign-students", {
    method: "POST",
    body: JSON.stringify({
      student_id: studentId,
      teacher_id: payload.tutorId,
      scheduleDay: payload.scheduleDay,
      scheduleStartTime: payload.scheduleStartTime,
      scheduleEndTime: payload.scheduleEndTime,
    }),
  });
}

export async function reassignTutor(
  studentId: string,
  payload: AssignPayload,
): Promise<void> {
  const assignmentId = await findAssignmentIdForStudent(studentId);
  if (!assignmentId) {
    return assignTutor(studentId, payload);
  }
  await apiFetch<RawAssignment>(`/assign-students/${assignmentId}`, {
    method: "PATCH",
    body: JSON.stringify({
      teacher_id: payload.tutorId,
      scheduleDay: payload.scheduleDay,
      scheduleStartTime: payload.scheduleStartTime,
      scheduleEndTime: payload.scheduleEndTime,
    }),
  });
}

export async function unassignTutor(studentId: string): Promise<void> {
  const assignmentId = await findAssignmentIdForStudent(studentId);
  if (assignmentId) {
    await apiFetch<unknown>(`/assign-students/${assignmentId}`, {
      method: "DELETE",
    });
  }
}