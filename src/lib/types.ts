/**
 * Types mirroring the FastAPI response/request schemas (backend/app/schemas).
 * Keep these in step with the API; the OpenAPI document lives at {API_URL}/docs.
 */

/** A plan's key ("free", "pro"...). Plans are managed in the Dashboard, so keys are not fixed. */
export type Plan = string;

/** A membership plan as the API publishes it (GET /plans). */
export interface PublicPlan {
  key: Plan;
  name: string;
  tagline: string | null;
  features: string[];
  is_popular: boolean;
  is_default: boolean;
  /** Monthly price in pence; null for the free plan. */
  price_pence: number | null;
  currency: string;
  sort_rank: number;
}

export interface CheckoutStatus {
  state: "paid" | "processing" | "open" | "expired";
  plan: { key: Plan; name: string } | null;
}
export type InstallerStatus = "pending" | "approved" | "rejected" | "suspended";
export type SubscriptionStatus =
  | "none"
  | "incomplete"
  | "active"
  | "past_due"
  | "canceled";

export type ServiceKey =
  | "ev_charger_installation"
  | "domestic_electrical"
  | "commercial_electrical"
  | "electrical_repairs"
  | "solar_battery"
  | "smart_home"
  | "eicr_testing";

export type AccreditationScheme =
  | "ozev"
  | "napit"
  | "niceic"
  | "trustmark"
  | "mcs"
  | "elecsa";

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}

export interface LocationRef {
  slug: string;
  name: string;
}

export interface LocationSummary extends LocationRef {
  region: string;
  latitude: number;
  longitude: number;
  installer_count: number;
}

export interface LocationDetail extends LocationSummary {
  intro: string | null;
  /**
   * The town's photo: one shipped with the site (public/images/locations/) or
   * one the admin uploaded. Without one, the page draws a local map.
   */
  image_url: string | null;
  image_alt: string | null;
  /** Photo credit, e.g. "Photo: Jane Doe". */
  image_credit: string | null;
  /** Search snippet overrides set in the Dashboard; null uses the standard wording. */
  seo_title?: string | null;
  seo_description?: string | null;
  /** Heading override; null uses the location template's heading. */
  h1_heading?: string | null;
  /** This town's own closing section; null uses the location template's. */
  extra_title?: string | null;
  extra_body?: string | null;
  updated_at?: string | null;
}

/** A page's editable content (see `@/lib/content`). */
export interface PublicContent {
  key: string;
  content: Record<string, unknown>;
  updated_at: string | null;
}

export interface PublicPlatform {
  platform_name: string;
  support_email: string;
}

/** The four directory columns, each in display order; no location appears twice. */
export interface LocationDirectory {
  nearby: LocationRef[];
  popular: LocationRef[];
  more_in_area: LocationRef[];
  other: LocationRef[];
}

export interface InstallerCard {
  slug: string;
  business_name: string;
  logo_url: string | null;
  town: string;
  location_slug: string;
  rating_avg: number | null;
  review_count: number;
  plan: Plan;
  is_featured: boolean;
  verified: boolean;
  /**
   * False for a free listing PickASparky added that the business has not
   * claimed yet: its profile offers a "Claim this listing" link.
   */
  is_claimed?: boolean;
}

export interface Accreditation {
  scheme: AccreditationScheme;
  registration_number: string | null;
  verified: boolean;
}

export interface InstallerPhoto {
  id: string;
  url: string;
  alt: string | null;
}

export interface InstallerDetail extends InstallerCard {
  tagline: string | null;
  description: string | null;
  years_experience: number | null;
  services: ServiceKey[];
  accreditations: Accreditation[];
  areas_covered: string[];
  coverage: { latitude: number; longitude: number; radius_miles: number };
  photos: InstallerPhoto[];
  /** True when the installer's plan lets homeowners request a quote directly. */
  accepts_direct_quotes: boolean;
  /** "M20": the outward part of the base postcode. */
  postcode_district: string;
  listed_since: string | null;
  /** The town's photo, shown behind a profile with no photos of its own. */
  cover_image: {
    url: string;
    alt: string | null;
    credit: string | null;
  } | null;
}

