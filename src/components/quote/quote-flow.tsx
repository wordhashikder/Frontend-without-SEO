"use client";

import { CircleCheck, MapPin, Zap } from "lucide-react";
import {
  type ReactNode,
  useEffect,
  useLayoutEffect,
  useReducer,
  useRef,
  useTransition,
} from "react";
import { checkPostcode, submitQuote } from "@/actions/quote";
import { Confirmation } from "@/components/quote/confirmation";
import {
  type Answers,
  clearSaved,
  initialState,
  loadSaved,
  type QuoteEntry,
  reducer,
  saveState,
  validateStep,
} from "@/components/quote/state";
import {
  ChoiceStep,
  ContactStep,
  PostcodeStep,
  TimingStep,
  VehicleStep,
} from "@/components/quote/steps";
import { FormMessage } from "@/components/ui/form";
import {
  chargerFollowup,
  chargerLocation,
  existingCharger,
  fuseBoxDistance,
  installationType,
  QUESTION_COUNT,
  type QuoteField,
  questionNumber,
  type StepId,
  stepOrder,
} from "@/content/quote-questions";
import { formatPostcode } from "@/lib/utils";

/** Query parameters the flow reads once and then removes from the address bar. */
const ENTRY_PARAMS = ["postcode", "type", "installer"];

/** Marks the extra history entry that lets the browser's Back button step back a question. */
const HISTORY_GUARD = "quoteGuard";

const fieldIds: Partial<Record<QuoteField, string>> = {
  postcode: "quote-postcode",
  first_name: "quote-first-name",
  email: "quote-email",
  phone: "quote-phone",
  consent: "quote-consent",
};

const OFFLINE_MESSAGE =
  "We couldn't send your request. Please check your connection and try again. Your answers are saved.";

type QuoteFlowProps = {
  entry: QuoteEntry;
  /** Page heading and lead, shown with the postcode step. */
  intro: ReactNode;
  /** Supporting content under the postcode step. */
  outro: ReactNode;
};

/**
 * The "Get free quotes" questionnaire: postcode, six questions (Question 3
 * branches to one follow-up), contact details, confirmation.
 */
