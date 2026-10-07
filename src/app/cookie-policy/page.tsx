import type { Metadata } from "next";
import {
  LegalLayout,
  LegalLink,
  LegalList,
  type LegalSection,
  LegalText,
} from "@/components/legal/legal-layout";
import { PageSchema } from "@/components/sections/page-schema";
import { pageMetadata } from "@/lib/seo";
import { routes, site } from "@/lib/site";

const page = {
  title: "Cookie Policy",
  description:
    "Which cookies the PickASparky website uses: strictly necessary cookies only, no analytics or advertising cookies, and how to control cookies in your browser.",
  path: routes.cookies,
};

export const metadata: Metadata = pageMetadata(page);

/*
 * Keep this in step with the site as built. Today the only cookies we set are
 * the installer sign-in session cookies (src/lib/session.ts), and the quote
 * form keeps its progress in sessionStorage (src/components/quote/state.ts).
 * Update this page before adding analytics or any other non-essential cookie.
 */
const sections: LegalSection[] = [
  {
    id: "introduction",
    title: "Introduction",
    content: (
      <LegalText>
        This Cookie Policy explains what cookies are, which ones the PickASparky
        website uses and how you can control them. We keep cookies to a minimum:
        the site sets only the cookies it needs in order to work.
      </LegalText>
    ),
  },
  {
    id: "what-are-cookies",
    title: "What Are Cookies",
    content: (
      <LegalText>
        Cookies are small text files that a website stores on your device. They
        let the site remember information between pages or visits, such as
        whether you are signed in.
      </LegalText>
    ),
  },
  {
    id: "cookies-we-use",
    title: "Cookies We Use",
    content: (
      <>
        <LegalText>
          We use strictly necessary cookies only. These are the session cookies
          set when an installer signs in to their PickASparky account. They:
        </LegalText>
        <LegalList
          items={[
            "Keep the installer signed in as they move between pages of their account.",
            "Help keep the account secure.",
          ]}
        />
        <LegalText>
          These cookies are used only for installer accounts. Homeowners can
          browse the site and request quotes without signing in. Because
          strictly necessary cookies are essential to a service you have asked
          for, they are set without asking for consent.
        </LegalText>
      </>
    ),
  },
  {
    id: "browser-storage",
    title: "Browser Storage",
    content: (
      <LegalText>
        The quote form uses your browser’s session storage, which works in a
        similar way to a cookie, to keep your answers while you fill the form
        in, so that refreshing the page does not lose your progress. This
        information is stored only in your browser, is not used to track you and
        is removed when you close the tab.
      </LegalText>
    ),
  },
  {
    id: "analytics-and-advertising",
    title: "Analytics & Advertising",
    content: (
      <LegalText>
        We do not use analytics cookies or advertising cookies, and we do not
        use cookies to track you across other websites.
      </LegalText>
    ),
  },
  {
    id: "third-party-cookies",
    title: "Third-Party Cookies",
    content: (
      <LegalText>
        Installers pay for their plan through Stripe. Stripe’s checkout and
        billing pages are hosted by Stripe, not by us, and Stripe sets its own
        cookies on those pages. Those cookies are controlled by Stripe and
        covered by Stripe’s own cookie policy.
      </LegalText>
    ),
  },
  {
    id: "managing-cookies",
    title: "Managing Cookies",
    content: (
      <>
        <LegalText>
          You can control cookies in your browser settings. Most browsers let
          you:
        </LegalText>
        <LegalList
          items={[
            "See which cookies are stored on your device and delete them.",
            "Block cookies from particular websites, or from all websites.",
            "Block third-party cookies.",
            "Clear all cookies when you close the browser.",
          ]}
        />
        <LegalText>
          Your browser’s help pages explain where to find these settings. If you
          block or delete our strictly necessary cookies, installers will not be
          able to stay signed in to their account. If you block browser storage,
          the quote form still works but will not remember your answers if you
          refresh the page.
        </LegalText>
      </>
    ),
  },
  {
    id: "changes-to-this-policy",
    title: "Changes to This Policy",
    content: (
      <LegalText>
        If we add analytics or any other non-essential cookies in future, we
        will update this policy and ask for your consent where the law requires
        it. The date at the top of this page shows when the policy was last
        updated.
      </LegalText>
    ),
  },
  {
    id: "contact-us",
    title: "Contact Us",
    content: (
      <LegalText>
        If you have any questions about how we use cookies, please contact us at{" "}
        <LegalLink href={`mailto:${site.privacyEmail}`}>
          {site.privacyEmail}
        </LegalLink>
        . Our <LegalLink href={routes.privacy}>Privacy Policy</LegalLink>{" "}
        explains how we handle personal information more generally.
      </LegalText>
    ),
  },
];

export default function CookiePolicyPage() {
  return (
    <>
      <LegalLayout
        title="Cookie Policy"
        updated="Oct 2026"
        sections={sections}
      />
      <PageSchema {...page} crumb="Cookie Policy" />
    </>
  );
}
