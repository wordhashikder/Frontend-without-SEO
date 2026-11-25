import type { ServiceKey } from "@/lib/types";

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
