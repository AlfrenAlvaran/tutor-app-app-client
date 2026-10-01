import { SERVICES as DEFAULT_SERVICES } from "@/constant/guest";
import { ServiceProps } from "@/constant/guest/props";
import ServiceCard from "../shared/ServiceCard";

export default function Services({
  id = "services",
  eyebrow = "Our Services",
  title = "Support for every kind of learner",
  description = "From first-grade reading to graduate research, our tutors meet learners exactly where they are.",
  services = DEFAULT_SERVICES,
}: ServiceProps) {
  return (
    <section id={id} className="bg-navy-900 py-27.5">
      <div className="mx-auto max-w-295 px-7">
        <div className="mb-16 text-center">
          <span className="mb-4.5 inline-block rounded-full border border-gold-600 bg-linear-to-br from-gold-400/14 to-gold-600/8 px-8.5 py-2.5 font-display text-[0.95rem] font-bold uppercase tracking-[0.18em] text-gold-400">
            {eyebrow}
          </span>
          <h2 className="font-display text-[clamp(1.9rem,3vw,2.5rem)]">
            {title}
          </h2>
          <p className="mx-auto mt-3.5 max-w-140 text-[1.02rem] leading-relaxed text-ink-soft">
            {description}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5.5 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service, index) => (
            <ServiceCard key={service.title} service={service} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
