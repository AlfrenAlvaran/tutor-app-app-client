"use client";

export default function ProgramRow({ label }: { label: string }) {
  return (
    <div className="group relative flex items-center gap-3 overflow-hidden border-b border-white/6 py-3.5 pl-1.5 pr-2 text-[0.94rem] text-ink-soft transition-colors duration-200 hover:text-cream">
      {/* highlight strip that grows from the left on hover */}
      <span className="pointer-events-none absolute inset-y-0 left-0 w-0 bg-linear-to-r from-gold-600/10 to-transparent transition-[width] duration-300 ease-out group-hover:w-full" />

      {/* dot with pulse ring on hover */}
      <span className="relative z-1 flex h-1.75 w-1.75 shrink-0 items-center justify-center">
        <span className="absolute h-1.75 w-1.75 rounded-full bg-gold-500 transition-transform duration-300 group-hover:scale-125" />
        <span className="absolute h-1.75 w-1.75 rounded-full bg-gold-500/40 opacity-0 transition-all duration-500 group-hover:scale-[2.6] group-hover:opacity-100" />
      </span>

      <span className="relative z-1 flex-1 text-left transition-transform duration-200 group-hover:translate-x-0.5">
        {label}
      </span>

      {/* arrow that slides in from the right on hover */}
      <svg
        viewBox="0 0 24 24"
        fill="none"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="relative z-1 h-3.5 w-3.5 shrink-0 -translate-x-2 stroke-gold-500 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"
      >
        <path d="M5 12h14M13 6l6 6-6 6" />
      </svg>
    </div>
  );
}