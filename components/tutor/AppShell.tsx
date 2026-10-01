"use client";
import { JSX } from "react";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  label: string;
  href: string;
  icon: (props: React.SVGProps<SVGSVGElement>) => JSX.Element;
}

// Swap this for your real auth/role check.
type Role = "admin" | "tutor";

const ADMIN_NAV: NavItem[] = [
  { label: "Tutors", href: "/admin/tutors", icon: UsersIcon },
  { label: "Modules", href: "/admin/modules", icon: FileIcon },
];

const TUTOR_NAV: NavItem[] = [
  { label: "Home", href: "/tutor", icon: HomeIcon },
  { label: "My modules", href: "/tutor/modules", icon: FileIcon },
];

export default function AppShell({
  children,
  role = "tutor",
  userName = "",
}: {
  children: React.ReactNode;
  role?: Role;
  userName?: string;
}) {
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const navItems = role === "admin" ? ADMIN_NAV : TUTOR_NAV;

  return (
    <div className="flex min-h-screen bg-navy-950 font-body text-cream">
      {/* Mobile top bar */}
      <div className="fixed inset-x-0 top-0 z-40 flex items-center justify-between border-b border-navy-line bg-navy-950/95 px-4 py-3 backdrop-blur sm:hidden">
        <span className="font-script text-lg text-gold-400/90">Academy</span>
        <button
          onClick={() => setMobileNavOpen((v) => !v)}
          aria-label="Toggle navigation"
          className="rounded-lg p-2 text-ink-soft hover:bg-navy-800 hover:text-cream"
        >
          {mobileNavOpen ? (
            <CloseIcon className="h-5 w-5" />
          ) : (
            <MenuIcon className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 flex w-64 shrink-0 flex-col border-r border-navy-line bg-navy-900 pt-6 transition-transform duration-200 sm:static sm:translate-x-0 ${
          mobileNavOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="hidden px-6 sm:block">
          <span className="font-script text-xl text-gold-400/90">Academy</span>
        </div>

        <nav className="mt-8 flex flex-1 flex-col gap-1 px-3">
          {navItems.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileNavOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-gold-500/10 text-gold-400"
                    : "text-ink-soft hover:bg-navy-800 hover:text-cream"
                }`}
              >
                <Icon className="h-4.5 w-4.5 shrink-0" />
                {item.label}
                {active && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-gold-500" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Account footer */}
        <div className="mt-auto border-t border-navy-line px-4 py-4">
          <div className="flex items-center gap-3 rounded-xl px-2 py-2">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-gold-600/30 to-gold-500/10 font-display text-xs font-semibold text-gold-400">
              {getInitials(userName) || <UserIcon className="h-4 w-4" />}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-cream">
                {userName || (role === "admin" ? "Admin" : "Tutor")}
              </p>
              <p className="truncate text-xs capitalize text-ink-faint">{role}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile scrim */}
      {mobileNavOpen && (
        <div
          className="fixed inset-0 z-20 bg-navy-950/70 backdrop-blur-sm sm:hidden"
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      {/* Page content */}
      <main className="min-w-0 flex-1 pt-14 sm:pt-0">{children}</main>
    </div>
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

function UsersIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87" />
      <path d="M16 3.13a4 4 0 010 7.75" />
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
function HomeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 9.5L12 3l9 6.5" />
      <path d="M5 10v10a1 1 0 001 1h4a1 1 0 001-1v-5h2v5a1 1 0 001 1h4a1 1 0 001-1V10" />
    </svg>
  );
}
function MenuIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" {...props}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}
function CloseIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M18 6L6 18M6 6l12 12" />
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