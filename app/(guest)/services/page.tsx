import Header from "@/components/guest/Header";

import ServicesHero from "@/components/guest/ServicesHero";
import ServicesExplorer from "@/components/guest/ServicesExplorer";
import ServicesFAQ from "@/components/guest/ServicesFAQ";
import CTABanner from "@/components/ui/CTABanner";

export default function ServicesPage() {
  return (
    <>
      <Header />
      <main className="bg-navy-950">
        <ServicesHero />
        <ServicesExplorer />
        <ServicesFAQ />
        <CTABanner />
      </main>
    </>
  );
}
