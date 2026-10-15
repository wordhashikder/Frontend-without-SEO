import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/components/customer/format";
import { Thread } from "@/components/customer/thread";
import { InstallerLogo } from "@/components/sections/installer-card";
import { ApiError, api } from "@/lib/api";
import { getCustomerSession } from "@/lib/customer-session";
import type { ConversationThread } from "@/lib/types";
import { cn } from "@/lib/utils";

export default async function MessagesPage({
  searchParams,
}: PageProps<"/uk/my-quotes/messages">) {
  const { c } = await searchParams;
  const requested = Array.isArray(c) ? c[0] : c;
  const session = await getCustomerSession();
  if (!session) return null;
  const list = await api.customerConversations(session.token);
  const conversations = list.items;
  const selected =
    conversations.find((item) => item.id === requested) ?? conversations[0];

  let thread: ConversationThread | null = null;
  if (selected) {
    try {
      thread = await api.customerConversation(session.token, selected.id);
    } catch (error) {
      if (!(error instanceof ApiError && error.status === 404)) throw error;
    }
  }
  // On phones a thread is its own screen; without a choice the list is shown.
  const showThreadOnMobile = Boolean(requested && thread);

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-[24px] font-extrabold tracking-[-0.01em] sm:text-[30px]">
          Messages
        </h1>
        <p className="mt-1.5 text-sm">
          Everything your installers send you is kept here, with your replies.
        </p>
      </header>

      {conversations.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-white p-8 text-center">
          <p className="text-[15px] font-semibold text-ink">No messages yet</p>
          <p className="mx-auto mt-2 max-w-[420px] text-sm">
            When an installer writes to you or sends a quote, the conversation
            appears here.
          </p>
        </div>
      ) : (
        <div className="grid overflow-hidden rounded-2xl border border-line bg-white shadow-soft lg:grid-cols-[320px_minmax(0,1fr)]">
          <nav
            aria-label="Conversations"
            className={cn(
              "border-line lg:block lg:border-r",
              showThreadOnMobile && "hidden",
            )}
          >
            <ul className="divide-y divide-line">
              {conversations.map((item) => (
                <li key={item.id}>
                  <Link
                    href={`/uk/my-quotes/messages/?c=${item.id}`}
                    aria-current={item.id === selected?.id ? "true" : undefined}
                    className={cn(
                      "flex items-start gap-3 px-4 py-3.5 hover:bg-surface",
                      item.id === selected?.id && "bg-primary-soft/60",
                    )}
                  >
                    <InstallerLogo
                      name={item.installer_name}
                      logoUrl={null}
                      size={40}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span
                          className={cn(
                            "truncate text-sm text-ink",
                            item.unread ? "font-bold" : "font-semibold",
                          )}
                        >
                          {item.installer_name}
                        </span>
                        <span className="shrink-0 text-[11px] text-subtle">
                          {formatDate(item.last_message_at)}
                        </span>
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-subtle">
                        {item.last_message ??
                          (item.offer_count > 0
                            ? "Sent you a quote"
                            : "No messages yet")}
                      </span>
                    </span>
                    {item.unread ? (
                      <span className="mt-1.5 size-2.5 shrink-0 rounded-full bg-primary">
                        <span className="sr-only">Unread</span>
                      </span>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <section
            aria-label="Conversation"
            className={cn("min-w-0", !showThreadOnMobile && "hidden lg:block")}
          >
            <Link
              href="/uk/my-quotes/messages/"
              className="flex items-center gap-1 border-b border-line px-4 py-2.5 text-xs font-semibold text-primary lg:hidden"
            >
              <ChevronLeft aria-hidden className="size-4" />
              All messages
            </Link>
            {thread ? <Thread thread={thread} /> : null}
          </section>
        </div>
      )}
    </div>
  );
}
