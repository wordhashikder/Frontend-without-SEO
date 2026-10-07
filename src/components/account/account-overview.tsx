import {
  BadgeCheck,
  CircleAlert,
  CircleCheck,
  CreditCard,
  Hourglass,
  LifeBuoy,
  type LucideIcon,
  TriangleAlert,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { signOut } from "@/actions/auth";
import {
  PortalAction,
  UpgradeActions,
} from "@/components/account/billing-actions";
import { Card, textLink } from "@/components/auth/auth-card";
import { SubmitButton } from "@/components/auth/submit-button";
import { IconBadge } from "@/components/ui/icon-badge";
import { Container, Eyebrow } from "@/components/ui/layout";
import { planByKey, plans } from "@/content/plans";
import { routes, site } from "@/lib/site";
import type {
  CurrentUser,
  InstallerStatus,
  SubscriptionStatus,
} from "@/lib/types";
import { cn } from "@/lib/utils";

type Installer = NonNullable<CurrentUser["installer"]>;
type Tone = "green" | "amber" | "red" | "neutral";

const pillTones: Record<Tone, string> = {
  green: "bg-primary-soft text-forest",
  amber: "bg-amber-100 text-amber-900",
  red: "bg-red-50 text-red-700",
  neutral: "bg-stone text-ink",
};

function Pill({ tone, children }: { tone: Tone; children: ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold",
        pillTones[tone],
      )}
    >
      {children}
    </span>
  );
}

const noticeTones = {
  success: { box: "bg-primary-soft text-forest", icon: CircleCheck },
  info: { box: "bg-mint-soft text-ink", icon: CircleAlert },
  warning: { box: "bg-amber-50 text-amber-900", icon: TriangleAlert },
} as const;

function Notice({
  tone,
  children,
}: {
  tone: keyof typeof noticeTones;
  children: ReactNode;
}) {
  const Icon = noticeTones[tone].icon;
  return (
    <div
      role={tone === "warning" ? "alert" : "status"}
      className={cn(
        "flex gap-3 rounded-xl px-4 py-3.5 text-sm leading-relaxed",
        noticeTones[tone].box,
      )}
    >
      <Icon aria-hidden className="mt-0.5 size-4 shrink-0" strokeWidth={2} />
      <div>{children}</div>
    </div>
  );
}

function Panel({
  icon,
  title,
  pill,
  children,
}: {
  icon: LucideIcon;
  title: string;
  pill?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Card className="flex h-full flex-col">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <IconBadge icon={icon} tone="mint" size="sm" />
        <h2 className="text-lg font-bold tracking-[-0.01em]">{title}</h2>
        {pill ? <span className="ml-auto">{pill}</span> : null}
      </div>
      <div className="mt-5 flex flex-1 flex-col gap-4 text-sm leading-relaxed">
        {children}
      </div>
    </Card>
  );
}

const supportLink = (
  <a href={`mailto:${site.email}`} className={textLink}>
    {site.email}
  </a>
);

const listingStatus: Record<
  InstallerStatus,
  { label: string; tone: Tone; icon: LucideIcon; body: ReactNode }
> = {
  pending: {
    label: "In review",
    tone: "amber",
    icon: Hourglass,
    body: (
      <p>
        We&apos;re reviewing your business details. We&apos;ll email you as soon
        as your listing has been reviewed.
      </p>
    ),
  },
  approved: {
    label: "Live",
    tone: "green",
    icon: BadgeCheck,
    body: (
      <>
        <p>
          Your profile is live on PickASparky, so homeowners in your area can
          find your business.
        </p>
        <p>
          <Link href={routes.installers} className={textLink}>
            Browse the installer directory
          </Link>
        </p>
      </>
    ),
  },
  rejected: {
    label: "Not approved",
    tone: "red",
    icon: CircleAlert,
    body: (
      <p>
        We weren&apos;t able to approve your listing, so it isn&apos;t shown to
        homeowners. If you have questions or your details have changed, please{" "}
        <Link href={routes.contact} className={textLink}>
          contact support
        </Link>
        .
      </p>
    ),
  },
  suspended: {
    label: "Suspended",
    tone: "red",
    icon: CircleAlert,
    body: (
      <p>
        Your listing is suspended and isn&apos;t shown to homeowners at the
        moment. Please{" "}
        <Link href={routes.contact} className={textLink}>
          contact support
        </Link>{" "}
        so we can help.
      </p>
    ),
  },
};

const subscriptionLabels: Record<
  SubscriptionStatus,
  { label: string; tone: Tone } | null
> = {
  none: null,
  incomplete: { label: "Payment incomplete", tone: "amber" },
  active: { label: "Active", tone: "green" },
  past_due: { label: "Payment overdue", tone: "amber" },
  canceled: { label: "Cancelled", tone: "neutral" },
};

const paidPlans = plans.flatMap((plan) =>
  plan.key === "free"
    ? []
    : [{ key: plan.key, name: plan.name, price: plan.price }],
);

