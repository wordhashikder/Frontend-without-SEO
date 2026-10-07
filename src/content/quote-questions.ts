import type {
  ChargerFollowup,
  ChargerLocation,
  ExistingCharger,
  FuseBoxDistance,
  InstallationType,
  InstallTiming,
} from "@/lib/types";

/**
 * The "Get free quotes" questionnaire, taken from the client's
 * "EV Charger Free Quote Questionnaire & Branching Flow" (V1).
 *
 * Labels are the client's wording; `value` is the API enum key. This file is
 * shared by the browser (to render the steps) and the Server Action (to
 * validate the answers), so the two can never disagree about what is allowed.
 */

export type Option<T extends string = string> = { value: T; label: string };

const values = <T extends string>(options: readonly Option<T>[]) =>
  options.map((option) => option.value) as [T, ...T[]];

// ---- Start: postcode --------------------------------------------------------

export const postcodeStep = {
  title: "What's your postcode?",
  label: "Postcode",
  placeholder: "e.g. BR1 2AB",
  button: "Find EV charger installers",
} as const;

// ---- 1. Installation type ---------------------------------------------------

export const installationType = {
  title: "What type of EV charger installation do you need?",
  options: [
    { value: "new_home", label: "New home EV charger" },
    { value: "replace_existing", label: "Replace an existing charger" },
    { value: "additional", label: "Additional charger" },
    { value: "workplace_commercial", label: "Workplace/commercial charger" },
    { value: "not_sure", label: "I'm not sure" },
  ] satisfies Option<InstallationType>[],
};

// ---- 2. Charger location ----------------------------------------------------

export const chargerLocation = {
  title: "Where would you like your charger installed?",
  options: [
    { value: "house_wall", label: "House wall" },
    { value: "garage", label: "Garage" },
    { value: "detached_garage", label: "Detached garage/outbuilding" },
    { value: "post_pedestal", label: "Post/pedestal by the parking space" },
    { value: "workplace_commercial", label: "Workplace/commercial property" },
    { value: "other", label: "Other" },
    { value: "not_sure", label: "I'm not sure" },
  ] satisfies Option<ChargerLocation>[],
};

// ---- 3. Existing charger (the only branching question) ----------------------

export const existingCharger = {
  title: "Do you already have an EV charger installed?",
  options: [
    { value: "no", label: "No" },
    { value: "replace", label: "Yes - I want to replace it" },
    { value: "add_another", label: "Yes - I want to add another charger" },
  ] satisfies Option<ExistingCharger>[],
};

const chosenOrBought: Option<ChargerFollowup>[] = [
  { value: "already_bought", label: "Yes, I've already bought one" },
  {
    value: "chosen_not_bought",
    label: "I know which charger I want, but haven't bought it yet",
  },
  {
    value: "installer_recommend",
    label: "I'd like the installer to recommend one",
  },
  { value: "not_sure", label: "I'm not sure yet" },
];

/** Exactly one of these follow-ups is shown, chosen by the answer to Question 3. */
export const chargerFollowup: Record<
  ExistingCharger,
  { title: string; options: Option<ChargerFollowup>[] }
> = {
  no: {
    title: "Have you already chosen or bought a charger?",
    options: chosenOrBought,
  },
  replace: {
    title: "What would you like the installer to do?",
    options: [
      {
        value: "fit_customer_charger",
        label: "Replace it with a charger I've already bought",
      },
      {
        value: "supply_and_install",
        label: "Supply and install a new charger",
      },
      {
        value: "recommend_replacement",
        label: "Recommend a suitable replacement",
      },
      { value: "not_sure", label: "I'm not sure" },
    ],
  },
  add_another: {
    title: "Have you chosen the additional charger?",
    options: chosenOrBought,
  },
};

/** True when `followup` is one of the answers offered for that branch. */
export function isFollowupAllowed(
  existing: ExistingCharger,
  followup: string,
): followup is ChargerFollowup {
  return chargerFollowup[existing].options.some(
    (option) => option.value === followup,
  );
}

// ---- 4. Fuse box distance ---------------------------------------------------

export const fuseBoxDistance = {
  title:
    "Where is your fuse box in relation to where you'd like the charger installed?",
  options: [
    { value: "very_close", label: "Very close / same garage" },
    { value: "inside_house", label: "Inside the house" },
    { value: "under_10m", label: "Less than 10 metres away" },
    { value: "over_10m", label: "More than 10 metres away" },
    { value: "not_sure", label: "I'm not sure" },
  ] satisfies Option<FuseBoxDistance>[],
};

// ---- 5. Vehicle (optional) --------------------------------------------------

