import { ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { HomeLink } from "@/components/layout/home-link";
import { Container } from "@/components/ui/layout";
import { legalLinks, navigation, site } from "@/lib/site";

function XIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="size-4 fill-current">
      <path d="M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.66l-5.21-6.82-5.97 6.82H1.67l7.73-8.84L1.25 2.25h6.83l4.71 6.23 5.45-6.23Zm-1.16 17.52h1.83L7.08 4.13H5.12l11.96 15.64Z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="size-4.5 fill-[#0a66c2]">
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z" />
    </svg>
  );
}

/**
 * Both icons are always shown, as in the design. An icon becomes a link once its
 * profile URL is set (see `.env.example`); until then it is decorative, so the
 * footer never links to a profile that does not exist.
 */
const socials = [
  { name: "X", href: site.social.x, icon: XIcon },
  { name: "LinkedIn", href: site.social.linkedin, icon: LinkedInIcon },
];

export function SiteFooter() {
  return (
    <footer>
      <div className="bg-footer">
        <Container className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[1.3fr_1.15fr_0.75fr_0.85fr_0.75fr] lg:gap-12 lg:py-14">
          <div className="sm:col-span-2 lg:col-span-1">
            <HomeLink aria-label={`${site.name} home`}>
              <Image
                src="/logo.svg"
                alt={site.name}
                width={157}
                height={32}
                unoptimized
                className="h-8 w-auto"
              />
            </HomeLink>
            <p className="mt-4 max-w-68 text-sm leading-relaxed text-ink/80">
              {site.tagline}
            </p>
            <p className="mt-3 max-w-68 text-xs leading-relaxed">
              Compare up to 5 quotes from verified installers and get the right
              charger for your home or business.
            </p>
          </div>

          {navigation.map((group) => (
            <nav key={group.title} aria-label={group.title}>
              <h2 className="text-sm font-semibold text-ink">{group.title}</h2>
              <ul className="mt-4">
                {group.links.map((link) => (
                  <li key={link.href} className="border-b border-ink/10">
                    <Link
                      href={link.href}
                      className="flex items-center justify-between gap-3 py-2.5 text-sm text-ink/75 hover:text-ink"
                    >
                      {link.label}
                      <ChevronRight
                        aria-hidden
                        className="size-3.5 opacity-60"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div>
            <h2 className="text-sm font-semibold text-ink">Follow Us</h2>
            <ul className="mt-2 -ml-3 flex items-center gap-1">
              {socials.map(({ name, href, icon: Icon }) => (
                <li key={name} aria-hidden={href ? undefined : true}>
                  {href ? (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${site.name} on ${name}`}
                      className="inline-flex size-10 items-center justify-center rounded-md text-ink hover:bg-white/60"
                    >
                      <Icon />
                    </a>
                  ) : (
                    <span className="inline-flex size-10 items-center justify-center text-ink">
                      <Icon />
                    </span>
                  )}
                </li>
              ))}
            </ul>
            <p className="mt-1 max-w-44 text-xs leading-relaxed">
              Get the latest EV news, tips and updates.
            </p>
          </div>
        </Container>
      </div>

      <div className="bg-footer-bar text-white/85">
        <Container className="flex flex-col gap-3 py-5 text-xs sm:flex-row sm:items-center sm:justify-between">
          {/* The year is fixed at build time; pages are rebuilt well within a year. */}
          <p>
            © {new Date().getFullYear()} {site.name}. All rights reserved.
          </p>
          <ul className="flex flex-wrap items-center gap-x-6 gap-y-2 sm:divide-x sm:divide-white/20 sm:gap-x-0">
            {legalLinks.map((link) => (
              <li
                key={link.href}
                className="sm:px-6 sm:first:pl-0 sm:last:pr-0"
              >
                <Link href={link.href} className="hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </div>
    </footer>
  );
}