import type { NextConfig } from "next";

type Redirect = Awaited<
  ReturnType<NonNullable<NextConfig["redirects"]>>
>[number];

const isDev = process.env.NODE_ENV === "development";

const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' blob: data: https://res.cloudinary.com https://*.tile.openstreetmap.org",
  "font-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self' https://checkout.stripe.com https://billing.stripe.com",
  "frame-ancestors 'none'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];


const siteUrl = new URL(
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
);
const bareHost = siteUrl.hostname.startsWith("www.")
  ? siteUrl.hostname.slice(4)
  : null;

const hostRedirects: Redirect[] = bareHost
  ? [
      {
        source: "/:path(.*)",
        has: [{ type: "host", value: bareHost.replaceAll(".", "\\.") }],
        destination: `${siteUrl.origin}/:path`,
        statusCode: 301,
      },
    ]
  : [];

const directory = "/uk/ev-charger-installers";
const profiles = "/uk/installer";
const legacyRedirects: Redirect[] = [
  {
    source: "/ev-charger-installers",
    destination: `${directory}/`,
    statusCode: 301,
  },
  {
    source: "/ev-charger-installers/:location",
    destination: `${directory}/:location/`,
    statusCode: 301,
  },
  {
    source: "/ev-charger-installers/:location/page/:number",
    destination: `${directory}/:location/page/:number/`,
    statusCode: 301,
  },
  {
    source: "/ev-charger-installers/:location/:installer",
    destination: `${profiles}/:installer/`,
    statusCode: 301,
  },
  {
    source: `${directory}/:location/:installer`,
    destination: `${profiles}/:installer/`,
    statusCode: 301,
  },
];

const nextConfig: NextConfig = {
  // Self-contained server bundle for the Docker image (see Dockerfile).
  output: "standalone",
  poweredByHeader: false,
  reactStrictMode: true,
  // Every page URL ends with a slash; /about answers with a redirect to /about/.
  trailingSlash: true,
  async redirects() {
    return [...hostRedirects, ...legacyRedirects];
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com", pathname: "/**" },
    ],
  },
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;