export const vehicleStep = {
  title: "What vehicle do you have or are you getting?",
  label: "Vehicle make/model",
  placeholder: "e.g. Tesla Model Y",
  undecidedLabel: "I haven't chosen my vehicle yet",
} as const;

// ---- 6. Timing + optional notes ---------------------------------------------

export const timing = {
  title: "When would you like the charger installed?",
  options: [
    { value: "asap", label: "As soon as possible" },
    { value: "within_2_weeks", label: "Within 2 weeks" },
    { value: "within_month", label: "Within a month" },
    { value: "one_to_three_months", label: "Within 1-3 months" },
    { value: "researching", label: "I'm just researching prices" },
  ] satisfies Option<InstallTiming>[],
};

export const notesField = {
  label: "Anything else you'd like the installer to know?",
  hint: "For example: preferred charger, unusual cable route, solar panels, detached garage or a second EV.",
} as const;

// ---- Final step: contact details + consent ----------------------------------

export const contactStep = {
  title: "Where should we send your quotes?",
  firstName: "First name",
  email: "Email",
  phone: "Phone number",
  consent:
    "I agree to PickASparky sharing my request with matched installers so they can provide quotes.",
  button: "Get up to 5 free quotes",
} as const;

// ---- Enum keys for validation -----------------------------------------------

export const quoteEnums = {
  installation_type: values(installationType.options),
  charger_location: values(chargerLocation.options),
  existing_charger: values(existingCharger.options),
  charger_followup: [
    ...new Set(
      Object.values(chargerFollowup).flatMap((branch) =>
        branch.options.map((option) => option.value),
      ),
    ),
  ] as [ChargerFollowup, ...ChargerFollowup[]],
  fuse_box_distance: values(fuseBoxDistance.options),
  timing: values(timing.options),
};

// ---- Steps ------------------------------------------------------------------

/** Screens in the order they are shown. One follow-up screen is always shown. */
export const stepOrder = [
  "postcode",
  "installation_type",
  "charger_location",
  "existing_charger",
  "charger_followup",
  "fuse_box_distance",
  "vehicle",
  "timing",
  "contact",
] as const;

export type StepId = (typeof stepOrder)[number];

/** Number of main questions the customer is told about ("Question 3 of 6"). */
export const QUESTION_COUNT = 6;

/** Which main question a screen belongs to (the follow-up is part of Question 3). */
export const questionNumber: Partial<Record<StepId, number>> = {
  installation_type: 1,
  charger_location: 2,
  existing_charger: 3,
  charger_followup: 3,
  fuse_box_distance: 4,
  vehicle: 5,
  timing: 6,
};

/** Every field sent to the API, and the screen where the customer can fix it. */
export const fieldStep = {
  postcode: "postcode",
  installation_type: "installation_type",
  charger_location: "charger_location",
  existing_charger: "existing_charger",
  charger_followup: "charger_followup",
  fuse_box_distance: "fuse_box_distance",
  vehicle: "vehicle",
  vehicle_undecided: "vehicle",
  timing: "timing",
  notes: "timing",
  first_name: "contact",
  email: "contact",
  phone: "contact",
  consent: "contact",
} as const satisfies Record<string, StepId>;

export type QuoteField = keyof typeof fieldStep;
export type QuoteFieldErrors = Partial<Record<QuoteField, string>>;

export const isQuoteField = (key: string): key is QuoteField =>
  Object.hasOwn(fieldStep, key);

// ---- Limits and format checks shared by client and server --------------------

export const quoteLimits = {
  vehicle: 120,
  notes: 1000,
  firstName: 60,
  email: 254,
} as const;

/** Simple shape check; the server (zod) and the API make the final decision. */
export function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
}

/** UK-style phone number: 10 to 15 digits once spaces, +, brackets and dashes are removed. */
export function isPhone(value: string) {
  const trimmed = value.trim();
  if (!/^[\d\s+()-]+$/.test(trimmed)) return false;
  const digits = trimmed.replace(/\D/g, "");
  return digits.length >= 10 && digits.length <= 15;
}

export const quoteMessages = {
  postcodeRequired: "Enter your postcode to find installers near you.",
  postcodeFormat: "Enter a full UK postcode, for example M1 1AA.",
  postcodeNotFound: "We couldn't find that postcode",
  choose: "Choose an option to continue.",
  vehicleLength: `Please keep this under ${quoteLimits.vehicle} characters.`,
  notesLength: `Please keep this under ${quoteLimits.notes} characters.`,
  firstName: "Enter your first name.",
  firstNameLength: `Please keep your name under ${quoteLimits.firstName} characters.`,
  email: "Enter a valid email address, for example name@example.com.",
  phone: "Enter a phone number installers can reach you on.",
  consent: "Please tick the box so we can share your request with installers.",
} as const;
