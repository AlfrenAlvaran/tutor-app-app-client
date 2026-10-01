
import GalleryPage from "@/components/gallery/GalleryPage";
import Programs from "@/components/guest/Programs";
import Services from "@/components/guest/Services";
import Hero from "@/components/shared/Hero";
import ValueBadge from "@/components/shared/ValueBadge";
import { VALUES } from "@/constant/guest";

const page = () => {
  return (
    <div>
      <Hero
        id="about-hero"
        eyebrow="Our Story"
        titlePrimary="About "
        titleAccent="ExcelEd"
        subtitle="Meet the Team"
        tagline="Educators who care."
        scriptLine=""
        showScrollCue={false}
      />

      <Services />
      <Programs />

      <section
        className="border-y border-gold-600/25"
        style={{
          background: "linear-gradient(180deg, #060e24, #0a1836)",
        }}
      >
        {" "}
        <div className="mx-auto max-w-295 px-7">
          <div className="flex flex-wrap justify-center gap-7 py-11 sm:justify-between">
            {VALUES.map((value) => (
              <ValueBadge key={value.label} value={value} />
            ))}
          </div>
        </div>
      </section>

      <GalleryPage />
    </div>
  );
};

export default page;
