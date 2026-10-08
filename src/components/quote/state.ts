import type { PostcodeCheck } from "@/actions/quote";
import {
  fieldStep,
  isEmail,
  isFollowupAllowed,
  isPhone,
  type QuoteField,
  type QuoteFieldErrors,
  quoteEnums,
  quoteLimits,
  quoteMessages,
  type StepId,
  stepOrder,
} from "@/content/quote-questions";
import type {
  ChargerFollowup,
  ChargerLocation,
  ExistingCharger,
  FuseBoxDistance,
  InstallationType,
  InstallTiming,
} from "@/lib/types";
import { isUkPostcode } from "@/lib/utils";

/*
 * State machine for the quote questionnaire. Pure functions only: the
 * component owns side effects (storage, history, focus, the Server Actions).
 */

export type Answers = {
  postcode: string;
  installation_type: InstallationType | "";
  charger_location: ChargerLocation | "";
  existing_charger: ExistingCharger | "";
  charger_followup: ChargerFollowup | "";
  fuse_box_distance: FuseBoxDistance | "";
  vehicle: string;
  vehicle_undecided: boolean;
  timing: InstallTiming | "";
  notes: string;
  first_name: string;
  email: string;
  phone: string;
  consent: boolean;
};

export type PostcodeInfo = {
  district: string | null;
  installersInRange: number | null;
  verified: boolean;
};

export type InstallerRef = { slug: string; name: string };

/** What the page learned from the URL the customer arrived on. */
export type QuoteEntry = {
  /** Outcome of checking `?postcode=` on the server; null when it was absent. */
  postcode: { value: string; check: PostcodeCheck } | null;
  /** `?type=` from the home page tiles: preselects Question 1. */
  installationType: InstallationType | null;
  /** `?installer=` from a profile page: the request goes to this installer. */
  installer: InstallerRef | null;
};

export type QuoteResult = {
  reference: string;
  postcode: string;
  matchedInstallers: number;
  firstName: string;
  email: string;
  /** Whether the customer gave a phone number (it is optional). */
  hasPhone: boolean;
};

export type FlowState = {
  /** True once any answers saved in this tab have been restored. */
  ready: boolean;
  step: StepId;
  /** Furthest screen reached, so changing the postcode can return there. */
  furthest: StepId;
  answers: Answers;
  postcodeInfo: PostcodeInfo | null;
  installer: InstallerRef | null;
  errors: QuoteFieldErrors;
  /** Message from the last failed submit. */
  formError: string | null;
  result: QuoteResult | null;
  /** Counts screen changes; drives focus management. */
  moves: number;
};

/** The part of the state kept in sessionStorage. Consent is never stored. */
export type SavedState = Pick<
  FlowState,
  "step" | "furthest" | "answers" | "postcodeInfo" | "installer"
>;

export type FlowAction =
  | { type: "restore"; saved: SavedState | null; entry: QuoteEntry }
  | { type: "set"; patch: Partial<Answers> }
  | { type: "postcode_confirmed"; check: Extract<PostcodeCheck, { ok: true }> }
  | { type: "next"; patch?: Partial<Answers> }
  | { type: "back" }
  | { type: "goto"; step: StepId }
  | { type: "errors"; errors: QuoteFieldErrors }
  | { type: "failed"; message: string; fieldErrors?: QuoteFieldErrors }
  | { type: "done"; result: QuoteResult };

const emptyAnswers: Answers = {
  postcode: "",
  installation_type: "",
  charger_location: "",
  existing_charger: "",
  charger_followup: "",
  fuse_box_distance: "",
  vehicle: "",
  vehicle_undecided: false,
  timing: "",
  notes: "",
  first_name: "",
  email: "",
  phone: "",
  consent: false,
};

const indexOf = (step: StepId) => stepOrder.indexOf(step);
const earlier = (a: StepId, b: StepId) => (indexOf(a) <= indexOf(b) ? a : b);
const later = (a: StepId, b: StepId) => (indexOf(a) >= indexOf(b) ? a : b);

