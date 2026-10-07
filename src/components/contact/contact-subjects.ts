import type { ContactSubject } from "@/lib/types";

/** Topics for the contact form: API value plus the label visitors see. */
export const contactSubjects: { value: ContactSubject; label: string }[] = [
  { value: "getting_quotes", label: "Getting quotes" },
  { value: "joining", label: "Joining as an electrician" },
  { value: "account", label: "My installer account" },
  { value: "feedback", label: "Feedback" },
  { value: "other", label: "Something else" },
];
