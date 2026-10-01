import { ScheduleDay, Tutor } from "./assignments";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL

// Raw shape returned by GET /assign-students/teacher/:teacherId
// (AssignStudentModel with teacher_id fully populated and
// student_id populated with name/email/status/program.label)
type RawTeacherAssignment = {
  _id: string;
  scheduleDay?: string;
  scheduleStartTime?: string;
  scheduleEndTime?: string;
  createdAt?: string;
  teacher_id: Tutor & { _id: string };
  student_id: {
    _id: string;
    name: string;
    email: string;
    status: string;
    program?: { _id: string; label: string } | null;
  };
};

export type TeacherStudent = {
  assignmentId: string;
  id: string;
  name: string;
  email: string;
  status: string;
  program: string;
  programId: string;
  scheduleDay: ScheduleDay;
  scheduleStartTime: string;
  scheduleEndTime: string;
};

export type TeacherStudentsResult = {
  success: boolean;
  teacher: Tutor | null;
  students: TeacherStudent[];
};

export async function getStudentsByTeacher(
  teacherId: string,
): Promise<TeacherStudentsResult> {
  const res = await fetch(`${API_BASE}/assign-students/teacher/${teacherId}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch teacher's students (${res.status})`);
  }

  const json = await res.json();
  const raw: RawTeacherAssignment[] = json.data ?? [];

  const teacher = raw[0]?.teacher_id
    ? { ...raw[0].teacher_id, id: raw[0].teacher_id._id }
    : null;

  const students: TeacherStudent[] = raw
    .filter((a) => a.student_id)
    .map((a) => ({
      assignmentId: a._id,
      id: a.student_id._id,
      name: a.student_id.name,
      email: a.student_id.email,
      status: a.student_id.status,
      program: a.student_id.program?.label ?? "—",
      programId: a.student_id.program?._id ?? "",
      scheduleDay: (a.scheduleDay as ScheduleDay) ?? "",
      scheduleStartTime: a.scheduleStartTime ?? "",
      scheduleEndTime: a.scheduleEndTime ?? "",
    }));

  return { success: Boolean(json.success), teacher, students };
}