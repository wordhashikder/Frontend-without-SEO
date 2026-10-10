import type { Metadata } from "next";
import Link from "next/link";
import { OfferCard } from "@/components/conversation/offer-card";
import { ReplyForm } from "@/components/conversation/reply-form";
import { ButtonLink } from "@/components/ui/button";
import { Container, Eyebrow } from "@/components/ui/layout";
import { ApiError, api } from "@/lib/api";
import { getClientIp } from "@/lib/request";
import { pageMetadata } from "@/lib/seo";
import { installerPath, routes, site } from "@/lib/site";
import type {
  ConversationMessage,
  ConversationOffer,
  ConversationThread,
} from "@/lib/types";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  ...pageMetadata({
    title: "Your Messages and Quotes",
    description:
      "Read messages from your EV charger installer, reply, and accept or decline their quote.",
    path: "/messages",
    index: false,
  }),
  // The address carries the private link's token: never send it on as a referrer.
  referrer: "no-referrer",
};

type Lookup =
  | { status: "valid"; thread: ConversationThread }
  | { status: "invalid" }
  | { status: "unavailable" };

async function lookUp(token: string): Promise<Lookup> {
  if (!token || token.length > 2048) return { status: "invalid" };
  try {
    return {
      status: "valid",
      thread: await api.conversation(token, await getClientIp()),
    };
  } catch (error) {
    if (error instanceof ApiError) {
      return error.status < 500 && error.status !== 429
        ? { status: "invalid" }
        : { status: "unavailable" };
    }
    throw error;
  }
}

type Entry =
  | { kind: "message"; at: string; item: ConversationMessage }
  | { kind: "offer"; at: string; item: ConversationOffer };

const when = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Europe/London",
});

/**
 * The homeowner's private conversation page, opened from an emailed link (no
 * account needed): the job, the installer's messages and quotes in order, a
 * reply box, and accept / decline on open quotes.
 */
export default async function MessagesPage({
  searchParams,
}: PageProps<"/messages">) {
  const { token: raw } = await searchParams;
  const token = (Array.isArray(raw) ? raw[0] : raw)?.trim() ?? "";
  const lookup = await lookUp(token);

  if (lookup.status !== "valid") {
    return (
      <section className="bg-gradient-to-b from-surface to-white">
        <Container size="narrow" className="py-10 sm:py-16">
          <div className="mx-auto max-w-[640px] rounded-2xl border border-line bg-white p-6 shadow-card sm:p-8">
            <Eyebrow className="mb-2">Your messages</Eyebrow>
            <h1 className="text-[24px] font-bold leading-[1.2] sm:text-[30px]">
              {lookup.status === "invalid"
                ? "This link is no longer valid"
                : "We can't open your messages right now"}
            </h1>
            <p className="mt-3 text-[15px] leading-relaxed">
              {lookup.status === "invalid"
                ? "Please use the link in the most recent email from your installer. Need a hand? Email "
                : "This is usually temporary. Please try the link from your email again in a few minutes, or email "}
              <a
                href={`mailto:${site.email}`}
                className="font-medium text-primary underline underline-offset-2"
              >
                {site.email}
              </a>
              .
            </p>
            <ButtonLink href={routes.home} size="lg" arrow className="mt-7">
              Back to home
            </ButtonLink>
          </div>
        </Container>
      </section>
    );
  }

  const { thread } = lookup;
  const entries: Entry[] = [
    ...thread.messages.map(
      (item): Entry => ({ kind: "message", at: item.created_at, item }),
    ),
    ...thread.offers.map(
      (item): Entry => ({ kind: "offer", at: item.created_at, item }),
    ),
  ].sort((a, b) => a.at.localeCompare(b.at));

  return (
    <section className="bg-gradient-to-b from-surface to-white">
      <Container size="narrow" className="py-8 sm:py-12">
        <div className="mx-auto max-w-[720px]">
          <Eyebrow className="mb-2">Your messages</Eyebrow>
          <h1 className="text-[26px] font-extrabold leading-[1.2] tracking-[-0.01em] sm:text-[34px]">
            Your conversation with {thread.installer_name}
          </h1>
          <p className="mt-2 text-[15px]">
            Hi {thread.homeowner_name}. Everything {thread.installer_name} sends
            you is kept here.{" "}
            <Link
              href={installerPath(thread.installer_slug)}
              className="font-medium text-primary underline underline-offset-2"
            >
              View their profile
            </Link>
          </p>

          <details className="mt-6 rounded-xl border border-line bg-white p-5 shadow-soft">
            <summary className="cursor-pointer text-sm font-semibold text-ink">
              Your request
              {thread.job.reference ? ` (${thread.job.reference})` : ""}
            </summary>
            {thread.job.summary.length > 0 ? (
              <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-[180px_1fr]">
                {thread.job.summary.map(([question, answer]) => (
                  <div key={question} className="contents">
                    <dt className="text-subtle">{question}</dt>
                    <dd className="text-ink">{answer}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
            {thread.job.message && thread.job.summary.length === 0 ? (
              <p className="mt-4 whitespace-pre-line text-sm">
                {thread.job.message}
              </p>
            ) : null}
          </details>

          <ol className="mt-8 space-y-4" aria-label="Messages and quotes">
            {entries.length === 0 ? (
              <li className="rounded-xl border border-dashed border-line p-6 text-center text-sm">
                No messages yet.
              </li>
            ) : null}
            {entries.map((entry) => (
              <li key={`${entry.kind}-${entry.item.id}`}>
                {entry.kind === "offer" ? (
                  <OfferCard offer={entry.item} token={token} />
                ) : (
                  <MessageBubble
                    message={entry.item}
                    installerName={thread.installer_name}
                  />
                )}
              </li>
            ))}
          </ol>

          <div className="mt-8 rounded-xl border border-line bg-white p-5 shadow-card sm:p-6">
            <ReplyForm token={token} installerName={thread.installer_name} />
          </div>
          <p className="mt-4 text-xs text-subtle">
            Keep this link private: anyone with it can read and reply to this
            conversation.
          </p>
        </div>
      </Container>
    </section>
  );
}

function MessageBubble({
  message,
  installerName,
}: {
  message: ConversationMessage;
  installerName: string;
}) {
  if (message.sender === "system") {
    return (
      <p className="mx-auto max-w-[520px] whitespace-pre-line rounded-full bg-surface px-4 py-2 text-center text-xs text-subtle">
        {message.body}
      </p>
    );
  }
  const mine = message.sender === "homeowner";
  const author = mine
    ? "You"
    : message.sender === "team"
      ? "PickASparky team"
      : installerName;
  return (
    <div className={cn("flex", mine ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-3",
          mine
            ? "rounded-br-sm bg-primary text-white"
            : "rounded-bl-sm border border-line bg-white text-ink shadow-soft",
        )}
      >
        <p
          className={cn(
            "text-xs font-semibold",
            mine ? "text-white/85" : "text-subtle",
          )}
        >
          {author} · {when.format(new Date(message.created_at))}
        </p>
        <p className="mt-1 whitespace-pre-line text-[15px] leading-relaxed">
          {message.body}
        </p>
      </div>
    </div>
  );
}
