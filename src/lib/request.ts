import "server-only";

import { headers } from "next/headers";

/**
 * The visitor's IP as seen by the reverse proxy in front of Next.js.
 * Passed to the API so public forms are rate-limited per visitor rather than
 * per frontend server.
 */
export async function getClientIp(): Promise<string | undefined> {
  const headerList = await headers();
  const forwarded = headerList.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || headerList.get("x-real-ip") || undefined;
}
