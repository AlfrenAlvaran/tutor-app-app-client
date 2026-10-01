import ValuesHero from "@/components/guest/ValuesHero";
import ValuesStory from "@/components/guest/ValuesStory";
import CTABanner from "@/components/ui/CTABanner";
import React from "react";

const page = () => {
  return (
    <div>
      <main className="bg-navy-950">
        <ValuesHero />
        <ValuesStory />
        <CTABanner
          title="Want to see these values in a session?"
          description="Meet a tutor, ask questions, and see how we put these principles into practice — no commitment required."
          primaryLabel="Enroll Online"
          secondaryLabel="Explore Programs"
          secondaryHref="/services"
        />
      </main>
    </div>
  );
};

export default page;
