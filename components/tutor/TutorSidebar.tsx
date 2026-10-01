"use client";

import { useState, JSX } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "@/libs/api/auth";

interface NavItem {
  label: string;
  href: string;
  icon: (props: React.SVGProps<SVGSVGElement>) => JSX.Element;
}

const TUTOR_NAV: NavItem[] = [
  { label: "Home", href: "/teacher", icon: HomeIcon },
  // { label: "My modules", href: "/tutor/modules", icon: FileIcon },
  { label: "Students", href: "/my-students", icon: FileIcon },
];


export default function TutorSidebar({
  userName = "",
}: {
  userName?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    await signOut();
    router.push("/sign-in");
    router.refresh();
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-18 flex-col border-r border-navy-line bg-navy-900 transition-[width] duration-300 lg:w-64">
      {/* Brand */}
      <div className="flex h-16 items-center justify-center border-b border-navy-line px-2 lg:justify-start lg:px-6">
        <span className="hidden font-script text-xl text-gold-400/90 lg:block">
          Academy
        </span>
        <span className="font-script text-xl text-gold-400/90 lg:hidden">A</span>
      </div>

      {/* Nav */}
      <nav className="mt-6 flex flex-1 flex-col gap-1 px-2 lg:px-3">
        {TUTOR_NAV.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              className={`flex items-center justify-center gap-3 rounded-xl px-0 py-2.5 text-sm font-medium transition-colors lg:justify-start lg:px-3.5 ${
                active
                  ? "bg-gold-500/10 text-gold-400"
                  : "text-ink-soft hover:bg-navy-800 hover:text-cream"
              }`}
            >
              <Icon className="h-4.5 w-4.5 shrink-0" />
              <span className="hidden lg:inline">{item.label}</span>
              {active && (
                <span className="ml-auto hidden h-1.5 w-1.5 rounded-full bg-gold-500 lg:block" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Account footer */}
      <div className="border-t border-navy-line px-2 py-4 lg:px-4">
        <div className="flex items-center justify-center gap-3 rounded-xl px-0 py-2 lg:justify-start lg:px-2">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-gold-600/30 to-gold-500/10 font-display text-xs font-semibold text-gold-400">
            {getInitials(userName) || <UserIcon className="h-4 w-4" />}
          </span>
          <div className="hidden min-w-0 flex-1 lg:block">
            <p className="truncate text-sm font-medium text-cream">
              {userName || "Tutor"}
            </p>
            <p className="truncate text-xs text-ink-faint">Tutor</p>
          </div>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            aria-label="Log out"
            className="hidden shrink-0 rounded-lg p-1.5 text-ink-faint transition-colors hover:bg-navy-800 hover:text-cream disabled:opacity-50 lg:block"
          >
            <LogoutIcon className="h-4 w-4" />
          </button>
        </div>
        {/* Compact logout for collapsed rail */}
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          aria-label="Log out"
          className="mt-2 flex w-full items-center justify-center rounded-lg p-1.5 text-ink-faint transition-colors hover:bg-navy-800 hover:text-cream disabled:opacity-50 lg:hidden"
        >
          <LogoutIcon className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/* ---------------- Inline icons ---------------- */

function HomeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 9.5L12 3l9 6.5" />
      <path d="M5 10v10a1 1 0 001 1h4a1 1 0 001-1v-5h2v5a1 1 0 001 1h4a1 1 0 001-1V10" />
    </svg>
  );
}
function FileIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <path d="M14 2v6h6" />
    </svg>
  );
}
function UserIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
function LogoutIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  );
}