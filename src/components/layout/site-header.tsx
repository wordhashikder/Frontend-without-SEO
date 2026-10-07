import Image from "next/image";
import { HomeLink } from "@/components/layout/home-link";
import { SiteMenu } from "@/components/layout/site-menu";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/layout";
import { routes, site } from "@/lib/site";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85">
      <Container
        size="narrow"
        className="flex h-[72px] items-center justify-between max-[359px]:px-4"
      >
        <HomeLink aria-label={`${site.name} home`} className="shrink-0">
          <Image
            src="/logo.svg"
            alt={site.name}
            width={157}
            height={32}
            priority
            unoptimized
            className="h-6 w-auto min-[360px]:h-7 sm:h-8"
          />
        </HomeLink>
        <div className="flex items-center gap-1 min-[360px]:gap-2 sm:gap-4">
          <SiteMenu />
          <ButtonLink
            href={routes.quotes}
            size="md"
            className="h-10 px-3 text-xs min-[360px]:px-4 min-[360px]:text-[13px] sm:px-5 sm:text-sm"
          >
            Get Free Quotes
          </ButtonLink>
        </div>
      </Container>
    </header>
  );
}
