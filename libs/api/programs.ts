import {
  Program,
  ProgramsResponse,
  ProgramResponse,
  DeleteProgramResponse,
  CreateProgramPayload,
  UpdateProgramPayload,
  Enrollment,
  MyEnrollmentsResponse,
} from "@/constant/request/type";
import { api } from "../clients";
import axios, { AxiosError } from "axios";

type ApiErrorBody = {
  error?: string;
  details?: Record<string, string[]>;
};

/** Prefers the first field-level validation message, then the server's error text. */
function apiErrorMessage(error: AxiosError<ApiErrorBody>, fallback: string) {
  const data = error.response?.data;

  const firstField = data?.details
    ? Object.entries(data.details).find(([, msgs]) => msgs?.length)
    : undefined;

  if (firstField) return `${firstField[0]}: ${firstField[1].join(", ")}`;
  return data?.error || fallback;
}

export async function fetchPrograms(): Promise<Program[]> {
  try {
    const response = await api.get<ProgramsResponse>("/programs/program-list");

    if (!response.data.ok) {
      throw new Error(response.data.error);
    }

    return response.data.programs;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error("Unable to load program. Please refresh");
    }

    throw error;
  }
}

export async function fetchAllPrograms(): Promise<Program[]> {
  try {
    const response = await api.get<ProgramsResponse>("/programs/all");

    if (!response.data.ok) {
      throw new Error(response.data.error);
    }

    return response.data.programs;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error("Unable to load programs. Please refresh");
    }

    throw error;
  }
}

export async function fetchProgramById(id: string): Promise<Program> {
  try {
    const response = await api.get<ProgramResponse>(`/programs/${id}`);

    if (!response.data.ok) {
      throw new Error(response.data.error);
    }

    return response.data.program;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error("Unable to load program. Please refresh");
    }

    throw error;
  }
}

export async function createProgram(
  payload: CreateProgramPayload,
): Promise<Program> {
  try {
    const response = await api.post<ProgramResponse>("/programs/add", payload);

    if (!response.data.ok) {
      throw new Error(response.data.error);
    }

    return response.data.program;
  } catch (error) {
    if (axios.isAxiosError<ApiErrorBody>(error)) {
      throw new Error(
        apiErrorMessage(error, "Unable to create program. Please try again."),
      );
    }

    throw error;
  }
}

export async function updateProgram(
  id: string,
  payload: UpdateProgramPayload,
): Promise<Program> {
  try {
    const response = await api.patch<ProgramResponse>(
      `/programs/${id}`,
      payload,
    );

    if (!response.data.ok) {
      throw new Error(response.data.error);
    }

    return response.data.program;
  } catch (error) {
    if (axios.isAxiosError<ApiErrorBody>(error)) {
      throw new Error(
        apiErrorMessage(error, "Unable to update program. Please try again."),
      );
    }

    throw error;
  }
}

export async function deleteProgram(id: string): Promise<void> {
  try {
    const response = await api.delete<DeleteProgramResponse>(`/programs/${id}`);

    if (!response.data.ok) {
      throw new Error(response.data.error);
    }
  } catch (error) {
    if (axios.isAxiosError<ApiErrorBody>(error)) {
      throw new Error(
        apiErrorMessage(error, "Unable to delete program. Please try again."),
      );
    }

    throw error;
  }
}

export async function getMyEnrolledProgram(): Promise<Enrollment[]> {
  try {
    const response = await api.get<MyEnrollmentsResponse>(
      "/students/my-enrolled-program",
    );

    if (!response.data.ok) {
      throw new Error(response.data.error);
    }

    return response.data.enrollments;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error("Unable to load your enrollment. Please refresh");
    }
    throw error;
  }
}