import {
  Clock,
  FileText,
  MessageSquare,
  PoundSterling,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { formatDate, gbp } from "@/components/customer/format";
import { Journey } from "@/components/customer/journey";
import { RequestSwitcher } from "@/components/customer/request-switcher";
import { InstallerLogo } from "@/components/sections/installer-card";
import { ButtonLink } from "@/components/ui/button";
import { getSelectedRequest } from "@/lib/customer-data";
import { getCustomerSession } from "@/lib/customer-session";
import { installerPath, routes } from "@/lib/site";
import { cn } from "@/lib/utils";

const stateText = {
  awaiting_quote: "Preparing a quote",
  quoted: "Quote received",
  declined: "Quote declined",
  accepted: "Quote accepted",
} as const;

const statusTone: Record<string, string> = {
  accepted: "bg-primary text-white",
  quotes_received: "bg-primary-soft text-forest",
  matching: "bg-[#fff7e0] text-[#8a6100]",
  reviewing: "bg-[#fff7e0] text-[#8a6100]",
  waiting: "bg-surface text-ink",
};

/** My Request: where things stand, the answers given and the journey ahead. */
export default async function MyRequestPage({
  searchParams,
}: PageProps<"/uk/my-quotes">) {
  const { r } = await searchParams;
  const session = await getCustomerSession();
  const selected = await getSelectedRequest(Array.isArray(r) ? r[0] : r);
  if (!session || !selected) return null;
  const { customer } = session.overview;
  const { requests, detail } = selected;

  if (!detail) {
    return (
      <div className="rounded-2xl border border-line bg-white p-8 text-center shadow-soft">
        <h1 className="text-2xl font-bold">Welcome, {customer.first_name}</h1>
        <p className="mx-auto mt-3 max-w-[420px] text-sm">
          You haven't asked for any quotes yet. It takes about two minutes and
          it's free.
        </p>
        <ButtonLink href={routes.quotes} size="lg" arrow className="mt-6">
          Get free quotes
        </ButtonLink>
      </div>
    );
  }

  const stats = [
    {
      icon: FileText,
      value: `${detail.quotes_received} of ${detail.slots_total}`,
      label: "quotes received",
    },
    {
      icon: MessageSquare,
      value: String(detail.unread_messages),
      label: "unread messages",
    },
    {
      icon: PoundSterling,
      value: detail.average_price ? gbp(detail.average_price) : "-",
      label: "average quote",
    },
  ];

  return (
    <div className="space-y-6">
      <RequestSwitcher
        requests={requests}
        currentId={detail.id}
        basePath="/uk/my-quotes/"
      />

      <section className="rounded-2xl border border-line bg-white p-6 shadow-soft sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-[24px] font-extrabold tracking-[-0.01em] sm:text-[30px]">
              Hi {customer.first_name}, here's your request
            </h1>
            <p className="mt-1.5 text-sm">
              Reference {detail.reference} · sent{" "}
              {formatDate(detail.created_at)}
            </p>
          </div>
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold",
              statusTone[detail.status] ?? "bg-surface text-ink",
            )}
          >
            <Clock aria-hidden className="size-3.5" />
            {detail.status_label}
          </span>
        </div>
        <p className="mt-3 text-sm">{detail.status_detail}</p>
        <dl className="mt-6 grid gap-3 sm:grid-cols-3">
          {stats.map(({ icon: Icon, value, label }) => (
            <div
              key={label}
              className="flex items-center gap-3 rounded-xl bg-surface px-4 py-3.5"
            >
              <span
                aria-hidden
                className="flex size-10 items-center justify-center rounded-lg bg-white text-primary"
              >
                <Icon className="size-5" strokeWidth={1.75} />
              </span>
              <div>
                <dd className="text-lg leading-tight font-bold text-ink">
                  {value}
                </dd>
                <dt className="text-xs text-subtle">{label}</dt>
              </div>
            </div>
          ))}
        </dl>
        {detail.quotes_received > 0 ? (
          <ButtonLink href="/uk/my-quotes/quotes/" arrow className="mt-6">
            Compare your quotes
          </ButtonLink>
        ) : null}
      </section>

      <section
        aria-labelledby="journey-heading"
        className="rounded-2xl border border-line bg-white p-6 shadow-soft sm:p-8"
      >
        <h2 id="journey-heading" className="mb-6 text-lg font-bold">
          Your installation journey
        </h2>
        <Journey steps={detail.journey} />
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section
          aria-labelledby="summary-heading"
          className="rounded-2xl border border-line bg-white p-6 shadow-soft"
        >
          <h2 id="summary-heading" className="text-lg font-bold">
            Request summary
          </h2>
          <dl className="mt-4 divide-y divide-line text-sm">
            {detail.answers.map(([question, answer]) => (
              <div
                key={question}
                className="grid grid-cols-[120px_1fr] gap-3 py-2.5"
              >
                <dt className="text-subtle">{question}</dt>
                <dd className="text-ink">{answer}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section
          aria-labelledby="installers-heading"
          className="rounded-2xl border border-line bg-white p-6 shadow-soft"
        >
          <h2 id="installers-heading" className="text-lg font-bold">
            Installers with your request
          </h2>
          {detail.installers.length === 0 ? (
            <p className="mt-4 text-sm">
              Nobody has your request yet. We'll email you the moment installers
              are lined up.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {detail.installers.map(
                ({ installer, state, conversation_id }) => (
                  <li key={installer.slug} className="flex items-center gap-3">
                    <InstallerLogo
                      name={installer.business_name}
                      logoUrl={installer.logo_url}
                      size={44}
                    />
                    <div className="min-w-0 flex-1">
                      <Link
                        href={installerPath(installer.slug)}
                        className="block truncate text-sm font-semibold text-ink hover:underline"
                      >
                        {installer.business_name}
                      </Link>
                      <p className="text-xs text-subtle">{stateText[state]}</p>
                    </div>
                    {conversation_id ? (
                      <Link
                        href={`/uk/my-quotes/messages/?c=${conversation_id}`}
                        className="text-xs font-semibold text-primary hover:text-primary-dark"
                      >
                        Messages
                      </Link>
                    ) : null}
                  </li>
                ),
              )}
            </ul>
          )}
        </section>
      </div>

      <p className="flex items-start gap-3 rounded-2xl bg-mint-soft px-5 py-4 text-sm">
        <ShieldCheck
          aria-hidden
          className="mt-0.5 size-5 shrink-0 text-primary"
        />
        <span>
          <span className="font-semibold text-ink">
            Free and with no obligation.
          </span>{" "}
          PickASparky never charges homeowners, and you only go ahead with an
          installer when you accept their quote.
        </span>
      </p>
    </div>
  );
}
