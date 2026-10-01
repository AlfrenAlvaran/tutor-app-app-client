"use client";

import { signOut } from "@/libs/api/auth";
import { PublicUser } from "@/constant/request/interface";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const NAV_ITEMS = [{ label: "My programs", href: "/portal" }];

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function IconLogout() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5 stroke-current"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="m16 17 5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  );
}

export default function StudentShell({
  user,
  children,
}: {
  user: PublicUser;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut();
    router.push("/sign-in");
  };

  return (
    <div className="min-h-screen bg-navy-950">
      <header className="border-b border-gold-600/15">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-8">
            <span className="font-display text-[1.05rem] font-bold text-cream">
              ExelEd
            </span>
            <nav className="flex items-center gap-1">
              {NAV_ITEMS.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`rounded-lg px-3 py-1.5 text-[0.84rem] font-medium transition-colors duration-150 ${
                      active
                        ? "bg-gold-600/15 text-gold-300"
                        : "text-ink-soft hover:text-cream"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-2 text-[0.84rem] text-ink-soft">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gold-600/15 text-[0.66rem] font-semibold text-gold-300">
                {initials(user.name ?? user.email ?? "S")}
              </span>
              {user.name ?? user.email}
            </span>
            <button
              type="button"
              onClick={handleSignOut}
              disabled={signingOut}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-[0.78rem] font-medium text-ink-faint transition-colors duration-150 hover:border-red-500/25 hover:text-red-400 disabled:opacity-50"
            >
              <IconLogout />
              {signingOut ? "Signing out..." : "Sign out"}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
    </div>
  );
}