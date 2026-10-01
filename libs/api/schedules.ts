import {
  Assignment,
  AssignmentResponse,
  AssignmentStats,
  AssignmentStatsResponse,
  AssignmentsResponse,
  DeleteAssignmentResponse,
  IssueAssignmentPayload,
  ToggleAssignmentStatusPayload,
  UpdateAssignmentPayload,
} from "@/constant/request/type";
import { api } from "../clients";
import axios from "axios";

export async function fetchAllAssignments(): Promise<Assignment[]> {
  try {
    const response = await api.get<AssignmentsResponse>("/assignments/all");

    if (!response.data.ok) {
      throw new Error(response.data.error);
    }

    return response.data.assignments;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error("Unable to load assignments. Please refresh");
    }

    throw error;
  }
}

export async function fetchAssignmentStats(): Promise<AssignmentStats> {
  try {
    const response = await api.get<AssignmentStatsResponse>("/assignments/stats");

    if (!response.data.ok) {
      throw new Error(response.data.error);
    }

    return response.data.stats;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error("Unable to load assignment stats. Please refresh");
    }

    throw error;
  }
}

export async function issueAssignment(
  payload: IssueAssignmentPayload,
): Promise<Assignment> {
  try {
    const response = await api.post<AssignmentResponse>(
      "/assignments/add",
      payload,
    );

    if (!response.data.ok) {
      throw new Error(response.data.error);
    }

    return response.data.assignment;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.error ||
          "Unable to assign tutor. Please try again.",
      );
    }

    throw error;
  }
}

export async function updateAssignment(
  id: string,
  payload: UpdateAssignmentPayload,
): Promise<Assignment> {
  try {
    const response = await api.patch<AssignmentResponse>(
      `/assignments/${id}`,
      payload,
    );

    if (!response.data.ok) {
      throw new Error(response.data.error);
    }

    return response.data.assignment;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.error ||
          "Unable to update assignment. Please try again.",
      );
    }

    throw error;
  }
}

export async function toggleAssignmentStatus(
  id: string,
  payload: ToggleAssignmentStatusPayload = {},
): Promise<Assignment> {
  try {
    const response = await api.patch<AssignmentResponse>(
      `/assignments/${id}/status`,
      payload,
    );

    if (!response.data.ok) {
      throw new Error(response.data.error);
    }

    return response.data.assignment;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.error ||
          "Unable to update status. Please try again.",
      );
    }

    throw error;
  }
}

export async function deleteAssignment(id: string): Promise<void> {
  try {
    const response = await api.delete<DeleteAssignmentResponse>(
      `/assignments/${id}`,
    );

    if (!response.data.ok) {
      throw new Error(response.data.error);
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.error ||
          "Unable to remove assignment. Please try again.",
      );
    }

    throw error;
  }
}