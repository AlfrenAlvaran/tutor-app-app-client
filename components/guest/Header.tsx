"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navigationLinks } from "@/constant/guest";
import Image from "next/image";

const MOBILE_MENU_ID = "mobile-nav-menu";

const Header = () => {
  const pathname = usePathname();

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 30);

      const doc = document.documentElement;
      const total = doc.scrollHeight - doc.clientHeight;

      setScrollProgress(total > 0 ? (window.scrollY / total) * 100 : 0);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const closed = useCallback(() => {
    setMenuOpen(false);
  }, []);

  // Close on Escape, and return focus to the toggle button
  useEffect(() => {
    if (!menuOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        toggleRef.current?.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  // Close on click/tap outside the menu and toggle button
  useEffect(() => {
    if (!menuOpen) return;

    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        toggleRef.current &&
        !toggleRef.current.contains(target)
      ) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [menuOpen]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-navy-950/90 backdrop-blur-md py-2.5 sm:py-3 shadow-2xl border-b border-gold-600/25"
          : "py-3.5 sm:py-4.5"
      }`}
    >
      {/* Scroll Progress Bar */}
      <div
        className="absolute bottom-0 left-0 h-0.5 bg-linear-to-r from-gold-600 via-gold-400 to-gold-600 transition-[width] duration-150"
        style={{ width: `${scrollProgress}%` }}
        role="progressbar"
        aria-label="Page scroll progress"
        aria-valuenow={Math.round(scrollProgress)}
        aria-valuemin={0}
        aria-valuemax={100}
      />

      <div className="mx-auto max-w-295 px-4 sm:px-6 lg:px-7">
        <nav className="flex items-center justify-between" aria-label="Primary">
          <Link href={"/"} className="flex items-center gap-2 sm:gap-3">
          {/* <Image src="/" */}

          <Image src="/logo.jpg" alt="Logo" className="flex h-8 w-8 sm:h-9.5 sm:w-9.5 shrink-0 items-center justify-center rounded-full border-[1.5px] border-gold-600 font-display text-base sm:text-lg font-bold text-gold-400" width={30} height={30}/>
           
            <span className="font-display text-[1.1rem] sm:text-[1.28rem] font-bold tracking-tight">
              Excel<span className="text-gold-500">Ed</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden gap-5 text-[0.88rem] font-medium text-ink-soft md:flex lg:gap-9 lg:text-[0.92rem]">
            {navigationLinks.map((link) => {
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`group relative pb-1 whitespace-nowrap transition-colors duration-200 hover:text-cream ${
                    isActive ? "text-cream" : ""
                  }`}
                >
                  {link.label}
                  <span
                    className={`absolute bottom-0 left-0 h-px bg-gold-500 transition-all duration-300 ${
                      isActive ? "w-full" : "w-0 group-hover:w-full"
                    }`}
                  />
                </Link>
              );
            })}
          </div>

          <Link
            href="/sign-in"
            className="hidden items-center justify-center gap-2 rounded-full border border-transparent bg-linear-to-br from-gold-400 via-gold-600 to-gold-deep px-5 py-2.5 text-[0.85rem] font-semibold text-[#1a1204] shadow-gold transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-gold-lg md:inline-flex lg:px-6.5 lg:py-3 lg:text-[0.9rem]"
          >
            Sign In
          </Link>

          {/* Mobile Toggle */}
          <button
            ref={toggleRef}
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls={MOBILE_MENU_ID}
            onClick={() => setMenuOpen((prev) => !prev)}
            className="relative flex h-9 w-9 sm:h-10 sm:w-10 flex-col items-center justify-center gap-1.25 rounded-full border border-gold-600/40 md:hidden"
          >
            <span
              className={`h-[1.5px] w-4 bg-cream transition-all duration-300 ${
                menuOpen ? "translate-y-[6.5px] rotate-45" : ""
              }`}
            />
            <span
              className={`h-[1.5px] w-4 bg-cream transition-all duration-300 ${
                menuOpen ? "opacity-0" : "opacity-100"
              }`}
            />
            <span
              className={`h-[1.5px] w-4 bg-cream transition-all duration-300 ${
                menuOpen ? "translate-y-[-6.5px] -rotate-45" : ""
              }`}
            />
          </button>

          {/* Mobile Menu */}
          <div
            id={MOBILE_MENU_ID}
            ref={menuRef}
            className={`absolute left-0 right-0 top-full overflow-y-auto transition-all duration-300 ease-in-out md:hidden ${
              menuOpen
                ? "max-h-[calc(100vh-4rem)] border-t border-gold-600/20"
                : "max-h-0"
            }`}
            inert={!menuOpen}
          >
            <div className="mx-auto flex max-w-295 flex-col gap-1 bg-navy-950/95 px-4 sm:px-7 py-5 backdrop-blur-md">
              {navigationLinks.map((link) => {
                const isActive = pathname === link.href;

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={closed}
                    aria-current={isActive ? "page" : undefined}
                    className={`rounded-lg px-3 py-3 text-[0.95rem] font-medium transition-colors duration-200 ${
                      isActive
                        ? "bg-gold-600/10 text-cream"
                        : "text-ink-soft hover:bg-white/5 hover:text-cream"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}

              <Link
                href="/sign-in"
                onClick={closed}
                className="mt-2 inline-flex items-center justify-center rounded-full bg-linear-to-br from-gold-400 via-gold-600 to-gold-deep px-6.5 py-3 text-[0.9rem] font-semibold text-[#1a1204] shadow-gold"
              >
                Sign In
              </Link>
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;