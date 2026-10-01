
import type { FAQSectionProps } from "@/constant/guest/props";
import FAQItem from "../ui/FAQItem";

export default function FAQSection({
  id = "faq",
  eyebrow = "Questions",
  title = "Good to know",
  faqs,
}: FAQSectionProps) {
  return (
    <section id={id} className="bg-navy-950 py-16 sm:py-24">
      <div className="mx-auto max-w-160 px-5 sm:px-7">
        <div className="mb-11 text-center">
          <span className="mb-4.5 inline-block rounded-full border border-gold-600 bg-linear-to-br from-gold-400/14 to-gold-600/8 px-8.5 py-2.5 font-display text-[0.85rem] font-bold uppercase tracking-[0.18em] text-gold-400">
            {eyebrow}
          </span>
          <h2 className="font-display text-[clamp(1.9rem,3vw,2.5rem)] text-cream">
            {title}
          </h2>
        </div>

        <div className="rounded-3 border border-gold-600/25 px-6 sm:px-9">
          {faqs.map((item) => (
            <FAQItem key={item.question} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}