export interface Review {
  id: string;
  rating: number;
  title: string;
  body: string;
  author_name: string;
  author_location: string | null;
  verified: boolean;
  created_at: string;
}

export interface PostcodeLookup {
  postcode: string;
  district: string | null;
  region: string | null;
  installers_in_range: number;
}

export type InstallationType =
  | "new_home"
  | "replace_existing"
  | "additional"
  | "workplace_commercial"
  | "not_sure";

export type ChargerLocation =
  | "house_wall"
  | "garage"
  | "detached_garage"
  | "post_pedestal"
  | "workplace_commercial"
  | "other"
  | "not_sure";

export type ExistingCharger = "no" | "replace" | "add_another";

/** Follow-up to Question 3. Allowed values depend on `existing_charger`. */
export type ChargerFollowup =
  // existing_charger = "no" | "add_another"
  | "already_bought"
  | "chosen_not_bought"
  | "installer_recommend"
  // existing_charger = "replace"
  | "fit_customer_charger"
  | "supply_and_install"
  | "recommend_replacement"
  // all branches
  | "not_sure";

export type FuseBoxDistance =
  | "very_close"
  | "inside_house"
  | "under_10m"
  | "over_10m"
  | "not_sure";

export type InstallTiming =
  | "asap"
  | "within_2_weeks"
  | "within_month"
  | "one_to_three_months"
  | "researching";

export interface QuoteRequestCreate {
  postcode: string;
  installation_type: InstallationType;
  charger_location: ChargerLocation;
  existing_charger: ExistingCharger;
  charger_followup: ChargerFollowup;
  fuse_box_distance: FuseBoxDistance;
  vehicle: string | null;
  vehicle_undecided: boolean;
  timing: InstallTiming;
  notes: string | null;
  first_name: string;
  email: string;
  /** Optional: null when the customer prefers to be contacted by email. */
  phone: string | null;
  consent: true;
  /** Set when the request is sent to one installer from their profile page. */
  installer_slug?: string | null;
  /** Honeypot. Must be empty. */
  website?: string;
}

export interface QuoteRequestCreated {
  reference: string;
  postcode: string;
  matched_installers: number;
  /** Automatic matching is off: the team picks the installers and emails the homeowner. */
  held?: boolean;
}

export type ContactSubject =
  | "getting_quotes"
  | "joining"
  | "account"
  | "feedback"
  | "other";

export interface ContactMessageCreate {
  name: string;
  email: string;
  subject: ContactSubject;
  message: string;
  website?: string;
}

/** The "Request a Quote" form on an installer's profile: a message to that installer only. */
export interface InstallerEnquiryCreate {
  name: string;
  email: string;
  /** Optional: null when the customer prefers to be contacted by email. */
  phone: string | null;
  message: string;
  /** Honeypot. Must be empty. */
  website?: string;
}

export interface MessageResponse {
  message: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  business_name: string;
  contact_name: string;
  phone: string;
  postcode: string;
  plan: Plan;
  accept_terms: true;
}

export interface TokenPair {
  access_token: string;
  refresh_token: string;
  token_type: "bearer";
  /** Lifetime of the access token in seconds. */
  expires_in: number;
}

export interface CurrentUser {
  id: string;
  email: string;
  role: "installer" | "admin";
  email_verified: boolean;
  installer: {
    slug: string;
    business_name: string;
    status: InstallerStatus;
    plan: Plan;
    plan_name: string;
    subscription_status: SubscriptionStatus;
  } | null;
}

export interface ReviewCreate {
  token: string;
  rating: number;
  title: string;
  body: string;
  author_name: string;
  author_location?: string | null;
}

export interface ReviewInvite {
  installer_name: string;
  installer_slug: string;
}

export interface UrlResponse {
  url: string;
}

