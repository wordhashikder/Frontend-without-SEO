import type { AccreditationScheme, ServiceKey } from "@/lib/types";

/** Display labels for API enum keys. */
export const serviceLabels: Record<ServiceKey, string> = {
  ev_charger_installation: "EV Charger Installation",
  domestic_electrical: "Domestic Electrical",
  commercial_electrical: "Commercial Electrical",
  electrical_repairs: "Electrical Repairs",
  solar_battery: "Solar & Battery",
  smart_home: "Smart Home",
  eicr_testing: "EICR & Testing",
};

export const accreditationLabels: Record<
  AccreditationScheme,
  { title: string; text: string }
> = {
  ozev: {
    title: "OZEV Approved",
    text: "Authorised to install EV charge points under the UK government's OZEV grant schemes.",
  },
  napit: {
    title: "NAPIT Registered",
    text: "Registered with NAPIT, a government-authorised Competent Person Scheme operator.",
  },
  niceic: {
    title: "NICEIC Approved",
    text: "Assessed by NICEIC against the requirements of BS 7671 (the IET Wiring Regulations).",
  },
  trustmark: {
    title: "TrustMark Registered",
    text: "Registered with TrustMark, the UK Government-endorsed quality scheme for work in and around the home.",
  },
  mcs: {
    title: "MCS Certified",
    text: "Certified under MCS for small-scale renewable and low-carbon technologies.",
  },
  elecsa: {
    title: "ELECSA Registered",
    text: "Registered with ELECSA, a Competent Person Scheme for electrical work.",
  },
};
