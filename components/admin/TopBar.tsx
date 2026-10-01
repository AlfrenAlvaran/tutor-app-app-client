"use client";

import { useState } from "react";

export default function Topbar() {
  const [query, setQuery] = useState("");

  return (
    <header className="sticky top-0 z-20 flex h-16.5 items-center justify-between border-b border-gold-600/15 bg-navy-950/90 px-6 backdrop-blur-md">
      <div className="relative w-full max-w-87.5">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 stroke-ink-faint"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search students, tutors, requests..."
          className="w-full rounded-full border border-gold-600/20 bg-white/3 py-2.25 pl-10 pr-4 text-[0.86rem] text-cream outline-none transition-all duration-200 placeholder:text-ink-faint focus:border-gold-500 focus:bg-gold-600/5"
        />
      </div>

      <div className="flex items-center gap-4.5">
        <button
          type="button"
          aria-label="Notifications"
          className="relative flex h-9.5 w-9.5 items-center justify-center rounded-full border border-gold-600/20 text-ink-soft transition-colors duration-200 hover:border-gold-600/40 hover:text-gold-400"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4.5 w-4.5"
          >
            <path d="M6 8a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z" />
            <path d="M10 20a2 2 0 0 0 4 0" />
          </svg>
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-gold-500" />
        </button>

        <div className="flex items-center gap-2.5">
          <span className="flex h-9.5 w-9.5 items-center justify-center rounded-full border-[1.5px] border-gold-600 bg-gold-600/10 font-display text-[0.85rem] font-bold text-gold-400">
            A
          </span>
          <div className="hidden sm:block">
            <p className="text-[0.85rem] font-semibold text-cream">Admin</p>
            <p className="text-[0.72rem] text-ink-faint">admin@exceled.tutorials</p>
          </div>
        </div>
      </div>
    </header>
  );
}