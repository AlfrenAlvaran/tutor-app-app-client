"use client";

import { useState, InputHTMLAttributes } from "react";

type FormFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  id: string;
};

export default function FormField({ label, id, required, ...rest }: FormFieldProps) {
  const [focused, setFocused] = useState(false);
  const [valid, setValid] = useState<boolean | null>(null);

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setFocused(false);
    if (e.target.value.trim() === "") {
      setValid(null);
    } else {
      setValid(e.target.checkValidity());
    }
  };

  return (
    <div className="mb-5">
      <label
        htmlFor={id}
        className="mb-2 block text-[0.78rem] font-semibold uppercase tracking-[0.08em] text-ink-faint"
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          required={required}
          onFocus={() => setFocused(true)}
          onBlur={handleBlur}
          className={`w-full rounded-2.5 border bg-white/3 px-3.75 py-3.25 pr-10 font-body text-[0.94rem] text-cream outline-none transition-all duration-200 placeholder:text-ink-faint ${
            focused
              ? "border-gold-500 bg-gold-600/5 shadow-[0_0_0_3px_rgba(201,162,39,0.12)]"
              : valid === false
                ? "border-red-500/60"
                : "border-gold-600/25"
          }`}
          {...rest}
        />
        {valid === true && (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="absolute right-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 stroke-success transition-opacity duration-200"
          >
            <path d="m5 13 4 4L19 7" />
          </svg>
        )}
      </div>
    </div>
  );
}