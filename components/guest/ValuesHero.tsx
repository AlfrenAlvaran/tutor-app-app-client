import Link from "next/link";
import type { ValuesHeroProps } from "@/constant/guest/props";
import StarField from "../shared/StarField";

export default function ValuesHero({
  eyebrow = "Our Values",
  title = "What guides every lesson we teach",
  description = "These aren't words on a wall — they're how we choose tutors, design lessons, and talk to parents. Here's what each one actually means in practice.",
}: ValuesHeroProps) {
  return (
    <section
      className="relative overflow-hidden pt-32 pb-16 sm:pt-40 sm:pb-20"
      style={{
        background:
          "radial-gradient(ellipse 800px 400px at 85% 0%, rgba(201,162,39,0.08), transparent 60%), linear-gradient(180deg, #060e24 0%, #0a1836 100%)",
      }}
    >
        <StarField />
      <div className="relative z-1 mx-auto max-w-295 px-5 sm:px-7 text-center">
        <nav className="mb-6 flex items-center justify-center gap-2 text-[0.78rem] text-ink-faint">
          <Link href="/" className="transition-colors duration-200 hover:text-gold-400">
            Home
          </Link>
          <span>/</span>
          <span className="text-gold-400">Values</span>
        </nav>

        <span className="mb-4.5 inline-block rounded-full border border-gold-600 bg-linear-to-br from-gold-400/14 to-gold-600/8 px-8.5 py-2.5 font-display text-[0.85rem] font-bold uppercase tracking-[0.18em] text-gold-400">
          {eyebrow}
        </span>

        <h1 className="mx-auto max-w-160 font-display text-[clamp(2.2rem,5vw,3.4rem)] font-extrabold leading-[1.1] text-cream">
          {title}
        </h1>

        <p className="mx-auto mt-4.5 max-w-140 text-[1.02rem] leading-relaxed text-ink-soft">
          {description}
        </p>
      </div>
    </section>
  );
}