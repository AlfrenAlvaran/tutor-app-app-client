"use client";

import { TrustItem } from "@/constant/guest";

const TrustBadge = ({ item }: { item: TrustItem }) => {
  return (
    <div className="flex items-center gap-2 sm:gap-2.5 text-[0.82rem] sm:text-[0.92rem] font-semibold tracking-[0.03em] text-ink-soft">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4 sm:h-5 sm:w-5 shrink-0 stroke-gold-400"
      >
        {item.path}
      </svg>
      {item.label}
    </div>
  );
};

export default TrustBadge;
