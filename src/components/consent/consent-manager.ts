import { eraseAnalyticsCookies, setAnalyticsConsent } from "@/lib/consent";
import { consentConfig } from "./cookie-consent-config";

type Library = typeof import("vanilla-cookieconsent");

let loading: Promise<Library> | undefined;

/** Loads the consent library on first use and starts it once. */
export function loadConsent() {
  loading ??= import("vanilla-cookieconsent").then(async (library) => {
    await library.run(
      consentConfig((analytics) => {
        setAnalyticsConsent(analytics);
        if (!analytics) eraseAnalyticsCookies();
      }),
    );
    return library;
  });
  return loading;
}

/** Opens the preferences window: used by "Cookie settings" in the footer. */
export async function openCookieSettings() {
  try {
    (await loadConsent()).showPreferences();
  } catch {
    // The window could not open (script blocked): nothing else to do.
  }
}
