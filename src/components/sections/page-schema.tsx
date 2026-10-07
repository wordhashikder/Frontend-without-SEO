import { JsonLd } from "@/components/sections/json-ld";
import { breadcrumbSchema, type WebPageType, webPageSchema } from "@/lib/seo";
import { routes } from "@/lib/site";

type Crumb = { name: string; path: string };

type PageSchemaProps = {
  /** A more specific schema.org page type, when one fits. */
  type?: WebPageType;
  /** The same title, description and path the page passes to `pageMetadata`. */
  title: string;
  description: string;
  path: string;
  /**
   * This page's label in the breadcrumb trail. Set it on pages that have no
   * visible breadcrumbs; pages that render `<Breadcrumbs>` already publish
   * their trail, so they leave it out.
   */
  crumb?: string;
  /** Pages between Home and this one. */
  parents?: Crumb[];
  /** Extra properties for the WebPage node, e.g. `mainEntity`. */
  extra?: Record<string, unknown>;
};

/**
 * Page-level structured data, used once on every public page: the page as a
 * schema.org `WebPage` linked to the site and the organisation, plus its
 * breadcrumb trail.
 */
export function PageSchema({
  type,
  title,
  description,
  path,
  crumb,
  parents = [],
  extra,
}: PageSchemaProps) {
  const page = webPageSchema({ type, title, description, path, extra });
  if (!crumb) return <JsonLd data={page} />;

  return (
    <JsonLd
      data={[
        page,
        breadcrumbSchema([
          { name: "Home", path: routes.home },
          ...parents,
          { name: crumb, path },
        ]),
      ]}
    />
  );
}
