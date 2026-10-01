"use client";

import type { ModeOption } from "@/constant/guest";

type ModePillProps = {
  option: ModeOption;
  selected: boolean;
  onSelect: (value: string) => void;
};

export default function ModePill({ option, selected, onSelect }: ModePillProps) {
  return (
    <div className="relative">
      <input
        type="radio"
        id={option.id}
        name="mode"
        value={option.value}
        checked={selected}
        onChange={() => onSelect(option.value)}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
      />
      <label
        htmlFor={option.id}
        className={`flex cursor-pointer items-center gap-2 rounded-full border px-4.5 py-2.25 text-[0.85rem] font-medium transition-all duration-200 ${
          selected
            ? "border-gold-500 bg-gold-600/12 text-cream shadow-[0_0_0_3px_rgba(201,162,39,0.1)]"
            : "border-gold-600/25 text-ink-soft hover:border-gold-600/50 hover:text-cream"
        }`}
      >
        <span
          className={`h-1.75 w-1.75 rounded-full transition-all duration-200 ${
            selected ? "bg-gold-400 scale-100" : "scale-0 bg-gold-400"
          }`}
        />
        {option.value}
      </label>
    </div>
  );
}