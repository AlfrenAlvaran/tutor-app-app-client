import type { CTABannerProps } from "@/constant/guest/props";

export default function CTABanner({
  title = "Ready to get started?",
  description = "Tell us what you're looking for and we'll match you with the right tutor within 1–2 business days.",
  primaryLabel = "Enroll Online",
  primaryHref = "/enroll",
  secondaryLabel = "Back to Home",
  secondaryHref = "/",
}: CTABannerProps) {
  return (
    <section className="bg-navy-900 px-5 pb-20 sm:px-7">
      <div
        className="relative mx-auto max-w-295 overflow-hidden rounded-4 border border-gold-600/30 px-7 py-14 text-center sm:px-14"
        style={{
          background:
            "radial-gradient(ellipse 500px 260px at 50% 0%, rgba(201,162,39,0.12), transparent 70%), linear-gradient(160deg, #122448, #0a1836)",
        }}
      >
        <h2 className="mx-auto max-w-125 font-display text-[clamp(1.7rem,3.4vw,2.4rem)] font-bold text-cream">
          {title}
        </h2>
        <p className="mx-auto mt-3.5 max-w-105 leading-relaxed text-ink-soft">
          {description}
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3.5">
          <a
            href={primaryHref}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-linear-to-br from-gold-400 via-gold-600 to-gold-deep px-7 py-3.25 text-[0.92rem] font-semibold text-[#1a1204] shadow-gold transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-gold-lg"
          >
            {primaryLabel}
          </a>
          <a
            href={secondaryHref}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-gold-600/25 bg-white/2 px-7 py-3.25 text-[0.92rem] font-semibold text-cream transition-colors duration-200 hover:border-gold-500 hover:bg-gold-600/10"
          >
            {secondaryLabel}
          </a>
        </div>
      </div>
    </section>
  );
}