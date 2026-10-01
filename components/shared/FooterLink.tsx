"use client";

import Link from "next/link";

export default function FooterLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="group relative mb-2.5 block w-fit text-[0.86rem] text-ink-soft transition-colors duration-200 hover:text-gold-400"
    >
      {label}
      <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-gold-400 transition-all duration-300 ease-out group-hover:w-full" />
    </Link>
  );
}