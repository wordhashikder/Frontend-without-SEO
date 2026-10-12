import type { Metadata } from "next";
import { LegalContent } from "@/components/legal/legal-content";
import { PageSchema } from "@/components/sections/page-schema";
import { getContent } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import { routes } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const { seo } = await getContent("terms");
  return pageMetadata({ ...seo, path: routes.terms });
}

/** Edited in the Dashboard (Website content → Terms & Conditions). */
export default async function Page() {
  const content = await getContent("terms");
  return (
    <>
      <LegalContent content={content} />
      <PageSchema
        title={content.seo.title}
        description={content.seo.description}
        path={routes.terms}
        crumb="Terms & Conditions"
      />
    </>
  );
}
