import { BookOpen, LifeBuoy, Mail } from "lucide-react";
import Link from "next/link";
import { routes, site } from "@/lib/site";

export default function HelpPage() {
  const items = [
    {
      icon: BookOpen,
      title: "How quotes work",
      text: "What installers include, how to compare them and what happens when you accept.",
      href: routes.howItWorks,
      label: "Read the guide",
    },
    {
      icon: LifeBuoy,
      title: "Common questions",
      text: "Costs, grants, survey visits and what to expect on installation day.",
      href: routes.faq,
      label: "See the FAQ",
    },
    {
      icon: Mail,
      title: "Talk to us",
      text: `Email ${site.email} or use the contact form, Monday to Friday.`,
      href: routes.contact,
      label: "Contact support",
    },
  ];
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-[24px] font-extrabold tracking-[-0.01em] sm:text-[30px]">
          Help &amp; support
        </h1>
        <p className="mt-1.5 text-sm">
          We're happy to help with anything about your request or quotes.
        </p>
      </header>
      <ul className="grid gap-4 md:grid-cols-3">
        {items.map(({ icon: Icon, title, text, href, label }) => (
          <li
            key={title}
            className="flex flex-col rounded-2xl border border-line bg-white p-6 shadow-soft"
          >
            <span
              aria-hidden
              className="flex size-10 items-center justify-center rounded-lg bg-primary-soft text-primary"
            >
              <Icon className="size-5" strokeWidth={1.75} />
            </span>
            <h2 className="mt-4 text-base font-bold">{title}</h2>
            <p className="mt-1.5 flex-1 text-sm">{text}</p>
            <Link
              href={href}
              className="mt-4 text-sm font-semibold text-primary hover:text-primary-dark"
            >
              {label} →
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
