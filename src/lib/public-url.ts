/*
 * The address visitors actually use, for redirects built on the server.
 *
 * In a container Next listens on 0.0.0.0, so `request.url` names that internal
 * address, and redirecting to it sends visitors to "https://0.0.0.0:3000/…".
 * The public address comes from the reverse proxy's forwarded headers, then
 * NEXT_PUBLIC_SITE_URL, then the Host header.
 */

const first = (value: string | null) => value?.split(",")[0]?.trim() || "";

export function publicOrigin(headers: Headers, requestUrl: string): string {
  const host = first(headers.get("x-forwarded-host"));
  if (host && /^[a-z0-9.-]+(:\d{1,5})?$/i.test(host)) {
    const proto = first(headers.get("x-forwarded-proto"));
    return `${proto === "http" ? "http" : "https"}://${host}`;
  }
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) return configured.replace(/\/+$/, "");
  // No proxy headers and no configured address: the Host header is what the
  // browser typed, unless it is the container's own bind address.
  const hostHeader = first(headers.get("host"));
  const origin = new URL(requestUrl);
  if (hostHeader && !/^(0\.0\.0\.0|\[::\])(:\d+)?$/.test(hostHeader)) {
    const local = /^(localhost|127\.|192\.168\.|10\.)/.test(hostHeader);
    return `${local ? origin.protocol : "https:"}//${hostHeader}`;
  }
  return origin.origin;
}

/** An absolute URL for `path` on the public site. */
export function publicUrl(
  path: string,
  request: { headers: Headers; url: string },
): URL {
  return new URL(path, publicOrigin(request.headers, request.url));
}
