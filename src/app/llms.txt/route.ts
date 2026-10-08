import { routes, site } from "@/lib/site";

export const dynamic = "force-static";

/**
 * /llms.txt: a plain-language map of the site for AI assistants and answer
 * engines (see llmstxt.org). Keep the facts here in step with the pages.
 */
export function GET() {
  const url = (path: string) => `${site.url}${path}`;
  const body = `# ${site.name}

> ${site.name} is an independent UK marketplace that connects homeowners and businesses with vetted, local electricians and EV charger installers. Homeowners enter a postcode, answer six short questions and receive up to 5 free, no-obligation quotes.

Key facts:
- Free for homeowners. No obligation to hire.
- Up to 5 quotes per request, from installers whose service area covers the postcode.
- Installers are checked before listing: business details, qualifications and accreditations (such as NICEIC, NAPIT, MCS and OZEV where applicable), services and coverage area.
- ${site.name} is not an electrical contractor. It does not carry out electrical work or choose an installer on a customer's behalf.
- Contact: ${site.email} (${site.hours.days}, ${site.hours.time}).

## For homeowners
- [Get free EV charger quotes](${url(routes.quotes)}): Start a quote request with a UK postcode.
- [How it works](${url(routes.howItWorks)}): The three steps for homeowners and for electricians.
- [EV charger installers by location](${url(routes.installers)}): Browse installers in towns and cities across the UK.
- [FAQ](${url(routes.faq)}): Answers to common questions from homeowners and electricians.

## Guides
- [Understanding electrician accreditations](${url(routes.accreditations)}): What NICEIC, NAPIT, TrustMark and MCS registration mean.
- [UK electrical safety and regulations](${url(routes.safety)}): Part P, BS 7671, Competent Person Schemes and EICRs explained.
- [How we vet installers](${url(routes.vetting)}): The five checks every listed electrician goes through.
- [EV charging blog](${url(routes.blog)}): Articles on the cost, choice, installation and regulation of home EV chargers.

## For electricians
- [Join as an installer](${url(routes.join)}): Membership options and how leads work.

## Company
- [About ${site.name}](${url(routes.about)})
- [Contact](${url(routes.contact)})
- [Privacy Policy](${url(routes.privacy)})
- [Terms & Conditions](${url(routes.terms)})
`;
  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