function Membership({ installer }: { installer: Installer }) {
  const plan = planByKey(installer.plan);
  const status = installer.subscription_status;
  const subscription = subscriptionLabels[status];
  const paid = installer.plan !== "free";
  // Never start a new payment for a listing we have turned down or suspended.
  const canUpgrade =
    installer.status === "pending" || installer.status === "approved";

  let actions: ReactNode;
  if (status === "past_due") {
    actions = (
      <>
        <Notice tone="warning">
          We couldn&apos;t take your last payment. Update your payment method to
          keep your {plan?.name ?? "paid"} plan.
        </Notice>
        <div className="mt-auto">
          <PortalAction label="Update payment method" />
        </div>
      </>
    );
  } else if (paid && status === "active") {
    actions = (
      <>
        <p>
          Manage your payment method, invoices and subscription in the secure
          Stripe billing portal.
        </p>
        <div className="mt-auto">
          <PortalAction label="Manage billing" />
        </div>
      </>
    );
  } else if (!paid && canUpgrade) {
    actions = (
      <>
        <p>
          {status === "incomplete"
            ? "Your last checkout wasn't completed, so you're still on the Free plan. You can try again below."
            : status === "canceled"
              ? "Your paid subscription has ended and you're on the Free plan. You can upgrade again at any time."
              : "Upgrade to be featured, appear higher in the list and receive enquiries from homeowners."}
        </p>
        <div className="mt-auto space-y-3">
          <UpgradeActions plans={paidPlans} />
          <p className="text-[13px]">
            Secure payment by Stripe. No long{"\u2011"}term contracts.{" "}
            <Link href={`${routes.join}#plans-heading`} className={textLink}>
              Compare plans
            </Link>
          </p>
        </div>
      </>
    );
  } else {
    actions = (
      <p>
        To make changes to your membership, email {supportLink} and we&apos;ll
        help.
      </p>
    );
  }

  return (
    <Panel
      icon={CreditCard}
      title="Membership"
      pill={
        subscription ? (
          <Pill tone={subscription.tone}>{subscription.label}</Pill>
        ) : null
      }
    >
      <p className="flex items-baseline gap-2 text-ink">
        <span className="text-[26px] font-extrabold leading-none tracking-[-0.02em]">
          {plan?.name ?? installer.plan}
        </span>
        {plan ? (
          <span className="text-sm text-muted">£{plan.price} / month</span>
        ) : null}
      </p>
      {actions}
    </Panel>
  );
}

function SignOutButton() {
  return (
    <form action={signOut}>
      <SubmitButton variant="outline" pendingLabel="Signing out…">
        Sign out
      </SubmitButton>
    </form>
  );
}

/**
 * The installer's holding page: listing status, membership and billing.
 * Receives an already-verified user; it performs no access checks itself.
 */
export function AccountOverview({
  user,
  checkout,
}: {
  user: CurrentUser;
  /** `?checkout=` value Stripe Checkout returns the installer with. */
  checkout?: string;
}) {
  const installer = user.installer;
  const upgraded =
    installer?.plan !== "free" && installer?.subscription_status === "active";

  return (
    <Container className="py-10 sm:py-14 md:py-16">
      <div className="mx-auto max-w-[960px]">
        <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
          <div className="min-w-0">
            <Eyebrow className="mb-2">Installer account</Eyebrow>
            <h1 className="break-words text-[28px] font-extrabold leading-tight tracking-[-0.02em] sm:text-4xl">
              {installer ? `Welcome, ${installer.business_name}` : "Welcome"}
            </h1>
            <p className="mt-2 text-sm">
              Signed in as{" "}
              <span className="break-all font-medium text-ink">
                {user.email}
              </span>
            </p>
          </div>
          <SignOutButton />
        </header>

        {checkout === "success" ? (
          <div className="mt-8">
            <Notice tone="success">
              {installer && upgraded ? (
                <>
                  <span className="font-semibold">Payment received.</span> Your{" "}
                  {planByKey(installer.plan)?.name} plan is now active.
                </>
              ) : (
                <>
                  <span className="font-semibold">Payment received.</span> Your
                  plan will update within a minute.{" "}
                  <Link
                    href={routes.account}
                    className="font-semibold underline underline-offset-4"
                  >
                    Refresh this page
                  </Link>
                </>
              )}
            </Notice>
          </div>
        ) : null}
        {checkout === "cancelled" ? (
          <div className="mt-8">
            <Notice tone="info">
              Checkout was cancelled and no payment was taken. You can upgrade
              whenever you&apos;re ready.
            </Notice>
          </div>
        ) : null}

        {installer ? (
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <Panel
              icon={listingStatus[installer.status].icon}
              title="Listing status"
              pill={
                <Pill tone={listingStatus[installer.status].tone}>
                  {listingStatus[installer.status].label}
                </Pill>
              }
            >
              {listingStatus[installer.status].body}
            </Panel>
            <Membership installer={installer} />
          </div>
        ) : (
          <Card className="mt-8 text-sm leading-relaxed">
            This account isn&apos;t linked to an installer business, so there is
            no listing or membership to show here.
          </Card>
        )}

        <aside className="mt-6 flex gap-4 rounded-2xl bg-mint-soft p-6">
          <IconBadge icon={LifeBuoy} tone="mint" size="sm" />
          <div className="text-sm leading-relaxed">
            <h2 className="text-base font-bold">
              The full installer dashboard is on its way
            </h2>
            <p className="mt-2">
              Soon you&apos;ll be able to edit your profile and manage enquiries
              here. Until then, if you need to change your business details or
              have a question, email {supportLink}. We&apos;re available{" "}
              {site.hours.days}, {site.hours.time} and reply within 1 working
              day.
            </p>
          </div>
        </aside>
      </div>
    </Container>
  );
}