// ---- Validation --------------------------------------------------------------

/** Client-side checks for one screen. The Server Action repeats all of them. */
export function validateStep(step: StepId, answers: Answers): QuoteFieldErrors {
  const errors: QuoteFieldErrors = {};
  switch (step) {
    case "postcode": {
      const value = answers.postcode.trim();
      if (!value) errors.postcode = quoteMessages.postcodeRequired;
      else if (!isUkPostcode(value))
        errors.postcode = quoteMessages.postcodeFormat;
      break;
    }
    case "installation_type":
    case "charger_location":
    case "existing_charger":
    case "fuse_box_distance":
      if (!answers[step]) errors[step] = quoteMessages.choose;
      break;
    case "charger_followup":
      if (
        !answers.existing_charger ||
        !isFollowupAllowed(answers.existing_charger, answers.charger_followup)
      ) {
        errors.charger_followup = quoteMessages.choose;
      }
      break;
    case "vehicle":
      if (answers.vehicle.trim().length > quoteLimits.vehicle) {
        errors.vehicle = quoteMessages.vehicleLength;
      }
      break;
    case "timing":
      if (!answers.timing) errors.timing = quoteMessages.choose;
      if (answers.notes.trim().length > quoteLimits.notes) {
        errors.notes = quoteMessages.notesLength;
      }
      break;
    case "contact": {
      const name = answers.first_name.trim();
      if (!name) errors.first_name = quoteMessages.firstName;
      else if (name.length > quoteLimits.firstName)
        errors.first_name = quoteMessages.firstNameLength;
      if (!isEmail(answers.email) || answers.email.length > quoteLimits.email)
        errors.email = quoteMessages.email;
      // Optional: only a number that was entered has to be valid.
      if (answers.phone.trim() && !isPhone(answers.phone)) {
        errors.phone = quoteMessages.phone;
      }
      if (!answers.consent) errors.consent = quoteMessages.consent;
      break;
    }
  }
  return errors;
}

const hasErrors = (errors: QuoteFieldErrors) => Object.keys(errors).length > 0;

/** The first screen that still needs an answer (the contact step if none do). */
function firstIncomplete(answers: Answers): StepId {
  for (const step of stepOrder) {
    if (step === "contact") break;
    if (hasErrors(validateStep(step, answers))) return step;
  }
  return "contact";
}

/** The first screen, in order, that holds one of these field errors. */
function firstStepWithError(errors: QuoteFieldErrors): StepId | null {
  const steps = (Object.keys(errors) as QuoteField[]).map(
    (field) => fieldStep[field],
  );
  return stepOrder.find((step) => steps.includes(step)) ?? null;
}

// ---- Initial state and restore ------------------------------------------------

/** State for the first render, derived only from the URL (same on server and client). */
export function initialState(entry: QuoteEntry): FlowState {
  const answers: Answers = { ...emptyAnswers };
  let postcodeInfo: PostcodeInfo | null = null;
  let step: StepId = "postcode";
  const errors: QuoteFieldErrors = {};

  if (entry.installationType)
    answers.installation_type = entry.installationType;
  if (entry.postcode) {
    const { value, check } = entry.postcode;
    if (check.ok) {
      answers.postcode = check.postcode;
      postcodeInfo = infoFrom(check);
      step = "installation_type";
    } else {
      answers.postcode = value;
      errors.postcode = check.message;
    }
  }

  return {
    ready: false,
    step,
    furthest: step,
    answers,
    postcodeInfo,
    installer: entry.installer,
    errors,
    formError: null,
    result: null,
    moves: 0,
  };
}

function infoFrom(check: Extract<PostcodeCheck, { ok: true }>): PostcodeInfo {
  return {
    district: check.district,
    installersInRange: check.installersInRange,
    verified: check.verified,
  };
}

/**
 * Combines answers saved in this tab with what the URL asked for.
 * No URL parameters means "carry on where I was" (a refresh). Parameters mean
 * a fresh start from a link or postcode form: the URL wins, and earlier
 * answers are kept as preselected choices.
 */
