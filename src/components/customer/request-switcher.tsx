import Link from "next/link";
import type { RequestSummary } from "@/lib/types";
import { cn } from "@/lib/utils";
import { formatDate } from "./format";

/** Shown only when the customer has more than one request. */
export function RequestSwitcher({
  requests,
  currentId,
  basePath,
}: {
  requests: RequestSummary[];
  currentId: string;
  basePath: string;
}) {
  if (requests.length < 2) return null;
  return (
    <nav aria-label="Your requests" className="mb-5 flex flex-wrap gap-2">
      {requests.map((request) => (
        <Link
          key={request.id}
          href={`${basePath}?r=${request.id}`}
          aria-current={request.id === currentId ? "true" : undefined}
          className={cn(
            "rounded-full border px-3.5 py-1.5 text-xs font-medium",
            request.id === currentId
              ? "border-primary bg-primary-soft text-forest"
              : "border-line bg-white text-ink/75 hover:border-ink/30",
          )}
        >
          {request.reference} · {request.postcode} ·{" "}
          {formatDate(request.created_at)}
        </Link>
      ))}
    </nav>
  );
}
