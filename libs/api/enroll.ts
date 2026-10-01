import { EnrollPayload, EnrollResponse } from "@/constant/request/type";
import { api } from "../clients";
import axios from "axios";

export async function submitEnrollment(
  payload: EnrollPayload,
): Promise<EnrollResponse> {
  try {
    const response = await api.post("inquire/submit-enroll", payload);

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.data) return error.response.data as EnrollResponse;
      if (error.request) {
        return {
          ok: false,
          error: "No response from server. Please check your connection.",
        };
      }
    }
    return { ok: false, error: "Something went wrong. Please try again." };
  }
}
