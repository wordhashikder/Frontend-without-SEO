/**
 * The "Request a Quote" form on an installer's profile. Shared by the form (to
 * render it) and its Server Action (to validate it), like quote-questions.ts.
 */

export const enquiryLimits = {
  name: 80,
  email: 254,
  phone: 30,
  message: 3000,
} as const;

/**
 * Pro and Premium installers receive requests themselves ("direct"). Requests to
 * Free-plan, listed-only installers go to the PickASparky team, so the copy says so.
 */
export const enquiryForm = {
  title: "Request a Quote",
  lead: (business: string, direct: boolean) =>
    direct
      ? `Get in touch with ${business} to request a quote for your EV charger installation.`
      : `Request a quote from ${business} for your EV charger installation. The PickASparky team will get back to you.`,
  name: { label: "Your name", placeholder: "e.g. John Smith" },
  email: { label: "Your email", placeholder: "e.g. john@example.com" },
  phone: { label: "Phone number", placeholder: "e.g. 07700 900123" },
  message: {
    label: "Your message",
    placeholder:
      "Tell the installer about the job: the charger you'd like, where it should go and when.",
  },
  button: "Send Quote Request",
  privacy: (business: string, direct: boolean) =>
    direct
      ? `Your details are only shared with ${business} when you send a request.`
      : "Your details are only used to answer this request.",
  sent: {
    title: "Request sent",
    body: (business: string, direct: boolean) =>
      direct
        ? `${business} will reply to you directly. We've emailed you a copy of your request.`
        : "The PickASparky team will get back to you shortly. We've emailed you a copy of your request.",
    more: "Compare more quotes",
  },
} as const;

export const enquiryMessages = {
  name: "Enter your name.",
  nameLength: `Your name must be ${enquiryLimits.name} characters or fewer.`,
  email: "Enter an email address in the format name@example.com.",
  phone: "Enter a valid phone number, or leave this blank.",
  message: "Tell the installer a little about the job (10 characters or more).",
  messageLength: "Your message must be 3,000 characters or fewer.",
  unavailable:
    "This installer is no longer listed. Compare free quotes from installers in your area instead.",
  tooMany:
    "You've sent several requests in a short time. Please wait a few minutes and try again.",
  tryAgain:
    "Something went wrong and your request was not sent. Please try again.",
} as const;
