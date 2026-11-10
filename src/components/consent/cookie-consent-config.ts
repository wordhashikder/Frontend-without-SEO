import type { CookieConsentConfig } from "vanilla-cookieconsent";

/**
 * Wording and behaviour of the cookie banner. Styling is in cookie-consent.css.
 *
 * - Accept, Customize and Reject are all on the first screen, one click each,
 *   and the close (X) button also rejects, so declining is as easy as accepting.
 * - Raise `revision` whenever a new kind of cookie is added: everyone is asked
 *   again.
 */
export function consentConfig(
  onChoice: (analytics: boolean) => void,
): CookieConsentConfig {
  return {
    autoShow: false,
    revision: 1,
    guiOptions: {
      consentModal: {
        layout: "box wide",
        position: "bottom left",
        equalWeightButtons: false,
        flipButtons: false,
      },
      preferencesModal: {
        layout: "box",
        equalWeightButtons: true,
        flipButtons: false,
      },
    },
    categories: {
      necessary: { enabled: true, readOnly: true },
      analytics: {},
    },
    onConsent: ({ cookie }) =>
      onChoice(cookie.categories.includes("analytics")),
    onChange: ({ cookie }) => onChoice(cookie.categories.includes("analytics")),
    language: {
      default: "en",
      translations: {
        en: {
          consentModal: {
            label: "Cookie consent",
            title: "We value your privacy",
            description:
              'We use essential cookies to keep <strong>PickASparky</strong> working. With your permission we would also use analytics cookies to see how the site is used and make it better. Nothing optional is set until you choose.<a href="/cookie-policy" class="cc__policy">Learn more about our cookie policy</a>',
            acceptAllBtn: "Accept All Cookies",
            acceptNecessaryBtn: "Reject Non-Essential",
            showPreferencesBtn: "Customize Preferences",
            closeIconLabel: "Reject non-essential cookies and close",
          },
          preferencesModal: {
            title: "Cookie preferences",
            acceptAllBtn: "Accept All Cookies",
            acceptNecessaryBtn: "Reject Non-Essential",
            savePreferencesBtn: "Save My Choices",
            closeIconLabel: "Close",
            sections: [
              {
                title: "Your choices",
                description:
                  'Choose which cookies we may use. You can change your mind at any time from "Cookie settings" in the footer. More detail is in our <a href="/cookie-policy" class="cc__link">Cookie Policy</a>.',
              },
              {
                title: "Strictly necessary cookies",
                description:
                  "These keep you signed in, protect the site and remember your cookie choice. The site cannot work without them, so they are always on.",
                linkedCategory: "necessary",
              },
              {
                title: "Analytics cookies",
                description:
                  "Google Analytics helps us understand which pages are visited and how people find us, so we can improve the service. We use it only to measure the site, never for advertising.",
                linkedCategory: "analytics",
                cookieTable: {
                  headers: {
                    name: "Cookie",
                    duration: "Duration",
                    description: "Purpose",
                  },
                  body: [
                    {
                      name: "_ga",
                      duration: "2 years",
                      description: "Tells one visitor from another.",
                    },
                    {
                      name: "_ga_*",
                      duration: "2 years",
                      description: "Keeps track of a visit.",
                    },
                  ],
                },
              },
            ],
          },
        },
      },
    },
  };
}
