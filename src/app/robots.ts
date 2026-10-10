import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

/**
 * Public marketing pages are open to search engines and AI answer engines.
 * Account pages and form endpoints are kept out of every index.
 */
export default function robots(): MetadataRoute.Robots {
  const privatePaths = ["/installer/", "/review", "/messages", "/api/"];
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: privatePaths },
      {
        // Named explicitly so the policy for AI crawlers is unambiguous.
        userAgent: [
          "GPTBot",
          "OAI-SearchBot",
          "ChatGPT-User",
          "ClaudeBot",
          "Claude-SearchBot",
          "PerplexityBot",
          "Google-Extended",
          "Applebot-Extended",
        ],
        allow: ["/", "/llms.txt"],
        disallow: privatePaths,
      },
    ],
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}

export const dynamic = "force-static";
