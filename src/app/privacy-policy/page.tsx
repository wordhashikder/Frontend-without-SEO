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
  title: "Privacy Policy",
  description:
    "How PickASparky collects, uses, shares and protects your personal information when you request EV charger installation quotes, and your UK GDPR rights.",
  path: routes.privacy,
};

export const metadata: Metadata = pageMetadata(page);

const sections: LegalSection[] = [
  {
    id: "introduction",
    title: "Introduction",
    content: (
      <LegalText>
        This Privacy Policy explains how PickASparky (“we”, “us”) collects, uses
        and protects your personal information when you use our marketplace to
        request EV charger installation quotes. By using our services, you agree
        to the practices described below.
      </LegalText>
    ),
  },
  {
    id: "data-we-collect",
    title: "Data We Collect",
    content: (
      <>
        <LegalText>
          We only collect the information needed to connect you with suitable
          installers, including:
        </LegalText>
        <LegalList
          items={[
            "Contact details such as your name, email address and phone number.",
            "Your postcode and property information relevant to an installation.",
            "Details of the quote or service you request.",
            "Technical data such as browser type, device and IP address.",
          ]}
        />
      </>
    ),
  },
  {
    id: "how-we-use-it",
    title: "How We Use It",
    content: (
      <>
        <LegalText>
          Your data is used strictly to deliver and improve our services.
          Specifically, we use it to:
        </LegalText>
        <LegalList
          items={[
            "Match your request with relevant vetted installers in your area.",
            "Send you quotes, updates and service-related communications.",
            "Maintain the safety, security and integrity of our platform.",
            "Comply with our legal and regulatory obligations.",
          ]}
        />
      </>
    ),
  },
  {
    id: "data-sharing",
    title: "Data Sharing",
    content: (
      <LegalText>
        We share your details only with the installers you have chosen to
        request a quote from, and with trusted service providers who help us
        operate the platform. We never sell your personal data to third parties
        for marketing purposes.
      </LegalText>
    ),
  },
  {
    id: "your-rights",
    title: "Your Rights",
    content: (
      <>
        <LegalText>Under UK GDPR, you have the right to:</LegalText>
        <LegalList
          items={[
            "Access the personal data we hold about you.",
            "Request correction or deletion of your data.",
            "Object to or restrict certain processing.",
            "Withdraw consent at any time.",
          ]}
        />
      </>
    ),
  },
  {
    id: "contact-us",
    title: "Contact Us",
    content: (
      <LegalText>
        If you have any questions about this policy or wish to exercise your
        rights, please contact our data protection team at{" "}
        <LegalLink href={`mailto:${site.privacyEmail}`}>
          {site.privacyEmail}
        </LegalLink>
        .
      </LegalText>
    ),
  },
];

export default function PrivacyPolicyPage() {
  return (
    <>
      <LegalLayout
        title="Privacy Policy"
        updated="Sept 2026"
        sections={sections}
      />
      <PageSchema {...page} crumb="Privacy Policy" />
    </>
  );
}
