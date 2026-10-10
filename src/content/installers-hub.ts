import type { FaqItem } from "@/components/sections/faq";

/**
 * Copy for the EV charger installers hub (/uk/ev-charger-installers/).
 * Written for this page only, so none of it repeats other pages.
 */

export const hubTrust = [
  {
    key: "vetted",
    title: "Vetted before listing",
    text: "Qualifications and insurance are checked before an electrician appears here.",
  },
  {
    key: "quotes",
    title: "One request, up to 5 quotes",
    text: "Describe the job once and local installers reply with their prices.",
  },
  {
    key: "local",
    title: "Installers on your doorstep",
    text: "Browse by town, or let your postcode find who covers your street.",
  },
] as const;

export const hubChoosing = [
  {
    key: "qualifications",
    title: "Check qualifications",
    text: "Ask which competent person scheme they belong to, such as NICEIC or NAPIT, and whether they are OZEV-authorised if a grant applies.",
  },
  {
    key: "experience",
    title: "Look for experience",
    text: "Chargers are a specialist job. Ask how many they fit each month and which brands they know well.",
  },
  {
    key: "quotes",
    title: "Compare quotes",
    text: "Line up two or three written quotes and check each one covers the cable route, testing and certificate.",
  },
  {
    key: "insurance",
    title: "Check insurance",
    text: "A good installer carries public liability cover and guarantees their workmanship in writing.",
  },
] as const;

export const hubServices = [
  {
    key: "home",
    title: "Home charger installation",
    text: "A wall or post charger on your drive, fitted and certified.",
  },
  {
    key: "workplace",
    title: "Workplace charging",
    text: "Charge points for staff and visitor car parks.",
  },
  {
    key: "replacement",
    title: "Charger replacement",
    text: "Swap a faulty or older unit for a new smart charger.",
  },
  {
    key: "commercial",
    title: "Commercial installation",
    text: "Multi-bay and rapid charging for fleets and public sites.",
  },
] as const;

export const hubFaqs: FaqItem[] = [
  {
    question: "How do I find EV charger installers near me?",
    answer:
      "Pick your town or city from the list on this page to see the installers who cover it, or enter your postcode above. Your postcode lets us match you with installers whose service area includes your address, even if you live between two towns.",
  },
  {
    question: "How many quotes will I receive?",
    answer:
      "Each request goes to as many as 5 suitable installers. In busy cities you will usually hear from several; in rural areas fewer installers may cover your address, so you may receive one or two.",
  },
  {
    question: "How much does EV charger installation cost?",
    answer:
      "The price depends mostly on the charger you choose, the distance between your fuse box and the charging spot, and whether your consumer unit or earthing needs work. Comparing written quotes for the same job is the quickest way to see a fair price for your home.",
  },
  {
    question: "What qualifications should an installer have?",
    answer:
      "Look for a registered electrician in a competent person scheme such as NICEIC or NAPIT, who follows the IET Code of Practice for EV charging. They should register the work with Building Control and give you an electrical installation certificate when they finish.",
  },
  {
    question: "Do I need a qualified electrician?",
    answer:
      "Yes. A charger needs its own circuit and the right protection, and the work must meet the wiring regulations. Only a qualified electrician can certify the installation safely, and your warranty or home insurance may depend on it.",
  },
  {
    question: "Can I choose a specific charger brand?",
    answer:
      "Yes. Tell installers which charger you want when you request quotes, or ask them to recommend one. Many installers fit several brands, and they can check the model you like suits your car and your electricity supply.",
  },
];
