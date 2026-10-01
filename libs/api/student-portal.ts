import { api } from "../clients";


export type StudentProgram = {
  id: string;
  label: string;
};

export type EnrollmentTutor = {
  id: string;
  name: string;
  profession?: string;
};

export type StudentEnrollment = {
  id: string;
  name: string;
  email: string;
  program: StudentProgram;
  mode: string;
  schedulePreference?: string;
  scheduleDay?: string;
  scheduleStartTime?: string;
  scheduleEndTime?: string;
  sessionFinished: boolean;
  sessionFinishedAt: string | null;
  status: string;
  tutor: EnrollmentTutor | null;
};

export type StudentPortalResponse = {
  data: StudentEnrollment[];
};

export async function getMyEnrollments(): Promise<StudentPortalResponse> {
  const response = await api.get("/students/my-enrolled-program", {
    withCredentials: true,
  });

  const body = response.data;

  if (!body?.ok || !Array.isArray(body.enrollments)) {
    console.error(
      "[student-portal] /students/my-enrolled-program returned an unexpected shape:",
      body,
    );
    throw new Error("Couldn't load your programs. Please try again.");
  }

  return { data: body.enrollments };
}