import type { FaqItem } from "@/components/sections/faq";
import { plans } from "@/content/plans";
import { site } from "@/lib/site";

/*
 * Questions come from the Figma designs; answers follow the product rules.
 * Each answer opens with the direct answer so it can be quoted on its own by
 * search and AI answer engines. Keep them factual: no promises about response
 * times, prices or guarantees that the product does not make.
 */

const price = (key: string) => {
  const plan = plans.find((item) => item.key === key);
  return plan ? `£${plan.price} per month` : "";
};

export const homeownerFaqs: FaqItem[] = [
  {
    question: "Is PickASparky free to use for homeowners?",
    answer:
      "Yes, PickASparky is free for homeowners. There is no charge to request or compare quotes and no obligation to accept any of them. You only pay the electrician you choose, for the work you agree with them.",
  },
  {
    question: "How does PickASparky work?",
    answer:
      "PickASparky matches your request with up to 5 vetted, local installers so you can compare quotes. Enter your postcode, answer six short questions about the work and add your contact details. We pass your request to installers whose service area covers your postcode, and you choose who to work with.",
  },
  {
    question: "How many quotes will I receive?",
    answer:
      "You can receive up to 5 quotes for each request. We match your request with up to 5 installers whose service area covers your postcode, so the exact number depends on how many suitable installers are available near you and how many respond.",
  },
  {
    question: "Do you share my contact details with electricians?",
    answer:
      "Yes, but only with the installers matched to your request. They need your details to respond with a quote, and you give your consent before the request is sent. If you ask for a quote from an installer's profile page, your details go to that installer only.",
  },
  {
    question: "Am I obligated to hire an electrician?",
    answer:
      "No, there is no obligation to hire anyone. Requesting quotes is free, and you can accept one, ask for more information or decide not to go ahead at all.",
  },
  {
    question: "Are the electricians vetted?",
    answer:
      "Yes, installers are vetted before they receive enquiries through PickASparky. Our checks cover business verification through Companies House, qualifications and accreditations (such as NICEIC, NAPIT, MCS and OZEV where applicable), services and experience, and coverage area, followed by ongoing monitoring. We still recommend confirming an installer's credentials yourself before work begins.",
  },
  {
    question: "What types of electrical work can I get quotes for?",
    answer:
      "You can request quotes for EV charger installation: a new home charger, replacing or adding to an existing charger, and workplace or commercial charging. Installers can also list other electrical services on their profile, such as domestic and commercial electrical work, repairs, solar and battery storage, smart home installations, and EICR and testing.",
  },
  {
    question: "How quickly will I receive quotes?",
    answer:
      "Response times vary by installer, but your request is sent to matched installers as soon as you submit it. How quickly each one replies depends on their availability, so we can't promise an exact time. Telling us when you would like the work done helps installers prioritise your request.",
  },
  {
    question: "Can I choose which electrician to work with?",
    answer:
      "Yes, the choice is always yours. PickASparky does not pick an electrician for you: you compare the quotes, reviews and accreditations, then decide who to hire.",
  },
  {
    question: "What if I have a problem after the work is completed?",
    answer: `Contact the electrician who carried out the work first, because your agreement for the work is with them. PickASparky is an independent marketplace that does not carry out electrical work or employ electricians. If the issue is not resolved, the installer's accreditation scheme may be able to help through its complaints process, and you can tell us at ${site.email} so we can take it into account in our ongoing monitoring.`,
  },
];

const installer = {
  join: {
    question: "How do I join PickASparky as an electrician?",
    answer:
      "You join by creating an installer account and choosing a membership plan. Then build your profile with your business details, services, coverage area and accreditations. We review your information to verify your business before your listing goes live.",
  },
  cost: {
    question: "Is there a cost to join?",
    answer: `No, joining is free: the Free plan costs ${price("free")} and gets your business listed. Paid plans add more, with Pro at ${price("pro")} and Premium at ${price("premium")}. Payments are handled by Stripe and there are no long-term contracts.`,
  },
  enquiries: {
    question: "How do I receive enquiries?",
    answer:
      "We notify you when a homeowner in your coverage area requests quotes. Each enquiry includes the details of the job and the homeowner's contact details so you can respond with a quote. Receiving and responding to enquiries is included in the Pro and Premium plans.",
  },
  profile: {
    question: "What information should I include in my profile?",
    answer:
      "Include your business details, the services you offer, the areas you cover and your accreditations, such as NICEIC, NAPIT, MCS or OZEV. A clear description, your years of experience and photos of recent work help homeowners compare you with other installers. Accurate details also help us verify your business.",
  },
  jobTypes: {
    question: "Can I choose the types of jobs I receive?",
    answer:
      "Yes, you choose the types of work you want to receive enquiries for. Select the services you offer on your profile, from EV charger installations to domestic, commercial and other electrical work, and set the area you cover.",
  },
  accept: {
    question: "Do I have to accept every enquiry?",
    answer:
      "No, you decide which enquiries to respond to. There is no obligation to quote for every request, so you can take on new work when it suits your availability.",
  },
  details: {
    question: "How are homeowners' details shared?",
    answer:
      "A homeowner's contact details are shared only with the installers matched to their request, with the homeowner's consent. When a homeowner requests a quote from your profile page, their details are sent to you alone. Please use them only to respond to that enquiry.",
  },
  areas: {
    question: "What areas can I cover?",
    answer:
      "You can cover any part of the UK that your business is able to serve. Your coverage area is set as part of your profile, and we match you with requests from postcodes inside it. Coverage is checked when we verify your business.",
  },
  update: {
    question: "Can I update my profile later?",
    answer: `Yes, you can update your profile after you join. Keep your services, coverage area and accreditations up to date so homeowners see accurate information. If you need help making a change, email ${site.email}.`,
  },
  support: {
    question: "Who can I contact for support?",
    answer: `Email ${site.email} and our support team will help. We are available Monday to Friday, 9:00am to 5:00pm UK time, and aim to reply within 1 working day. You can also send us a message from the Contact page.`,
  },
} satisfies Record<string, FaqItem>;

/** All ten installer questions, in the order shown on /faq. */
export const installerFaqs: FaqItem[] = [
  installer.join,
  installer.cost,
  installer.enquiries,
  installer.profile,
  installer.jobTypes,
  installer.accept,
  installer.details,
  installer.areas,
  installer.update,
  installer.support,
];

/**
 * The six questions on /join. The two-column grid fills row by row, so this
 * order puts join, cost and enquiries in the left column as designed.
 */
export const joinFaqs: FaqItem[] = [
  installer.join,
  installer.accept,
  installer.cost,
  installer.profile,
  installer.enquiries,
  installer.support,
];
