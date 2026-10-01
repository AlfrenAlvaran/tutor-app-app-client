import {
  PublicUser,
  SignInPayload,
  VerifyOtpPayload,
} from "@/constant/request/interface";
import {
  SignInResponse,
  VerifyOtpResponse,
  ResendOtpResponse,
} from "@/constant/request/type";
import axios from "axios";
import { api } from "../clients";

export async function signIn({
  email,
  password,
}: SignInPayload): Promise<SignInResponse> {
  try {
    const response = await api.post(
      "/auth/login",
      {
        email,
        password,
      },
      {
        withCredentials: true,
      },
    );
    const data = response.data;

    if (data?.success && data.otpRequired) {
      return {
        ok: true,
        otpRequired: true,
        otpToken: data.otpToken,
        message: data.message,
      };
    }

    if (data?.success) {
      return { ok: true, user: data.user };
    }

    return { ok: false, error: data?.message || "Invalid email or password." };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.data?.message) {
        return { ok: false, error: error.response.data.message };
      }
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

export async function verifyOTP({
  otpToken,
  code,
}: VerifyOtpPayload): Promise<VerifyOtpResponse> {
  try {
    const response = await api.post(
      "/auth/verify-otp",
      { otpToken, code },
      { withCredentials: true },
    );

    if (response.data?.success) {
      return { ok: true, user: response.data.user };
    }

    return { ok: false, error: response.data?.message || "Incorrect code." };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.data?.message) {
      return { ok: false, error: error.response.data.message };
    }
    return { ok: false, error: "Something went wrong. Please try again." };
  }
}

export async function resendOTP(otpToken: string): Promise<ResendOtpResponse> {
  try {
    const response = await api.post(
      "/auth/resend-otp",
      { otpToken },
      { withCredentials: true },
    );

    if (response.data?.success) {
      return {
        ok: true,
        otpToken: response.data.otpToken,
        message: response.data.message,
      };
    }
    return {
      ok: false,
      error: response.data?.message || "Could not resend code.",
    };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.data?.message) {
      return { ok: false, error: error.response.data.message };
    }
    return { ok: false, error: "Something went wrong. Please try again." };
  }
}

export async function getMe() {
  try {
    const response = await api.get("/auth/me", { withCredentials: true });
    if (response.data?.success) return response.data.user as PublicUser;
    return null;
  } catch {
    return null;
  }
}

export async function signOut() {
  try {
    await api.post("/auth/logout", {}, { withCredentials: true });
    return true;
  } catch {
    return false;
  }
}

interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "tutor" | "student";
}

export type ChangePasswordResult =
  { ok: true; user?: User } | { ok: false; error: string };

export async function changePassword(
  payload: ChangePasswordPayload,
): Promise<ChangePasswordResult> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      return { ok: false, error: data.message ?? "Something went wrong." };
    }

    return { ok: true, user: data.data ?? undefined };
  } catch {
    return { ok: false, error: "Network error. Please try again." };
  }
}
