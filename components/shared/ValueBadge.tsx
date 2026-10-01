"use client";

import type { ValueItem } from "@/constant/guest";

export default function ValueBadge({ value }: { value: ValueItem }) {
  return (
    <div className="group flex flex-1 basis-37.5 flex-col items-center gap-2.5 text-center">
      <span className="relative flex h-13 w-13 items-center justify-center rounded-full">
        {/* glow ring that fades in on hover */}
        <span className="pointer-events-none absolute inset-0 scale-75 rounded-full bg-gold-500/0 opacity-0 blur-md transition-all duration-300 group-hover:scale-100 group-hover:bg-gold-500/20 group-hover:opacity-100" />

        {/* thin ring outline that draws in on hover */}
        <span className="absolute inset-0 rounded-full border border-gold-600/0 transition-colors duration-300 group-hover:border-gold-600/50" />

        <svg
          viewBox="0 0 24 24"
          fill="none"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="relative z-1 h-6.5 w-6.5 stroke-gold-400 transition-transform duration-300 ease-out group-hover:scale-110 group-hover:stroke-gold-300"
        >
          {value.path}
        </svg>
      </span>

      <span className="text-[0.82rem] font-semibold uppercase tracking-[0.1em] text-ink-soft transition-colors duration-300 group-hover:text-cream">
        {value.label}
      </span>
    </div>
  );
}