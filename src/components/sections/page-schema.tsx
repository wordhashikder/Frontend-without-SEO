import { JsonLd } from "@/components/sections/json-ld";
import { type WebPageType, webPageSchema } from "@/lib/seo";

type PageSchemaProps = {
  /** A more specific schema.org page type, when one fits. */
  type?: WebPageType;
  /** The same title, description and path the page passes to `pageMetadata`. */
  title: string;
  description: string;
  path: string;
  /**
   * Set on pages that render `<Breadcrumbs>` (which publishes the BreadcrumbList): the
   * page then points at its trail. Pages without a visible trail have no breadcrumb markup.
   */
  breadcrumb?: boolean;
  /** Extra properties for the WebPage node, e.g. `mainEntity`. */
  extra?: Record<string, unknown>;
};

/**
 * Page-level structured data, used once on every public page: the page as a
 * schema.org `WebPage` linked to the site and the organisation. Breadcrumb
 * structured data is only published where the page shows breadcrumbs.
 */
export function PageSchema({
  type,
  title,
  description,
  path,
  breadcrumb = false,
  extra,
}: PageSchemaProps) {
  return (
    <JsonLd
      data={webPageSchema({
        type,
        title,
        description,
        path,
        breadcrumb,
        extra,
      })}
    />
  );
}