function restore(
  state: FlowState,
  saved: SavedState | null,
  entry: QuoteEntry,
): FlowState {
  if (!saved) return { ...state, ready: true };

  const freshEntry = Boolean(
    entry.postcode || entry.installationType || entry.installer,
  );
  if (!freshEntry) {
    const step = earlier(saved.step, firstIncomplete(saved.answers));
    return {
      ...state,
      ready: true,
      step,
      furthest: later(
        step,
        earlier(saved.furthest, firstIncomplete(saved.answers)),
      ),
      answers: saved.answers,
      postcodeInfo: saved.postcodeInfo,
      installer: saved.installer,
      moves: step === state.step ? state.moves : state.moves + 1,
    };
  }

  const answers: Answers = {
    ...saved.answers,
    ...(entry.postcode ? { postcode: state.answers.postcode } : {}),
    ...(entry.installationType
      ? { installation_type: entry.installationType }
      : {}),
  };
  const furthest = earlier(saved.furthest, firstIncomplete(answers));
  // Same postcode as before: this is a reload of the entry URL, so resume.
  const samePostcode =
    entry.postcode?.check.ok === true &&
    saved.answers.postcode === state.answers.postcode;
  const step = samePostcode
    ? earlier(saved.step, firstIncomplete(answers))
    : state.step;

  return {
    ...state,
    ready: true,
    step,
    furthest: later(step, furthest),
    answers,
    postcodeInfo: entry.postcode ? state.postcodeInfo : saved.postcodeInfo,
    moves: step === state.step ? state.moves : state.moves + 1,
  };
}

// ---- Reducer -----------------------------------------------------------------

function applyPatch(state: FlowState, patch: Partial<Answers>): FlowState {
  const answers = { ...state.answers, ...patch };
  let postcodeInfo = state.postcodeInfo;

  // A different answer to Question 3 shows a different follow-up.
  if (
    patch.existing_charger !== undefined &&
    patch.existing_charger !== state.answers.existing_charger
  ) {
    answers.charger_followup = "";
  }
  // The vehicle and "not chosen yet" are alternatives.
  if (patch.vehicle_undecided) answers.vehicle = "";
  if (patch.vehicle) answers.vehicle_undecided = false;
  // An edited postcode has to be checked again.
  if (
    patch.postcode !== undefined &&
    patch.postcode !== state.answers.postcode
  ) {
    postcodeInfo = null;
  }

  const errors = { ...state.errors };
  for (const key of Object.keys(patch) as QuoteField[]) delete errors[key];

  return { ...state, answers, postcodeInfo, errors };
}

function moveTo(state: FlowState, step: StepId): FlowState {
  return {
    ...state,
    step,
    furthest: later(state.furthest, step),
    formError: null,
    moves: state.moves + 1,
  };
}

export function reducer(state: FlowState, action: FlowAction): FlowState {
  // Once submitted, nothing can reopen or resend the request.
  if (state.result) return state;

  switch (action.type) {
    case "restore":
      // Runs once (React's development double-invoke must not apply it twice).
      return state.ready ? state : restore(state, action.saved, action.entry);

    case "set":
      return applyPatch(state, action.patch);

    case "postcode_confirmed": {
      const errors = { ...state.errors };
      delete errors.postcode;
      const confirmed: FlowState = {
        ...state,
        answers: { ...state.answers, postcode: action.check.postcode },
        postcodeInfo: infoFrom(action.check),
        errors,
      };
      // Return to where the customer had got to (Question 1 on a first visit).
      const target = later(
        "installation_type",
        earlier(state.furthest, firstIncomplete(confirmed.answers)),
      );
      return moveTo(confirmed, target);
    }

    case "next": {
      const current = action.patch ? applyPatch(state, action.patch) : state;
      const errors = validateStep(current.step, current.answers);
      if (hasErrors(errors)) {
        return { ...current, errors: { ...current.errors, ...errors } };
      }
      const next = stepOrder[indexOf(current.step) + 1];
      return next ? moveTo(current, next) : current;
    }

    case "back": {
      const previous = stepOrder[indexOf(state.step) - 1];
      return previous ? moveTo(state, previous) : state;
    }

    case "goto":
      return moveTo(state, action.step);

    case "errors":
      return { ...state, errors: { ...state.errors, ...action.errors } };

    case "failed": {
      const errors = { ...state.errors, ...action.fieldErrors };
      const target = action.fieldErrors
        ? firstStepWithError(action.fieldErrors)
        : null;
      const moved = target && target !== state.step;
      return {
        ...state,
        errors,
        step: target ?? state.step,
        formError: action.message,
        moves: moved ? state.moves + 1 : state.moves,
      };
    }

    case "done":
      return {
        ...state,
        answers: { ...emptyAnswers },
        postcodeInfo: null,
        errors: {},
        formError: null,
        result: action.result,
        moves: state.moves + 1,
      };
  }
}

