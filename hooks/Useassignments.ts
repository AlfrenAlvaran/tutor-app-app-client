"use client";
import useSWR from "swr";
import axios from "axios";
import { toast } from "sonner";
import { useMemo } from "react";
import type {
  Assignment,
  AssignmentStats,
  CreateAssignmentPayload,
  UpdateAssignmentPayload,
} from "@/constant/request/type";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;
// Adjust if scheduleRouter is mounted somewhere else, e.g. app.use("/assignments", scheduleRouter)
const ASSIGNMENTS_ENDPOINT = `${API_BASE}/assignments`;

function unwrap<T>(data: { ok: boolean; error?: string } & Record<string, unknown>, key: string): T {
  if (!data.ok) {
    throw new Error(data.error ?? "Request failed");
  }
  return data[key] as T;
}

function errorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError(error) && error.response?.data?.error) {
    return error.response.data.error as string;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}

const listFetcher = (url: string) =>
  axios
    .get(url, { withCredentials: true })
    .then((res) => unwrap<Assignment[]>(res.data, "assignments"));

const statsFetcher = (url: string) =>
  axios
    .get(url, { withCredentials: true })
    .then((res) => unwrap<AssignmentStats>(res.data, "stats"));

type AssignmentFilters = {
  studentId?: string;
  tutorId?: string;
  status?: "active" | "paused";
};

function buildListKey(filters?: AssignmentFilters) {
  const params = new URLSearchParams();
  if (filters?.studentId) params.set("studentId", filters.studentId);
  if (filters?.tutorId) params.set("tutorId", filters.tutorId);
  if (filters?.status) params.set("status", filters.status);
  const qs = params.toString();
  return `${ASSIGNMENTS_ENDPOINT}/all${qs ? `?${qs}` : ""}`;
}

export function useAssignments(filters?: AssignmentFilters) {
  const key = buildListKey(filters);

  const {
    data: assignments,
    error,
    isLoading,
    mutate,
  } = useSWR<Assignment[]>(key, listFetcher);

  const list = assignments ?? [];

  const createAssignment = async (payload: CreateAssignmentPayload) => {
    try {
      const res = await axios.post(
        `${ASSIGNMENTS_ENDPOINT}/add`,
        payload,
        { withCredentials: true },
      );
      const created = unwrap<Assignment>(res.data, "assignment");
      mutate([created, ...list], false);
      toast.success(`Tutor assigned — ${created.student.name}`);
      return created;
    } catch (error) {
      toast.error(errorMessage(error, "Failed to assign tutor. Please try again."));
      throw error;
    }
  };

  const updateAssignment = async (id: string, payload: UpdateAssignmentPayload) => {
    try {
      const res = await axios.patch(
        `${ASSIGNMENTS_ENDPOINT}/${id}`,
        payload,
        { withCredentials: true },
      );
      const updated = unwrap<Assignment>(res.data, "assignment");
      mutate(
        list.map((a) => (a._id === id ? updated : a)),
        false,
      );
      toast.success(`Assignment updated — ${updated.student.name}`);
      return updated;
    } catch (error) {
      toast.error(errorMessage(error, "Failed to update assignment. Please try again."));
      throw error;
    }
  };

  const toggleStatus = async (id: string, status?: "active" | "paused") => {
    try {
      const res = await axios.patch(
        `${ASSIGNMENTS_ENDPOINT}/${id}/status`,
        status ? { status } : {},
        { withCredentials: true },
      );
      const updated = unwrap<Assignment>(res.data, "assignment");
      mutate(
        list.map((a) => (a._id === id ? updated : a)),
        false,
      );
      return updated;
    } catch (error) {
      toast.error(errorMessage(error, "Failed to update status. Please try again."));
      throw error;
    }
  };

  const removeAssignment = async (id: string) => {
    try {
      await axios.delete(`${ASSIGNMENTS_ENDPOINT}/${id}`, {
        withCredentials: true,
      });
      mutate(
        list.filter((a) => a._id !== id),
        false,
      );
      toast.success("Assignment removed");
    } catch (error) {
      toast.error(errorMessage(error, "Failed to remove assignment. Please try again."));
      throw error;
    }
  };

  const localStats = useMemo(() => {
    const total = list.length;
    const active = list.filter((a) => a.status === "active").length;
    const tutorsInUse = new Set(list.map((a) => a.tutor._id)).size;
    return { total, active, tutorsInUse };
  }, [list]);

  return {
    assignments: list,
    loading: isLoading,
    error,
    createAssignment,
    updateAssignment,
    toggleStatus,
    removeAssignment,
    mutate,
    ...localStats,
  };
}

// Separate hook for the /stats endpoint (includes weeklyHours computed server-side)
export function useAssignmentStats() {
  const { data, isLoading, error } = useSWR<AssignmentStats>(
    `${ASSIGNMENTS_ENDPOINT}/stats`,
    statsFetcher,
  );

  return {
    stats: data ?? { total: 0, active: 0, tutorsInUse: 0, weeklyHours: 0 },
    loading: isLoading,
    error,
  };
}