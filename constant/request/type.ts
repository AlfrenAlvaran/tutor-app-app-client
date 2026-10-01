import { PublicUser, SignInFailure, SignInSuccess } from "./interface";

export type EnrollPayload = {
  name: string;
  phone: string;
  email: string;
  age?: string;
  program: string;
  mode: string;
  message?: string;
  website?: string;
};

export type EnrollResponse =
  | { ok: true }
  | { ok: false; error: string; details?: Record<string, string[]> };

export type ProgramMode = "Online" | "Onsite" | "Hybrid";

export type Program = {
  id: string;
  label: string;
  category: string;
  mode: ProgramMode;
  price: number;
  duration: string;
  durationInDays: number;
  description: string;
  active: boolean;
};

export type ProgramsResponse =
  { ok: true; programs: Program[] } | { ok: false; error: string };

export type ProgramResponse =
  { ok: true; program: Program } | { ok: false; error: string };

export type DeleteProgramResponse =
  { ok: true; message: string } | { ok: false; error: string };

export type SignInResponse =
  | { ok: true; otpRequired: true; otpToken: string; message: string }
  | { ok: true; otpRequired?: false; user: PublicUser }
  | { ok: false; error: string };

export type VerifyOtpResponse =
  { ok: true; user: PublicUser } | { ok: false; error: string };
export type ResendOtpResponse =
  | { ok: true; otpToken: string; message: string }
  | { ok: false; error: string };

export type CreateProgramPayload = {
  label: string;
  category: string;
  mode: ProgramMode;
  price: number;
  duration: string;
  description: string;
  active?: boolean;
};

export type UpdateProgramPayload = Partial<CreateProgramPayload>;

export type StudentStatus = "pending" | "completed";

export type Student = {
  id: string;
  token: string;
  name: string;
  program: { id: string; label: string } | string;
  mode: string;
  status: StudentStatus;
  completedAt: string | null;
  birthdate: string | null;
  address: string;
  guardianName: string;
  guardianContact: string;
  schedulePreference: string;
  attendingSchool: string;
  currentSchool: string;
  notes: string;
  sessionFinished: boolean;
  sessionFinishedAt: string | null;
};

// -- Response envelopes, matching ProgramsResponse / ProgramResponse -------
export type StudentsResponse =
  { ok: true; students: Student[] } | { ok: false; error: string };

export type StudentResponse =
  { ok: true; student: Student } | { ok: false; error: string };

export type DeleteStudentResponse = { ok: true } | { ok: false; error: string };

// -- Request payloads --------------------------------------------------------
export type IssueEnrollmentPayload = {
  name: string;
  program: string;
  mode: string;
};

export type UpdateStudentPayload = Partial<{
  name: string;
  program: string;
  mode: string;
  birthdate: string;
  address: string;
  guardianName: string;
  guardianContact: string;
  schedulePreference: string;
  attendingSchool: string;
  currentSchool: string;
  notes: string;
}>;

export type MarkSessionFinishedPayload = {
  sessionFinished: boolean;
  sessionFinishedAt?: string;
};

