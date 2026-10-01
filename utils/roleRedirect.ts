export const ROLE_REDIRECTS: Record<string, string> = {
  admin: "/dashboard",
  tutor: "/teacher",
  student: "/portal",
};

export function resolveRedirect(role: string | undefined | null): string {
  if (!role) return "/portal";
  const key = role.trim().toLowerCase();
  return ROLE_REDIRECTS[key] ?? "/portal";
}