import type { ReactNode } from "react";

// ---------------------------------------------------------------------------
// Layout for everything under /student (e.g. /student/programs).
// Keeps the page components focused on content — this just supplies the
// shared shell: background, a lightweight top bar, and consistent max-width.
//
// If your root layout (app/layout.tsx) already sets up the font variables
// (--font-display, --font-body) via next/font, you don't need to touch
// those here — this layout just consumes the CSS variables/classes.
// ---------------------------------------------------------------------------

export default function StudentLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-navy-950 font-body text-cream">
      <TopBar />
      {children}
    </div>
  );
}

function TopBar() {
  return (
    <header className="border-b border-navy-line bg-navy-950/80 backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-4xl items-center justify-between px-5 py-4">
        <a
          href="/student/programs"
          className="font-display text-base font-semibold tracking-tight text-cream"
        >
          Programs
        </a>

        <nav className="flex items-center gap-5 font-body text-[13.5px] text-ink-soft">
          <a
            href="/student/programs"
            className="transition-colors duration-150 hover:text-cream"
          >
            My programs
          </a>
        </nav>
      </div>
    </header>
  );
}