export type Tutor = {
  id: string;
  name: string;
  email: string;
  profession: string;
  bio: string;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateTutorPayload = {
  name: string;
  email: string;
  profession: string;
  bio: string;
};

export type UpdateTutorPayload = Partial<CreateTutorPayload>;

export type ScheduleDay =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

export const SCHEDULE_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

export type ScheduleDays = (typeof SCHEDULE_DAYS)[number];

export type ScheduleSlot = {
  _id: string;
  day: ScheduleDay;
  startTime: string; // "15:00"
  endTime: string; // "16:00"
};

export type AssignmentStudent = {
  _id: string;
  name: string;
  program?: string;
};

export type AssignmentTutor = {
  _id: string;
  name: string;
  subject?: string;
};

export type Assignment = {
  _id: string;
  student: AssignmentStudent;
  tutor: AssignmentTutor;
  subject: string;
  status: "active" | "paused";
  schedule: ScheduleSlot[];
  createdAt?: string;
  updatedAt?: string;
};

export type AssignmentStats = {
  total: number;
  active: number;
  tutorsInUse: number;
  weeklyHours: number;
};

export type CreateAssignmentPayload = {
  studentId: string;
  tutorId: string;
  subject: string;
  status?: "active" | "paused";
  schedule: { day: ScheduleDay; startTime: string; endTime: string }[];
};

export type AssignmentsResponse =
  { ok: true; assignments: Assignment[] } | { ok: false; error: string };

export type AssignmentResponse =
  { ok: true; assignment: Assignment } | { ok: false; error: string };

export type AssignmentStatsResponse =
  { ok: true; stats: AssignmentStats } | { ok: false; error: string };

export type DeleteAssignmentResponse =
  { ok: true } | { ok: false; error: string };

export type IssueAssignmentPayload = {
  studentId: string;
  tutorId: string;
  subject: string;
  status?: "active" | "paused";
  schedule: Array<{ day: ScheduleDay; startTime: string; endTime: string }>;
};

// export type UpdateAssignmentPayload = Partial<IssueAssignmentPayload>;
export type UpdateAssignmentPayload = Partial<CreateAssignmentPayload>;
export type ToggleAssignmentStatusPayload = {
  status?: "active" | "paused";
};

// Add to @/constant/request/type.ts

export type EnrollmentMode = "Online" | "In-person" | "Hybrid";

export type EnrollmentStatus = "pending" | "completed";

export type SchedulePreference =
  "morning" | "afternoon" | "evening" | "weekend" | "";

export type AttendingSchoolOption = "yes" | "no" | "";

// program comes back populated as { id, label } from the backend
// (see toPlainStudent in Studentservice.js)
export interface EnrollmentProgramRef {
  id: string;
  label: string;
}

export interface Enrollment {
  id: string;
  token: string;
  name: string;
  email: string;
  program: EnrollmentProgramRef;
  mode: EnrollmentMode;
  status: EnrollmentStatus;
  completedAt: string | null;
  birthdate: string | null;
  address: string;
  guardianName: string;
  guardianContact: string;
  schedulePreference: SchedulePreference;
  attendingSchool: AttendingSchoolOption;
  currentSchool: string;
  notes: string;
  sessionFinished: boolean;
  sessionFinishedAt: string | null;
}

// Add to @/constant/request/interface.ts

export interface MyEnrollmentsResponse {
  ok: boolean;
  enrollments: Enrollment[];
  error?: string;
}

// Add these to @/constant/request/type (alongside the existing Tutor type).

export type AttendanceStatus = "pending" | "present" | "absent" | "late";

/** Response shape from POST /api/attendance/generate */
export interface AttendanceCode {
  attendanceId: string;
  refCode: string; // e.g. "7F3K-9QZP"
  qrDataUrl: string; // base64 PNG data URL, ready for an <img src>
  status: AttendanceStatus;
  expiresAt: string; // ISO string, end of the day it was generated
  tutor: { id: string; name: string };
  schedule: {
    day: string;
    startTime: string;
    endTime: string;
  };
}

/** 409 response from POST /api/attendance/generate when an assignment
 *  can't be picked automatically. */
export interface AttendanceAssignmentOption {
  assignmentId: string;
  teacherId: string;
  scheduleDay: string;
  scheduleStartTime: string;
  scheduleEndTime: string;
}

/** One row from GET /api/attendance/roster/:tutorId */
export interface TutorRosterEntry {
  assignmentId: string;
  student: { _id: string; name: string; email: string };
  scheduleDay: string;
  scheduleStartTime: string;
  scheduleEndTime: string;
  scheduledToday: boolean;
  attendance: AttendanceRecord | null;
}

/** One row from GET /api/attendance/day */
export interface AttendanceRecord {
  _id: string;
  student: string; // student id
  tutor: string;
  status: AttendanceStatus;
  refCode: string;
  checkInTime: string | null;
  checkOutTime: string | null;
  expiresAt: string;
}
