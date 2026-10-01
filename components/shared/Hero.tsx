import { TRUST_ITEMS } from "@/constant/guest";
import { HeroProps } from "@/constant/guest/props";
import React from "react";
import StarField from "./StarField";
import TrustBadge from "./TrustBadge";
import CTAButton from "./CTAButton";

const Hero = ({
  id = "top",
  eyebrow = "Established in 2025",
  titlePrimary = "Excel",
  titleAccent = "Ed",
  subtitle = "Tutorial Services",
  tagline = "Where learning comes to life.",
  scriptLine = "Empowering minds. Inspiring futures.",
  trustItems = TRUST_ITEMS,
  ctas = [
    { label: "Enroll Online", href: "#enroll", variant: "primary" },
    { label: "Explore Programs", href: "#services", variant: "secondary" },
  ],
  showScrollCue = true,
  showStarField = true,
}: HeroProps) => {
  return (
    <section
      className="relative flex min-h-screen items-center overflow-hidden pt-[90px] sm:pt-[110px]"
      style={{
        background:
          "radial-gradient(ellipse 900px 500px at 20% -10%, rgba(201,162,39,0.10), transparent 60%), radial-gradient(ellipse 700px 500px at 100% 10%, rgba(45,80,150,0.35), transparent 60%), linear-gradient(180deg, #060e24 0%, #0a1836 55%, #0d1e42 100%)",
      }}
    >
      {showStarField && <StarField />}
      <div className="relative z-2 mx-auto w-full max-w-925 px-5 sm:px-7 pb-16 text-center">
        {eyebrow && (
          <p className="mb-3.5 sm:mb-4.5 text-[0.68rem] sm:text-[0.72rem] font-semibold uppercase tracking-[0.24em] sm:tracking-[0.28em] text-gold-400">
            {eyebrow}
          </p>
        )}

        <h1 className="font-display text-[clamp(2.6rem,12vw,6.6rem)] font-extrabold leading-[0.98] tracking-tight">
          <span className="text-cream">{titlePrimary}</span>
          <span className="gold-text">{titleAccent}</span>
        </h1>

        {subtitle && (
          <p className="mt-2.5 font-display text-[clamp(1.2rem,4vw,2.1rem)] italic font-medium uppercase tracking-[0.1em] sm:tracking-[0.14em] text-ink-soft">
            {subtitle}
          </p>
        )}

        {tagline && (
          <p className="mt-[22px] text-[clamp(1.1rem,4vw,1.9rem)] font-semibold text-cream">
            {tagline}
          </p>
        )}

        {scriptLine && (
          <p className="mt-2 font-script text-[clamp(1.2rem,4vw,2rem)] text-gold-400">
            {scriptLine}
          </p>
        )}

        {trustItems.length > 0 && (
          <div className="mt-9 sm:mt-11 flex flex-wrap justify-center gap-x-6 gap-y-4 sm:gap-x-10 lg:gap-[52px]">
            {trustItems.map((item) => (
              <TrustBadge key={item.label} item={item} />
            ))}
          </div>
        )}

        {ctas.length > 0 && (
          <div className="mt-9 sm:mt-[46px] flex flex-wrap justify-center gap-3 sm:gap-[18px]">
            {ctas.map((cta) => (
              <CTAButton key={cta.label} {...cta} />
            ))}
          </div>
        )}
      </div>

      {showScrollCue && (
        <div className="absolute bottom-[18px] sm:bottom-[26px] left-1/2 z-2 flex -translate-x-1/2 flex-col items-center gap-2 text-[0.64rem] sm:text-[0.68rem] uppercase tracking-[0.2em] sm:tracking-[0.24em] text-ink-faint">
          <span>Scroll</span>
          <span className="h-7 sm:h-9 w-px animate-cuepulse bg-linear-to-b from-gold-500 to-transparent" />
        </div>
      )}
    </section>
  );
};

export default Hero;
