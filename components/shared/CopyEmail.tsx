"use client";

import { useState } from "react";

export default function CopyEmail({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard API unavailable — fail silently, link still works via mailto
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="group mb-2.5 flex items-center gap-1.5 text-[0.86rem] text-ink-soft transition-colors duration-200 hover:text-gold-400"
    >
      {email}
      <svg
        viewBox="0 0 24 24"
        fill="none"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-3.5 w-3.5 shrink-0 stroke-current opacity-0 transition-opacity duration-200 group-hover:opacity-70"
      >
        {copied ? (
          <path d="m5 13 4 4L19 7" />
        ) : (
          <>
            <rect x="9" y="9" width="12" height="12" rx="2" />
            <path d="M5 15V5a2 2 0 0 1 2-2h10" />
          </>
        )}
      </svg>
      {copied && (
        <span className="text-[0.72rem] text-success">Copied!</span>
      )}
    </button>
  );
}