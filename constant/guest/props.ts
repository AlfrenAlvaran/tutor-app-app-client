import { ServiceItem, TrustItem, ValueItem } from ".";

export type CTA = {
  label: string;
  href: string;
  variant?: "primary" | "secondary";
};

export type HeroProps = {
  id?: string;
  eyebrow?: string;
  titlePrimary?: string;
  titleAccent?: string;
  subtitle?: string;
  tagline?: string;
  scriptLine?: string;
  trustItems?: TrustItem[];
  ctas?: CTA[];
  showScrollCue?: boolean;
  showStarField?: boolean;
};

export type ServiceProps = {
  id?: string;
  eyebrow?: string;
  title?: string;
  description?: string;
  services?: ServiceItem[];
};

export type ProgramsProps = {
  id?: string;
  eyebrow?: string;
  title?: string;
  description?: string;
  programs?: string[];
  columns?: 2 | 3 | 4;
  searchable?: boolean;
};
export type ValuesProps = {
  id?: string;
  values?: ValueItem[];
};

export type EnrollProps = {
  id?: string;
  eyebrow?: string;
  title?: string;
  description?: string;
  onSubmitted?: () => void;
};

import type { FAQItem, FooterLink } from "@/constant/guest";

export type FooterProps = {
  exploreLinks?: FooterLink[];
  email?: string;
  hours?: string;
  location?: string;
  establishedYear?: number;
  tagline?: string;
};

export type ServicesHeroProps = {
  eyebrow?: string;
  title?: string;
  description?: string;
};

export type ServicesExplorerProps = {
  id?: string;
};

export type ServicesFAQProps = {
  id?: string;
  eyebrow?: string;
  title?: string;
};

export type CTABannerProps = {
  title?: string;
  description?: string;
  primaryLabel?: string;
  primaryHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
};

export type ValuesHeroProps = {
  eyebrow?: string;
  title?: string;
  description?: string;
};

export type ValuesStoryProps = {
  id?: string;
};

export type FAQSectionProps = {
  id?: string;
  eyebrow?: string;
  title?: string;
  faqs: FAQItem[];
};


export type EnrollHeroProps = {
  eyebrow?: string;
  title?: string;
  description?: string;
};