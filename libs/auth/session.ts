import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { PublicUser } from "@/constant/request/interface";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

const SESSION_COOKIE_NAME = "token";

export type Role = PublicUser["role"];

export async function getSession(): Promise<PublicUser | null> {
  const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;

  if (!token) return null;

  try {
    const response = await fetch(`${API_BASE}/auth/me`, {
      headers: { Cookie: `${SESSION_COOKIE_NAME}=${token}` },
      cache: "no-store",
    });

    if (!response.ok) return null;

    const data = await response.json();

    return data?.success ? (data.user as PublicUser) : null;
  } catch {
    return null;
  }
}

export async function requireSession(): Promise<PublicUser> {
  const session = await getSession();

  if (!session) {
    redirect("sign-in");
  }

  return session;
}

export async function requireRole(role: Role): Promise<PublicUser> {
  const session = await requireSession();

  if (session.role) {
    redirect(rolePath(session.role));
  }

  return session;
}

export function rolePath(role: Role): string {
  switch (role) {
    case "admin":
      return "/dashboard";
    case "tutor":
      return "/tutor";
    case "student":
      return "/student";
    default:
      return "/sign-in";
  }
}
