import { PublicUser } from "@/constant/request/interface";
import axios from "axios";
import { cookies } from "next/headers";
import { api } from "../clients";

export async function getCurrentUser(): Promise<PublicUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");

  if (!token) return null;

  try {
    const response = await api.get("/auth/me", {
      headers: {
        Cookie: `token=${token.value}`,
      },
    });
    if (!response.data?.success || !response.data.user) return null;

    return response.data.user as PublicUser;
  } catch (error) {
    if (axios.isAxiosError(error)) return null;
    return null;
  }
}
