import { EnrollHeroProps } from "@/constant/guest/props";
import Link from "next/link";
import StarField from "../shared/StarField";

export default function EnrollHero({
  eyebrow = "Get Started",
  title = "Enroll online in a few minutes",
  description = "Fill out the form below and our team will match you with the right tutor and schedule — no payment required to reserve your spot.",
}: EnrollHeroProps) {
  return (
    <section
      className="relative overflow-hidden pt-32 pb-14 sm:pt-40 sm:pb-16"
      style={{
        background:
          "radial-gradient(ellipse 800px 400px at 50% 0%, rgba(201,162,39,0.09), transparent 60%), linear-gradient(180deg, #060e24 0%, #0a1836 100%)",
      }}
    >
        <StarField />
      <div className="relative z-1 mx-auto max-w-295 px-5 sm:px-7 text-center">
        <nav className="mb-6 flex items-center justify-center gap-2 text-[0.78rem] text-ink-faint">
          <Link href="/" className="transition-colors duration-200 hover:text-gold-400">
            Home
          </Link>
          <span>/</span>
          <span className="text-gold-400">Enroll</span>
        </nav>

        <span className="mb-4.5 inline-block rounded-full border border-gold-600 bg-linear-to-br from-gold-400/14 to-gold-600/8 px-8.5 py-2.5 font-display text-[0.85rem] font-bold uppercase tracking-[0.18em] text-gold-400">
          {eyebrow}
        </span>

        <h1 className="mx-auto max-w-150 font-display text-[clamp(2.2rem,5vw,3.2rem)] font-extrabold leading-[1.1] text-cream">
          {title}
        </h1>

        <p className="mx-auto mt-4.5 max-w-135 text-[1.02rem] leading-relaxed text-ink-soft">
          {description}
        </p>
      </div>
    </section>
  );
}