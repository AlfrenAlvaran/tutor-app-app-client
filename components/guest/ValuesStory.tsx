import { VALUES } from "@/constant/guest";
import type { ValuesStoryProps } from "@/constant/guest/props";
import RevealOnScroll from "../shared/RevealOnScroll";


export default function ValuesStory({ id = "values" }: ValuesStoryProps) {
  return (
    <section id={id} className="relative bg-navy-950 py-16 sm:py-24">
      <div className="mx-auto max-w-225 px-5 sm:px-7">
        <div className="relative flex flex-col gap-16 sm:gap-24">
          {/* connecting spine */}
          <span className="pointer-events-none absolute left-1/2 top-0 bottom-0 hidden w-px -translate-x-1/2 bg-linear-to-b from-transparent via-gold-600/25 to-transparent sm:block" />

          {VALUES.map((value, index) => {
            const reversed = index % 2 === 1;
            return (
              <RevealOnScroll key={value.label}>
                <div
                  className={`relative z-1 flex flex-col items-center gap-6 text-center sm:flex-row sm:gap-12 sm:text-left ${
                    reversed ? "sm:flex-row-reverse sm:text-right" : ""
                  }`}
                >
                  <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-[1.5px] border-gold-600 bg-navy-900">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-9 w-9 stroke-gold-400"
                    >
                      {value.path}
                    </svg>
                  </span>

                  <div className="max-w-115">
                    <span className="mb-1.5 block font-display text-[0.78rem] font-bold uppercase tracking-[0.16em] text-gold-500/70">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <h3 className="mb-2.5 font-display text-[1.5rem] font-bold text-cream sm:text-[1.7rem]">
                      {value.label}
                    </h3>
                    <p className="leading-relaxed text-ink-soft">
                      {value.description}
                    </p>
                  </div>
                </div>
              </RevealOnScroll>
            );
          })}
        </div>
      </div>
    </section>
  );
}