"use client";

import { navItems } from "@/constant/admin/data";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const Sidebar = () => {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState<boolean>(false);
  return (
    <aside
      className={`fixed inset-y-0 left-0 z-30 flex flex-col border-r border-gold-600/20 bg-navy-950 transition-[width] duration-300 ${
        collapsed ? "w-18" : "w-64"
      }`}
    >
      <div className="flex h-16.5 shrink-0 items-center gap-3 border-b border-gold-600/15 px-5">
        <span className="flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-full border-[1.5px] border-gold-600 font-display text-base font-bold text-gold-400">
          E
        </span>
        {!collapsed && (
          <span className="font-display text-[1.05rem] font-bold tracking-tight text-cream">
            Excel<span className="text-gold-500">Ed</span>
          </span>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-5">
        <ul className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`group flex items-center gap-3 rounded-xl px-3.5 py-2.75 text-[0.88rem] font-medium transition-colors duration-200 ${
                    isActive
                      ? "bg-gold-600/12 text-cream"
                      : "text-ink-soft hover:bg-white/4 hover:text-cream"
                  }`}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`h-4.5 w-4.5 shrink-0 transition-colors duration-200 ${
                      isActive
                        ? "stroke-gold-400"
                        : "stroke-ink-faint group-hover:stroke-gold-400"
                    }`}
                  >
                    {item.path}
                  </svg>
                  {!collapsed && <span className="truncate">{item.label}</span>}
                  {isActive && !collapsed && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-gold-400" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <button
        type="button"
        onClick={() => setCollapsed((prev) => !prev)}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        className="mx-3 mb-4 flex items-center justify-center gap-2 rounded-xl border border-gold-600/20 py-2.5 text-ink-faint transition-colors duration-200 hover:border-gold-600/40 hover:text-gold-400"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`h-4 w-4 transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`}
        >
          <path d="M15 6l-6 6 6 6" />
        </svg>
      </button>
    </aside>
  );
};

export default Sidebar;
