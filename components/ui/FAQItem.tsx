"use client";

import { useRef, useState } from "react";
import type { FAQItem as FAQItemType } from "@/constant/guest";

export default function FAQItem({ item }: { item: FAQItemType }) {
  const [open, setOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <div className="border-b border-white/8 last:border-b-0">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between gap-4 py-5.5 text-left transition-colors duration-200 hover:text-gold-400"
      >
        <span className="text-[0.98rem] font-semibold text-cream">
          {item.question}
        </span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`h-5 w-5 shrink-0 stroke-gold-400 transition-transform duration-300 ${
            open ? "rotate-45" : ""
          }`}
        >
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>

      <div
        ref={contentRef}
        style={{
          maxHeight: open ? contentRef.current?.scrollHeight : 0,
        }}
        className="overflow-hidden transition-[max-height] duration-300 ease-in-out"
      >
        <p className="pb-5.5 pr-9 text-[0.92rem] leading-relaxed text-ink-soft">
          {item.answer}
        </p>
      </div>
    </div>
  );
}