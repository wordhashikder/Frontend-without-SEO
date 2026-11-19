import type { Metadata } from "next";
import { LegalContent } from "@/components/legal/legal-content";
import { PageSchema } from "@/components/sections/page-schema";
import { getContent } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import { routes } from "@/lib/site";

/**
 * Until the team has written the agreement the page is empty, so search engines are asked
 * to leave it out; it opens up by itself as soon as it has sections.
 */
export async function generateMetadata(): Promise<Metadata> {
  const { seo, body } = await getContent("electricians-agreement");
  return pageMetadata({
    ...seo,
    path: routes.electriciansAgreement,
    index: body.sections.length > 0,
  });
}

/**
 * What an installer agrees to when they create an account (linked from the sign-up
 * form, not from the footer or the sitemap). Edited in the Dashboard
 * (Website content → Electricians Agreement).
 */
export default async function Page() {
  const content = await getContent("electricians-agreement");
  return (
    <>
      <LegalContent content={content} />
      <PageSchema
        title={content.seo.title}
        description={content.seo.description}
        path={routes.electriciansAgreement}
      />
    </>
  );
}
