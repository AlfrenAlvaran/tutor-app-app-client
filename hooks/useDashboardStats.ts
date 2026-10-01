import { api } from "@/libs/clients";
import useSWR from "swr";

export interface DashboardStats {
  enrolledStudents: number;
  activePrograms: number;
  pendingRequests: number;
  tutors?: number;
}

export interface EnrollmentByProgram {
  programId: string;
  name: string;
  value: number;
  pct: number;
}

export type EnrollmentStatus = "PENDING" | "COMPLETED" | "IN PROGRESS";

export interface RecentEnrollment {
  id: string;
  child: string;
  program: string;
  tutor: string;
  status: EnrollmentStatus;
}

export interface DashboardStatsResponse {
  stats: DashboardStats;
  enrollmentByProgram: EnrollmentByProgram[];
  enrollmentTotal: number;
  recentEnrollments: RecentEnrollment[];
}

const fetcher = (url: string): Promise<DashboardStatsResponse> =>
  api.get<DashboardStatsResponse>(url).then((res) => res.data);

export function useDashboardStats() {
  const { data, error, isLoading, mutate } = useSWR<DashboardStatsResponse>(
    "/dashboard/stats",
    fetcher,
  );

  return {
    stats: data?.stats,
    enrollmentByProgram: data?.enrollmentByProgram ?? [],
    enrollmentTotal: data?.enrollmentTotal ?? 0,
    recentEnrollments: data?.recentEnrollments ?? [],
    isLoading,
    isError: error,
    mutate,
  };
}