export function QuoteFlow({ entry, intro, outro }: QuoteFlowProps) {
  const [state, dispatch] = useReducer(reducer, entry, initialState);
  const [checking, startChecking] = useTransition();
  const [sending, startSending] = useTransition();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  /** Guards against a second submit while a request is in flight. */
  const busy = useRef(false);

  const { step, answers, errors, result } = state;
  const canStepBack = step !== "postcode" && !result;

  // Pick up answers saved in this tab (a refresh), before the first paint.
  // biome-ignore lint/correctness/useExhaustiveDependencies: runs once; `entry` describes the URL the page was opened with
  useLayoutEffect(() => {
    dispatch({ type: "restore", saved: loadSaved(), entry });
  }, []);

  // The entry parameters have done their job: keep the address bar clean.
  // Deferred so it runs after the router has taken over the History API.
  useEffect(() => {
    const url = new URL(window.location.href);
    if (!ENTRY_PARAMS.some((name) => url.searchParams.has(name))) return;
    for (const name of ENTRY_PARAMS) url.searchParams.delete(name);
    const timer = window.setTimeout(() => {
      window.history.replaceState(null, "", `${url.pathname}${url.search}`);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  // Keep answers across an accidental refresh; forget them once sent.
  useEffect(() => {
    if (!state.ready) return;
    if (state.result) clearSaved();
    else saveState(state);
  }, [state]);

  // Each new screen: move focus to its heading and bring it into view.
  const lastMove = useRef(state.moves);
  useEffect(() => {
    if (lastMove.current === state.moves) return;
    lastMove.current = state.moves;
    headingRef.current?.focus({ preventScroll: true });
    const top = topRef.current;
    if (top && top.getBoundingClientRect().top < 0) {
      top.scrollIntoView({ block: "start" });
    }
  }, [state.moves]);

  // Browser Back = previous question. One extra history entry is kept while
  // there is a question to go back to; pressing Back consumes it and we step
  // back instead of leaving the page.
  const canStepBackRef = useRef(canStepBack);
  useEffect(() => {
    canStepBackRef.current = canStepBack;
  }, [canStepBack]);
  useEffect(() => {
    if (!canStepBack || state.moves === 0) return;
    const timer = window.setTimeout(() => {
      if (window.history.state?.[HISTORY_GUARD]) return;
      // Spread keeps the router's own bookkeeping on the new entry.
      window.history.pushState(
        { ...window.history.state, [HISTORY_GUARD]: true },
        "",
      );
    }, 0);
    return () => window.clearTimeout(timer);
  }, [canStepBack, state.moves]);

  useEffect(() => {
    const onPopState = (event: PopStateEvent) => {
      // Arriving on the guard entry (browser Forward) needs no action.
      if (event.state?.[HISTORY_GUARD]) return;
      if (canStepBackRef.current) dispatch({ type: "back" });
      // Nothing left to step back to: let Back leave the page as usual.
      else window.history.back();
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const set = (patch: Partial<Answers>) => dispatch({ type: "set", patch });
  const next = (patch?: Partial<Answers>) => dispatch({ type: "next", patch });
  const back = () => dispatch({ type: "back" });

  const focusField = (field: QuoteField | undefined) => {
    const id = field ? fieldIds[field] : undefined;
    if (id) document.getElementById(id)?.focus();
  };

  function submitPostcode() {
    if (busy.current) return;
    const invalid = validateStep("postcode", answers);
    if (invalid.postcode) {
      dispatch({ type: "errors", errors: invalid });
      focusField("postcode");
      return;
    }
    busy.current = true;
    startChecking(async () => {
      try {
        const check = await checkPostcode(answers.postcode);
        if (check.ok) {
          dispatch({ type: "postcode_confirmed", check });
        } else {
          dispatch({ type: "errors", errors: { postcode: check.message } });
          focusField("postcode");
        }
      } catch {
        // Our own server could not be reached. The postcode has the right
        // shape, so carry on; it is checked again when the request is sent.
        dispatch({
          type: "postcode_confirmed",
          check: {
            ok: true,
            postcode: formatPostcode(answers.postcode),
            district: null,
            installersInRange: null,
            verified: false,
          },
        });
      } finally {
        busy.current = false;
      }
    });
  }

  function submitRequest(honeypot: string) {
    if (busy.current || result) return;
    const invalid = validateStep("contact", answers);
    const firstInvalid = (Object.keys(invalid) as QuoteField[])[0];
    if (firstInvalid) {
      dispatch({ type: "errors", errors: invalid });
      focusField(firstInvalid);
      return;
    }
    busy.current = true;
    startSending(async () => {
      try {
        const outcome = await submitQuote({
          ...answers,
          installer_slug: state.installer?.slug ?? null,
          website: honeypot,
        });
        if (outcome.ok) {
          dispatch({
            type: "done",
            result: {
              reference: outcome.reference,
              postcode: outcome.postcode,
              matchedInstallers: outcome.matchedInstallers,
              firstName: answers.first_name.trim(),
              email: answers.email.trim(),
            },
          });
        } else {
          dispatch({
            type: "failed",
            message: outcome.message,
            fieldErrors: outcome.fieldErrors,
          });
        }
      } catch {
        dispatch({ type: "failed", message: OFFLINE_MESSAGE });
      } finally {
        busy.current = false;
      }
    });
  }

  const info = state.postcodeInfo;
  const coverageNotice =
    info && (info.installersInRange ?? 0) > 0 ? (
      <p className="mb-5 inline-flex items-center gap-2 rounded-full bg-primary-soft py-1.5 pr-3.5 pl-2.5 text-[13px] font-medium leading-snug text-forest">
        <CircleCheck aria-hidden className="size-4 shrink-0 text-primary" />
        Good news: installers cover {info.district ?? answers.postcode}
      </p>
    ) : null;

  const errorBanner = state.formError ? (
    <FormMessage tone="error">{state.formError}</FormMessage>
  ) : null;

  function renderStep(): ReactNode {
    switch (step) {
      case "postcode":
        return (
          <PostcodeStep
            headingRef={headingRef}
            value={answers.postcode}
            error={errors.postcode}
            pending={checking}
            installerSlug={state.installer?.slug}
            onChange={(postcode) => set({ postcode })}
            onSubmit={submitPostcode}
          />
        );
      case "installation_type":
        return (
          <ChoiceStep
            headingRef={headingRef}
            name={step}
            title={installationType.title}
            options={installationType.options}
            value={answers.installation_type}
            error={errors.installation_type}
            notice={coverageNotice}
            onSelect={(value) => set({ installation_type: value })}
            onNext={(value) =>
              next(value ? { installation_type: value } : undefined)
            }
            onBack={back}
          />
        );
      case "charger_location":
        return (
          <ChoiceStep
            headingRef={headingRef}
            name={step}
            title={chargerLocation.title}
            options={chargerLocation.options}
            value={answers.charger_location}
            error={errors.charger_location}
            onSelect={(value) => set({ charger_location: value })}
            onNext={(value) =>
              next(value ? { charger_location: value } : undefined)
            }
            onBack={back}
          />
        );
      case "existing_charger":
        return (
          <ChoiceStep
            headingRef={headingRef}
            name={step}
            title={existingCharger.title}
            options={existingCharger.options}
            value={answers.existing_charger}
            error={errors.existing_charger}
            onSelect={(value) => set({ existing_charger: value })}
            onNext={(value) =>
              next(value ? { existing_charger: value } : undefined)
            }
            onBack={back}
          />
        );
      case "charger_followup": {
        // Reached only after Question 3, which decides the follow-up shown.
        const branch = chargerFollowup[answers.existing_charger || "no"];
        return (
          <ChoiceStep
            headingRef={headingRef}
            name={step}
            title={branch.title}
            options={branch.options}
            value={answers.charger_followup}
            error={errors.charger_followup}
            onSelect={(value) => set({ charger_followup: value })}
            onNext={(value) =>
              next(value ? { charger_followup: value } : undefined)
            }
            onBack={back}
          />
        );
      }
      case "fuse_box_distance":
        return (
          <ChoiceStep
            headingRef={headingRef}
            name={step}
            title={fuseBoxDistance.title}
            options={fuseBoxDistance.options}
            value={answers.fuse_box_distance}
            error={errors.fuse_box_distance}
            onSelect={(value) => set({ fuse_box_distance: value })}
            onNext={(value) =>
              next(value ? { fuse_box_distance: value } : undefined)
            }
            onBack={back}
          />
        );
      case "vehicle":
        return (
          <VehicleStep
            headingRef={headingRef}
            vehicle={answers.vehicle}
            undecided={answers.vehicle_undecided}
            error={errors.vehicle}
            onChange={set}
            onNext={next}
            onBack={back}
          />
        );
      case "timing":
        return (
          <TimingStep
            headingRef={headingRef}
            value={answers.timing}
            notes={answers.notes}
            errors={errors}
            onChange={set}
            onNext={() => next()}
            onBack={back}
          />
        );
      case "contact":
        return (
          <ContactStep
            headingRef={headingRef}
            answers={answers}
            errors={errors}
            pending={sending}
            message={errorBanner}
            onChange={set}
            onSubmit={submitRequest}
            onBack={back}
          />
        );
    }
  }

  const onPostcodeStep = step === "postcode" && !result;

  return (
    <div ref={topRef} className="mx-auto w-full max-w-[640px] scroll-mt-24">
      {onPostcodeStep ? intro : null}

      <div className="rounded-2xl border border-line bg-white p-5 shadow-card sm:p-8">
        {result ? (
          <Confirmation headingRef={headingRef} result={result} />
        ) : (
          <>
            {state.installer ? (
              <p className="mb-5 flex items-center gap-2.5 rounded-xl bg-mint-soft px-3.5 py-2.5 text-[13px] leading-snug text-ink">
                <Zap
                  aria-hidden
                  className="size-4 shrink-0 text-primary"
                  strokeWidth={2}
                />
                <span>
                  Requesting a quote from{" "}
                  <strong className="font-semibold">
                    {state.installer.name}
                  </strong>
                </span>
              </p>
            ) : null}

            {step !== "postcode" ? (
              <Progress
                step={step}
                postcode={answers.postcode}
                onChangePostcode={() =>
                  dispatch({ type: "goto", step: "postcode" })
                }
                locked={sending}
              />
            ) : null}

            {step !== "contact" && errorBanner ? (
              <div aria-live="assertive" className="mb-5">
                {errorBanner}
              </div>
            ) : null}

            <div
              key={
                step === "charger_followup"
                  ? `${step}:${answers.existing_charger}`
                  : step
              }
              className="transition-[opacity,translate] duration-300 ease-out starting:translate-y-2 starting:opacity-0"
            >
              {renderStep()}
            </div>
          </>
        )}
      </div>

      {result ? null : (
        <ul className="mt-5 flex flex-wrap justify-center gap-x-5 gap-y-2 text-[13px] text-muted">
          {[
            "Free, no obligation",
            "Up to 5 quotes",
            "You choose who to contact",
          ].map((point) => (
            <li key={point} className="inline-flex items-center gap-1.5">
              <CircleCheck
                aria-hidden
                className="size-4 text-primary"
                strokeWidth={2}
              />
              {point}
            </li>
          ))}
        </ul>
      )}

      {onPostcodeStep ? outro : null}
    </div>
  );
}

function Progress({
  step,
  postcode,
  onChangePostcode,
  locked,
}: {
  step: StepId;
  postcode: string;
  onChangePostcode: () => void;
  locked: boolean;
}) {
  const question = questionNumber[step];
  const label = question
    ? `Question ${question} of ${QUESTION_COUNT}`
    : "Last step";
  // The postcode counts as the first completed step, so the bar never starts empty.
  const percent = Math.round(
    (stepOrder.indexOf(step) / stepOrder.length) * 100,
  );

  return (
    <div className="mb-6 sm:mb-7">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.04em] text-primary">
          {label}
        </p>
        <button
          type="button"
          onClick={onChangePostcode}
          disabled={locked}
          aria-label={`Change postcode (currently ${postcode})`}
          className="-my-2 -mr-2 inline-flex h-11 items-center gap-1.5 rounded-lg px-2 text-[13px] text-muted transition-colors hover:text-ink disabled:opacity-60"
        >
          <MapPin aria-hidden className="size-3.5" strokeWidth={2} />
          <span className="font-medium text-ink">{postcode}</span>
          <span className="font-semibold text-primary">Change</span>
        </button>
      </div>
      <div
        role="progressbar"
        aria-label="Progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        aria-valuetext={label}
        className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-mint"
      >
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-500 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
