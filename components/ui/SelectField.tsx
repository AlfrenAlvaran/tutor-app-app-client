"use client";

import { useEffect, useId, useRef, useState } from "react";

type SelectFieldProps = {
  label: string;
  name: string;
  options: string[];
  placeholder?: string;
  required?: boolean;
  value?: string;
  onChange?: (value: string) => void;
};

export default function SelectField({
  label,
  name,
  options,
  placeholder = "Select an option",
  required,
  value: controlledValue,
  onChange,
}: SelectFieldProps) {
  const [internalValue, setInternalValue] = useState("");
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  const value = controlledValue ?? internalValue;

  const selectValue = (next: string) => {
    setInternalValue(next);
    onChange?.(next);
    setOpen(false);
  };

  // close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (!open) {
        setOpen(true);
      } else {
        selectValue(options[highlighted]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!open) {
        setOpen(true);
      } else {
        setHighlighted((prev) => (prev + 1) % options.length);
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (open) {
        setHighlighted((prev) => (prev - 1 + options.length) % options.length);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={wrapperRef} className="relative mb-5">
      <label className="mb-2 block text-[0.78rem] font-semibold uppercase tracking-[0.08em] text-ink-faint">
        {label}
      </label>

      {/* hidden native input keeps this working inside a plain <form> submit */}
      <input type="hidden" name={name} value={value} required={required} />

      <button
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-haspopup="listbox"
        onClick={() => setOpen((prev) => !prev)}
        onKeyDown={handleKeyDown}
        className={`flex w-full items-center justify-between rounded-2.5 border bg-white/3 px-3.75 py-3.25 text-left font-body text-[0.94rem] outline-none transition-all duration-200 ${
          open
            ? "border-gold-500 bg-gold-600/5 shadow-[0_0_0_3px_rgba(201,162,39,0.12)]"
            : "border-gold-600/25"
        } ${value ? "text-cream" : "text-ink-faint"}`}
      >
        <span>{value || placeholder}</span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`h-4 w-4 shrink-0 stroke-gold-400 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-20 mt-2 max-h-70 w-full overflow-y-auto rounded-2.5 border border-gold-600/30 bg-navy-900 p-1.5 shadow-panel"
        >
          {options.map((option, index) => {
            const isSelected = option === value;
            const isHighlighted = index === highlighted;
            return (
              <li
                key={option}
                role="option"
                aria-selected={isSelected}
                onMouseEnter={() => setHighlighted(index)}
                onClick={() => selectValue(option)}
                className={`flex cursor-pointer items-center justify-between rounded-xl px-3.5 py-2.5 text-[0.9rem] transition-colors duration-150 ${
                  isSelected
                    ? "bg-gold-600/15 text-cream"
                    : isHighlighted
                      ? "bg-white/5 text-cream"
                      : "text-ink-soft"
                }`}
              >
                {option}
                {isSelected && (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4 shrink-0 stroke-gold-400"
                  >
                    <path d="m5 13 4 4L19 7" />
                  </svg>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}