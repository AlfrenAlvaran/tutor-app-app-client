"use client";

import { useRef } from "react";
import type { ServiceItem } from "@/constant/guest";

type ServiceCardProps = {
  service: ServiceItem;
  index: number;
};

export default function ServiceCard({ service, index }: ServiceCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const cx = rect.width / 2;
    const cy = rect.height / 2;

    // subtle tilt, capped so it stays professional rather than gimmicky
    const rotateY = ((x - cx) / cx) * 4;
    const rotateX = -((y - cy) / cy) * 4;

    card.style.setProperty("--rotate-x", `${rotateX}deg`);
    card.style.setProperty("--rotate-y", `${rotateY}deg`);
    card.style.setProperty("--glow-x", `${x}px`);
    card.style.setProperty("--glow-y", `${y}px`);
  };

  const handleMouseLeave = () => {
    const card = cardRef.current;
    if (!card) return;
    card.style.setProperty("--rotate-x", "0deg");
    card.style.setProperty("--rotate-y", "0deg");
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="group relative overflow-hidden rounded-2xl border border-gold-600/25 p-8 px-6 text-center transition-[transform,border-color,box-shadow] duration-300 ease-out hover:border-gold-600 hover:shadow-card"
      style={{
        background: "linear-gradient(160deg, #122448, #0a1836)",
        transform:
          "perspective(800px) rotateX(var(--rotate-x, 0deg)) rotateY(var(--rotate-y, 0deg)) translateY(0)",
        transformStyle: "preserve-3d",
      }}
    >
      {/* cursor-following glow */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(circle 160px at var(--glow-x, 50%) var(--glow-y, 0%), rgba(201,162,39,0.18), transparent 70%)",
        }}
      />

      {/* index badge */}
      <span className="absolute right-4 top-4 z-1 font-display text-[0.7rem] font-bold tracking-[0.08em] text-gold-600/40">
        {String(index + 1).padStart(2, "0")}
      </span>

      <div className="relative z-1 mx-auto mb-5 flex h-16.5 w-16.5 items-center justify-center rounded-full border-[1.5px] border-gold-600 transition-transform duration-300 group-hover:scale-110 group-hover:border-gold-400">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-7 w-7 stroke-gold-400 transition-colors duration-300 group-hover:stroke-gold-300"
        >
          {service.path}
        </svg>
      </div>

      <h3 className="relative z-1 mb-2.5 text-[1.08rem] font-bold text-cream">
        {service.title}
      </h3>
      <p className="relative z-1 text-[0.88rem] leading-[1.55] text-ink-faint">
        {service.desc}
      </p>

      {/* underline reveal on hover — subtle, professional accent */}
      <span className="relative z-1 mx-auto mt-4 block h-px w-0 bg-linear-to-r from-transparent via-gold-500 to-transparent transition-[width] duration-500 group-hover:w-16" />
    </div>
  );
}