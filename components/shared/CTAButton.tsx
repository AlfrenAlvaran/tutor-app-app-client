"use client";

import { CTA } from "@/constant/guest/props";
import Link from "next/link";

const CTAButton = ({ label, href, variant = "primary" }: CTA) => {
  if (variant === "secondary") {
    return (
      <Link
        href={href}
        className="inline-flex items-center justify-center gap-2 rounded-full border border-gold-600/25 bg-white/2 px-6 sm:px-6.5 py-2.5 sm:py-3 text-[0.85rem] sm:text-[0.9rem] font-semibold text-cream transition-colors duration-200 hover:border-gold-500 hover:bg-gold-600/10"
      >
        {label}
      </Link>
    );
  }
  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center gap-2 rounded-full bg-linear-to-br from-gold-400 via-gold-600 to-gold-deep px-6 sm:px-6.5 py-2.5 sm:py-3 text-[0.85rem] sm:text-[0.9rem] font-semibold text-[#1a1204] shadow-gold transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-gold-lg"
    >
      {label}
    </Link>
  );
};

export default CTAButton;
