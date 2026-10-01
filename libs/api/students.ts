import {
  Student,
  StudentsResponse,
  IssueEnrollmentPayload,
  UpdateStudentPayload,
  MarkSessionFinishedPayload,
  StudentResponse,
  DeleteStudentResponse,
} from "@/constant/request/type";
import { api } from "../clients";
import axios from "axios";

export async function fetchAllStudents(): Promise<Student[]> {
  try {
    const response = await api.get<StudentsResponse>("/students/all");

    if (!response.data.ok) {
      throw new Error(response.data.error);
    }

    return response.data.students;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error("Unable to load enrollments. Please refresh");
    }

    throw error;
  }
}

export async function fetchStudentById(id: string): Promise<Student> {
  try {
    const response = await api.get<StudentResponse>(`/students/${id}`);

    if (!response.data.ok) {
      throw new Error(response.data.error);
    }

    return response.data.student;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error("Unable to load enrollment. Please refresh");
    }

    throw error;
  }
}

export async function issueEnrollment(
  payload: IssueEnrollmentPayload,
): Promise<Student> {
  try {
    const response = await api.post<StudentResponse>("/students/add", payload);

    if (!response.data.ok) {
      throw new Error(response.data.error);
    }

    return response.data.student;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.error ||
          "Unable to issue enrollment. Please try again.",
      );
    }

    throw error;
  }
}

export async function updateStudent(
  id: string,
  payload: UpdateStudentPayload,
): Promise<Student> {
  try {
    const response = await api.patch<StudentResponse>(
      `/students/${id}`,
      payload,
    );

    if (!response.data.ok) {
      throw new Error(response.data.error);
    }

    return response.data.student;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.error ||
          "Unable to update enrollment. Please try again.",
      );
    }

    throw error;
  }
}

export async function markSessionFinished(
  id: string,
  payload: MarkSessionFinishedPayload,
): Promise<Student> {
  try {
    const response = await api.patch<StudentResponse>(
      `/students/${id}/session-finished`,
      payload,
    );

    if (!response.data.ok) {
      throw new Error(response.data.error);
    }

    return response.data.student;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.error ||
          "Unable to update session status. Please try again.",
      );
    }

    throw error;
  }
}

export async function deleteStudent(id: string): Promise<void> {
  try {
    const response = await api.delete<DeleteStudentResponse>(`/students/${id}`);

    if (!response.data.ok) {
      throw new Error(response.data.error);
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.error ||
          "Unable to delete enrollment. Please try again.",
      );
    }
    throw error;
  }
}
