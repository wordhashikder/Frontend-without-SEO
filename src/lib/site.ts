/** Single source of truth for brand facts, navigation and route paths. */

function profileUrl(value: string | undefined) {
  const url = value?.trim();
  return url && /^https:\/\/\S+$/.test(url) ? url : undefined;
}

export const site = {
  name: "PickASparky",
  legalName: "PickASparky",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(
    /\/$/,
    "",
  ),
  tagline: "Find trusted EV charger installers across the UK.",
  description:
    "Compare up to 5 free quotes from vetted, local EV charger installers. Enter your postcode and PickASparky connects you with qualified electricians in your area.",
  locale: "en_GB",
  email: "hello@pickasparky.co.uk",
  privacyEmail: "privacy@pickasparky.co.uk",
  hours: { days: "Monday – Friday", time: "9:00am – 5:00pm (UK time)" },
  social: {
    x: profileUrl(process.env.NEXT_PUBLIC_SOCIAL_X_URL),
    linkedin: profileUrl(process.env.NEXT_PUBLIC_SOCIAL_LINKEDIN_URL),
  },
} as const;

/**
 * Every internal path, written in its canonical form: pages end with a slash
 * (see `trailingSlash` in next.config.ts), so links, redirects, canonical tags
 * and the sitemap all agree without a redirect hop.
 */
export const routes = {
  /** The homepage, and the logo's destination. Always "/", never with a fragment. */
  home: "/",
  quotes: "/get-quotes/",
  howItWorks: "/how-it-works/",
  howItWorksInstallers: "/how-it-works/#for-electricians",
  faq: "/faq/",
  faqInstallers: "/faq/#for-electricians",
  accreditations: "/electrician-accreditations/",
  safety: "/electrical-safety-regulations/",
  vetting: "/how-we-vet-installers/",
  about: "/about/",
  contact: "/contact/",
  join: "/join/",
  register: "/join/register/",
  login: "/installer/login/",
  forgotPassword: "/installer/forgot-password/",
  account: "/installer/account/",
  /** Directory hub. Location pages live directly under it. */
  installers: "/uk/ev-charger-installers/",
  /** Parent of every installer profile. Profiles are never nested under a location. */
  installerProfiles: "/uk/installer/",
  privacy: "/privacy-policy/",
  terms: "/terms-and-conditions/",
  cookies: "/cookie-policy/",
  /** Blog listing (page 1). Articles live directly under it. */
  blog: "/blog/",
} as const;

/** /uk/ev-charger-installers/manchester/ */
export const locationPath = (locationSlug: string) =>
  `${routes.installers}${locationSlug}/`;

/**
 * /uk/installer/abc-electrical/ : the one permanent, canonical URL of an
 * installer profile. It depends on the installer alone, so every location page
 * that lists the installer links to the same address.
 */
export const installerPath = (installerSlug: string) =>
  `${routes.installerProfiles}${installerSlug}/`;

/** /blog/what-affects-the-cost-of-a-home-ev-charger-installation/ */
export const blogPostPath = (postSlug: string) => `${routes.blog}${postSlug}/`;

/** /blog/ for page 1, then /blog/page/2/, /blog/page/3/ … */
export const blogListingPath = (page: number) =>
  page <= 1 ? routes.blog : `${routes.blog}page/${page}/`;

export type NavLink = { label: string; href: string };
export type NavGroup = { title: string; links: NavLink[] };

/** Footer link columns. */
export const navigation: NavGroup[] = [
  {
    title: "For Homeowners",
    links: [
      { label: "Get Quotes", href: routes.quotes },
      { label: "How It Works", href: routes.howItWorks },
      { label: "FAQ", href: routes.faq },
      { label: "Electrician Accreditations", href: routes.accreditations },
      { label: "Electrical Safety & Regulations", href: routes.safety },
      { label: "Blog", href: routes.blog },
    ],
  },
  {
    title: "For Installers",
    links: [
      { label: "Join as an Installer", href: routes.join },
      { label: "How It Works", href: routes.howItWorksInstallers },
      { label: "Installer FAQ", href: routes.faqInstallers },
      { label: "Installer Login", href: routes.login },
    ],
  },
  {
    title: "About",
    links: [
      { label: "About PickASparky", href: routes.about },
      { label: "Contact Us", href: routes.contact },
      { label: "How We Vet Installers", href: routes.vetting },
    ],
  },
];

export const legalLinks: NavLink[] = [
  { label: "Privacy Policy", href: routes.privacy },
  { label: "Terms & Conditions", href: routes.terms },
  { label: "Cookie Policy", href: routes.cookies },
];

/** The two options behind the header's menu button, on every screen size. */
export const headerMenu = [
  { label: "Join as an Electrician", href: routes.register, icon: "join" },
  { label: "Electrician Login", href: routes.login, icon: "login" },
] as const;