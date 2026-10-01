
import { EXPLORE_LINKS as DEFAULT_LINKS } from "@/constant/guest";
import type { FooterProps } from "@/constant/guest/props";
import FooterLink from "./FooterLink";
import CopyEmail from "./CopyEmail";
import BackToTop from "./BackToTop";

export default function Footer({
  exploreLinks = DEFAULT_LINKS,
  email = "hello@exceled.tutorials",
  hours = "Monday – Saturday",
  location = "Makati City, Philippines",
  establishedYear = 2025,
  tagline = "Let's grow together!",
}: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative border-t border-gold-600/25 bg-navy-950 pb-8 pt-16">
      <div className="mx-auto max-w-295 px-7">
        <div className="mb-11 flex flex-wrap justify-between gap-10">
          <div>
            <a href="#top" className="group flex items-center gap-3">
              <span className="flex h-9.5 w-9.5 shrink-0 items-center justify-center rounded-full border-[1.5px] border-gold-600 font-display text-lg font-bold text-gold-400 transition-transform duration-300 group-hover:rotate-12">
                E
              </span>
              <span className="font-display text-[1.28rem] font-bold tracking-tight">
                Excel<span className="text-gold-500">Ed</span>
              </span>
            </a>
            <p className="mt-3.5 max-w-80 text-[0.88rem] leading-[1.65] text-ink-faint">
              Where learning comes to life. We teach. We inspire. We
              transform lives.
            </p>
          </div>

          <div className="flex flex-wrap gap-16">
            <div>
              <h4 className="mb-4 font-display text-[0.95rem] tracking-wide text-gold-400">
                Explore
              </h4>
              {exploreLinks.map((link) => (
                <FooterLink key={link.href} href={link.href} label={link.label} />
              ))}
            </div>
            <div>
              <h4 className="mb-4 font-display text-[0.95rem] tracking-wide text-gold-400">
                Get in touch
              </h4>
              <CopyEmail email={email} />
              <p className="mb-2.5 text-[0.86rem] text-ink-soft">{hours}</p>
              <p className="mb-2.5 text-[0.86rem] text-ink-soft">{location}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap justify-between gap-3 border-t border-gold-600/25 pt-6.5 text-[0.78rem] text-ink-faint">
          <span>
            © {currentYear} ExcelEd Tutorial Services. Established{" "}
            {establishedYear}.
          </span>
          <span className="font-script text-[1.1rem] text-gold-400">
            {tagline}
          </span>
        </div>
      </div>

      <BackToTop />
    </footer>
  );
}