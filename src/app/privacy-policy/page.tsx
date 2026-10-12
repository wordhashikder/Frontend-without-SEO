import type { Metadata } from "next";
import { LegalContent } from "@/components/legal/legal-content";
import { PageSchema } from "@/components/sections/page-schema";
import { getContent } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import { routes } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const { seo } = await getContent("privacy");
  return pageMetadata({ ...seo, path: routes.privacy });
}

/** Edited in the Dashboard (Website content → Privacy Policy). */
export default async function Page() {
  const content = await getContent("privacy");
  return (
    <>
      <LegalContent content={content} />
      <PageSchema
        title={content.seo.title}
        description={content.seo.description}
        path={routes.privacy}
        crumb="Privacy Policy"
      />
    </>
  );
}
