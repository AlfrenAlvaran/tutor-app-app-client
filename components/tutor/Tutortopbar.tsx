"use client";

import { usePathname } from "next/navigation";

const PAGE_TITLES: Record<string, string> = {
  "/my-students": "Home",
  "/tutor/modules": "My modules",
  
};

export default function TutorTopbar() {
  const pathname = usePathname();
  const title = PAGE_TITLES[pathname] ?? "Dashboard";

  return (
    <header className="sticky top-0 z-30 border-b border-navy-line bg-navy-950/80 backdrop-blur-sm">
      <div className="flex items-center justify-between px-6 py-4">
        <h1 className="font-display text-lg font-semibold tracking-tight text-cream">
          {title}
        </h1>
      </div>
    </header>
  );
}