// ---- sessionStorage ----------------------------------------------------------

const STORAGE_KEY = "pickasparky:quote:v1";

const oneOf = <T extends string>(options: readonly T[], value: unknown) =>
  typeof value === "string" && (options as readonly string[]).includes(value)
    ? (value as T)
    : "";

const text = (value: unknown, max: number) =>
  typeof value === "string" ? value.slice(0, max) : "";

/** Rebuilds saved state field by field, so tampered or outdated data is harmless. */
function parseSaved(raw: unknown): SavedState | null {
  if (!raw || typeof raw !== "object") return null;
  const data = raw as Record<string, unknown>;
  const source = (data.answers ?? {}) as Record<string, unknown>;

  const answers: Answers = {
    postcode: text(source.postcode, 10),
    installation_type: oneOf(
      quoteEnums.installation_type,
      source.installation_type,
    ),
    charger_location: oneOf(
      quoteEnums.charger_location,
      source.charger_location,
    ),
    existing_charger: oneOf(
      quoteEnums.existing_charger,
      source.existing_charger,
    ),
    charger_followup: oneOf(
      quoteEnums.charger_followup,
      source.charger_followup,
    ),
    fuse_box_distance: oneOf(
      quoteEnums.fuse_box_distance,
      source.fuse_box_distance,
    ),
    vehicle: text(source.vehicle, quoteLimits.vehicle),
    vehicle_undecided: source.vehicle_undecided === true,
    timing: oneOf(quoteEnums.timing, source.timing),
    notes: text(source.notes, quoteLimits.notes),
    first_name: text(source.first_name, quoteLimits.firstName),
    email: text(source.email, quoteLimits.email),
    phone: text(source.phone, 30),
    consent: false,
  };

  const info = data.postcodeInfo as Record<string, unknown> | null | undefined;
  const installer = data.installer as
    | Record<string, unknown>
    | null
    | undefined;

  return {
    step: oneOf(stepOrder, data.step) || "postcode",
    furthest: oneOf(stepOrder, data.furthest) || "postcode",
    answers,
    postcodeInfo:
      info && typeof info === "object"
        ? {
            district: typeof info.district === "string" ? info.district : null,
            installersInRange:
              typeof info.installersInRange === "number"
                ? info.installersInRange
                : null,
            verified: info.verified === true,
          }
        : null,
    installer:
      installer &&
      typeof installer.slug === "string" &&
      typeof installer.name === "string"
        ? { slug: installer.slug, name: installer.name }
        : null,
  };
}

/** Storage can be unavailable (private mode, blocked cookies): fail silently. */
export function loadSaved(): SavedState | null {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    return raw ? parseSaved(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

export function saveState(state: FlowState) {
  try {
    const saved: SavedState = {
      step: state.step,
      furthest: state.furthest,
      answers: { ...state.answers, consent: false },
      postcodeInfo: state.postcodeInfo,
      installer: state.installer,
    };
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  } catch {
    // Nothing to do: the flow still works, it just will not survive a refresh.
  }
}

export function clearSaved() {
  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // See saveState.
  }
}
