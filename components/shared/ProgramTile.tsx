"use client";

type ProgramTileProps = {
  label: string;
  index: number;
};

export default function ProgramTile({ label, index }: ProgramTileProps) {
  return (
    <div
      className="group relative flex animate-[tileIn_0.5s_ease-out_backwards] items-center gap-3 overflow-hidden rounded-xl border border-white/6 bg-white/2 px-4 py-3.5 transition-all duration-300 hover:-translate-y-0.5 hover:border-gold-600/50 hover:bg-gold-600/5 hover:shadow-[0_8px_24px_-8px_rgba(201,162,39,0.25)]"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* animated dot that morphs into an arrow on hover */}
      <span className="relative flex h-5 w-5 shrink-0 items-center justify-center">
        <span className="absolute h-1.75 w-1.75 rounded-full bg-gold-500 transition-all duration-300 group-hover:scale-0 group-hover:opacity-0" />
        <svg
          viewBox="0 0 24 24"
          fill="none"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="absolute h-4 w-4 scale-0 stroke-gold-400 opacity-0 transition-all duration-300 group-hover:scale-100 group-hover:opacity-100"
        >
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </span>

      <span className="flex-1 text-left text-[0.94rem] text-ink-soft transition-colors duration-200 group-hover:text-cream">
        {label}
      </span>

      {/* trailing shimmer sweep on hover */}
      <span className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-gold-500/8 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full" />
    </div>
  );
}