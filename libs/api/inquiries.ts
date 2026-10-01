import { api } from "../clients";

export type InquiryStatus = "new" | "contacted" | "enrolled" | "closed";

export interface Inquiry {
  id: string;
  name: string;
  phone: string;
  email: string;
  age?: number;
  program: string;
  mode: string;
  message?: string;
  status: InquiryStatus;
  emailSent: boolean;
  emailError?: string | null;
  formCompleted: boolean;
  formCompletedAt?: string | null;
  createdAt: string;
}

interface ListResponse {
  success: boolean;
  data: Inquiry[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export async function getInquiries(params?: {
  status?: InquiryStatus;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const response = await api.get<ListResponse>("/inquire/inquiries", {
    params,
    withCredentials: true,
  });
  return response.data;
}

export async function updateInquiryStatus(id: string, status: InquiryStatus) {
  const response = await api.patch<{
    success: boolean;
    data: Inquiry;
    enrollmentLinkSent: boolean;
  }>(`/inquire/inquiries/${id}/status`, { status }, { withCredentials: true });
  return response.data;
}

// --- Public (applicant-facing, no auth) -----------------------------------

export interface PublicEnrollmentInfo {
  name: string;
  program: string;
  mode: string;
}

export async function getPublicEnrollmentInfo(token: string) {
  const response = await api.get<{ success: boolean; data: PublicEnrollmentInfo }>(
    `/inquire/enroll/${token}`,
  );
  return response.data;
}

export interface EnrollmentSubmission {
  birthdate: string;
  address: string;
  guardianName: string;
  guardianContact: string;
  schedulePreference?: string;
  notes?: string;
}

export async function submitPublicEnrollment(
  token: string,
  payload: EnrollmentSubmission,
) {
  const response = await api.post<{ success: boolean; message: string }>(
    `/inquire/enroll/${token}`,
    payload,
  );
  return response.data;
}