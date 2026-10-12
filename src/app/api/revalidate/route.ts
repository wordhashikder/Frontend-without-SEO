import { timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";

/**
 * Called by the API right after the team publishes a change in the Dashboard
 * (page content, locations, listings, blog posts, reviews), so the website
 * shows it within seconds instead of when its cache expires.
 *
 * POST /api/revalidate/  { "tags": ["content:home"] }
 * Authenticated with the shared INTERNAL_API_KEY (X-Internal-Token header).
 */

const TAG = /^[a-z0-9-]+(?::[a-z0-9-]+)?$/;
const MAX_TAGS = 50;

function authorised(token: string | null) {
  const expected = process.env.INTERNAL_API_KEY;
  if (!expected || !token) return false;
  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request: NextRequest) {
  if (!authorised(request.headers.get("x-internal-token"))) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const body = (await request.json().catch(() => null)) as {
    tags?: unknown;
  } | null;
  const tags = Array.isArray(body?.tags)
    ? body.tags.filter(
        (tag): tag is string => typeof tag === "string" && TAG.test(tag),
      )
    : [];
  if (tags.length === 0 || tags.length > MAX_TAGS) {
    return NextResponse.json({ error: "invalid_tags" }, { status: 400 });
  }
  for (const tag of tags) {
    // Expire at once: the next visitor gets the new content, not a stale copy.
    revalidateTag(tag, { expire: 0 });
  }
  return NextResponse.json({ revalidated: tags });
}
