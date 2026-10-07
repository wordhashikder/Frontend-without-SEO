import type { Metadata } from "next";
import {
  LegalLayout,
  LegalList,
  type LegalSection,
  LegalText,
} from "@/components/legal/legal-layout";
import { PageSchema } from "@/components/sections/page-schema";
import { pageMetadata } from "@/lib/seo";
import { routes } from "@/lib/site";

const page = {
  title: "Terms & Conditions",
  description:
    "The terms that govern your use of the PickASparky marketplace: what users and installers agree to, how quotes and payments work, and limits on our liability.",
  path: routes.terms,
};

export const metadata: Metadata = pageMetadata(page);

const sections: LegalSection[] = [
  {
    id: "introduction",
    title: "Introduction",
    content: (
      <LegalText>
        These Terms &amp; Conditions govern your use of the PickASparky
        marketplace. By accessing our website or requesting a quote, you agree
        to be bound by these terms. Please read them carefully before using our
        services.
      </LegalText>
    ),
  },
  {
    id: "user-agreement",
    title: "User Agreement",
    content: (
      <>
        <LegalText>As a user of PickASparky, you agree to:</LegalText>
        <LegalList
          items={[
            "Provide accurate and complete information when requesting quotes.",
            "Use the platform only for lawful purposes.",
            "Not misuse, disrupt or attempt to gain unauthorised access to our services.",
            "Be responsible for any agreements you enter into directly with an installer.",
          ]}
        />
      </>
    ),
  },
  {
    id: "installer-obligations",
    title: "Installer Obligations",
    content: (
      <>
        <LegalText>
          Installers listed on our marketplace are independent businesses who
          agree to:
        </LegalText>
        <LegalList
          items={[
            "Hold all required accreditations, licences and insurance.",
            "Provide accurate quotes and carry out work to industry standards.",
            "Comply with all applicable UK electrical safety regulations.",
            "Respond to customer enquiries in a professional and timely manner.",
          ]}
        />
      </>
    ),
  },
  {
    id: "quotes-and-payments",
    title: "Quotes & Payments",
    content: (
      <LegalText>
        PickASparky is a lead-generation marketplace. Any quote provided is an
        estimate from an independent installer, and all payments and contracts
        are agreed directly between you and that installer. We are not a party
        to those agreements.
      </LegalText>
    ),
  },
  {
    id: "limitation-of-liability",
    title: "Limitation of Liability",
    content: (
      <LegalText>
        While we carefully vet the installers on our platform, PickASparky is
        not liable for the workmanship, conduct or contractual performance of
        any third-party installer. Our liability is limited to the fullest
        extent permitted by law.
      </LegalText>
    ),
  },
  {
    id: "changes-to-these-terms",
    title: "Changes to These Terms",
    content: (
      <LegalText>
        We may update these Terms &amp; Conditions from time to time. Any
        changes will be posted on this page with an updated effective date.
        Continued use of the platform constitutes acceptance of the revised
        terms.
      </LegalText>
    ),
  },
];

export default function TermsPage() {
  return (
    <>
      <LegalLayout
        title="Terms & Conditions"
        updated="Sept 2026"
        sections={sections}
      />
      <PageSchema {...page} crumb="Terms & Conditions" />
    </>
  );
}