/** A published blog post, as listed. */
export interface BlogPostSummary {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  category_slug: string;
  author_name: string;
  /** Absolute (Cloudinary) URL or a site path such as /images/…; null when unset. */
  cover_image_url: string | null;
  cover_image_alt: string | null;
  reading_minutes: number;
  is_featured: boolean;
  published_at: string;
  updated_at: string;
}

/** A published blog post with its Markdown body. */
export interface BlogPostDetail extends BlogPostSummary {
  body: string;
  seo_title: string | null;
  seo_description: string | null;
}

/** Error envelope returned by the API for every non-2xx response. */
export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    fields?: Record<string, string>;
  };
}

/** The listing a claim link is for. */
export interface ClaimPreview {
  business_name: string;
  slug: string;
  email: string;
  town: string;
}

export type MessageSender = "installer" | "homeowner" | "team" | "system";
export type OfferStatus = "sent" | "accepted" | "declined" | "withdrawn";

export interface ConversationMessage {
  id: string;
  sender: MessageSender;
  body: string;
  created_at: string;
}

/** A priced quote an installer sent; shown to people as a "quote". */
export interface ConversationOffer {
  id: string;
  reference: string;
  /** Decimal string, e.g. "949.00". */
  amount: string;
  includes_vat: boolean;
  description: string;
  valid_until: string | null;
  status: OfferStatus;
  responded_at: string | null;
  response_note: string | null;
  created_at: string;
}

/** A conversation as the homeowner sees it through their private link. */
export interface ConversationThread {
  id: string;
  installer_name: string;
  installer_slug: string;
  homeowner_name: string;
  job: {
    kind: "lead" | "enquiry";
    reference: string | null;
    summary: [string, string][];
    message: string | null;
    created_at: string;
  };
  messages: ConversationMessage[];
  offers: ConversationOffer[];
  created_at: string;
}

// ---- Customer quote dashboard (magic-link sign-in) ----------------------------

export interface Customer {
  id: string;
  email: string;
  first_name: string;
  phone: string | null;
  created_at: string;
}

export interface CustomerSessionResponse {
  session_token: string;
  expires_in: number;
  customer: Customer;
}

export interface InstallerBrief {
  slug: string;
  business_name: string;
  town: string;
  logo_url: string | null;
  rating_avg: number | null;
  review_count: number;
  verified: boolean;
  years_experience: number | null;
  accreditations: string[];
  plan: string;
}

export interface JourneyStep {
  key: string;
  label: string;
  state: "done" | "current" | "upcoming";
}

export interface CustomerQuote {
  id: string;
  reference: string;
  amount: string;
  includes_vat: boolean;
  description: string;
  valid_until: string | null;
  status: OfferStatus;
  created_at: string;
  conversation_id: string;
  installer: InstallerBrief;
  highlight: "lowest" | null;
}

export interface MatchedInstaller {
  installer: InstallerBrief;
  state: "awaiting_quote" | "quoted" | "declined" | "accepted";
  conversation_id: string | null;
}

export interface RequestSummary {
  id: string;
  reference: string;
  postcode: string;
  district: string | null;
  installation_type: string;
  timing: string;
  status: string;
  status_label: string;
  status_detail: string;
  created_at: string;
  installers_matched: number;
  quotes_received: number;
  slots_total: number;
  average_price: string | null;
  lowest_price: string | null;
  unread_messages: number;
}

export interface RequestDetail extends RequestSummary {
  answers: [string, string][];
  journey: JourneyStep[];
  quotes: CustomerQuote[];
  installers: MatchedInstaller[];
  conversation_ids: string[];
}

export interface CustomerOverview {
  customer: Customer;
  requests: RequestSummary[];
  unread_messages: number;
}

export interface CustomerConversation {
  id: string;
  installer_id: string;
  installer_name: string;
  installer_slug: string;
  kind: "lead" | "enquiry";
  last_message_at: string;
  last_message: string | null;
  last_sender: MessageSender | null;
  unread: boolean;
  offer_count: number;
  latest_offer_status: OfferStatus | null;
}
