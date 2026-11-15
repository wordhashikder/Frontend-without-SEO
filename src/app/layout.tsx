import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import { CookieConsent } from "@/components/consent/cookie-consent";
import { SectionScroll } from "@/components/layout/section-link";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { SkipLink } from "@/components/layout/skip-link";
import { JsonLd } from "@/components/sections/json-ld";
import { cookieBannerEnabled, gaMeasurementId } from "@/lib/analytics";
import { organizationSchema, websiteSchema } from "@/lib/seo";
import { site } from "@/lib/site";
import "./globals.css";

// Poppins is the only typeface on the site. It is self-hosted from an npm
// package: no request to Google at build or runtime.
const poppins = localFont({
  variable: "--font-poppins",
  display: "swap",
  src: [
    {
      path: "../../node_modules/@fontsource/poppins/files/poppins-latin-400-normal.woff2",
      weight: "400",
    },
    {
      path: "../../node_modules/@fontsource/poppins/files/poppins-latin-500-normal.woff2",
      weight: "500",
    },
    {
      path: "../../node_modules/@fontsource/poppins/files/poppins-latin-600-normal.woff2",
      weight: "600",
    },
    {
      path: "../../node_modules/@fontsource/poppins/files/poppins-latin-700-normal.woff2",
      weight: "700",
    },
    {
      path: "../../node_modules/@fontsource/poppins/files/poppins-latin-800-normal.woff2",
      weight: "800",
    },
  ],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "PickASparky | Compare EV Charger Installer Quotes in the UK",
    template: "%s | PickASparky",
  },
  description: site.description,
  applicationName: site.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: site.locale,
    url: site.url,
    title: "PickASparky | Compare EV Charger Installer Quotes in the UK",
    description: site.description,
  },
  twitter: { card: "summary_large_image" },
  robots: {
    index: true,
    follow: true,
    googleBot: { "max-image-preview": "large", "max-snippet": -1 },
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#0a9b53",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // `data-scroll-behavior="smooth"`: in-page scrolling (e.g. to the reviews) is smooth,
    // but Next.js switches smooth scrolling off while it moves to a new page, so every
    // navigation (the logo included) lands instantly at the top instead of animating
    // from the old scroll position and stopping part-way down.
    <html
      lang="en-GB"
      data-scroll-behavior="smooth"
      className={`${poppins.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <SkipLink />
        <SiteHeader />
        <main id="main" tabIndex={-1} className="flex-1 focus:outline-none">
          {children}
        </main>
        <SectionScroll />
        <SiteFooter />
        <JsonLd data={[organizationSchema(), websiteSchema()]} />
        {cookieBannerEnabled ? <CookieConsent /> : null}
        {gaMeasurementId ? (
          <GoogleAnalytics measurementId={gaMeasurementId} />
        ) : null}
      </body>
    </html>
  );
}
