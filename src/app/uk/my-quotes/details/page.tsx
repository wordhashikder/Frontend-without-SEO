import { eraseCustomerData, signOutCustomer } from "@/actions/customer";
import { DetailsForm } from "@/components/customer/details-form";
import { getCustomerSession } from "@/lib/customer-session";

export default async function DetailsPage() {
  const session = await getCustomerSession();
  if (!session) return null;
  const { customer } = session.overview;
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-[24px] font-extrabold tracking-[-0.01em] sm:text-[30px]">
          My details
        </h1>
        <p className="mt-1.5 text-sm">
          What installers see when you request a quote.
        </p>
      </header>
      <section className="max-w-[560px] rounded-2xl border border-line bg-white p-6 shadow-soft">
        <DetailsForm customer={customer} />
      </section>
      <section className="max-w-[560px] rounded-2xl border border-line bg-white p-6 shadow-soft">
        <h2 className="text-lg font-bold">Sign out</h2>
        <p className="mt-1.5 text-sm">
          You're signed in on this device. Sign out if it's shared. You can get
          a new link any time.
        </p>
        <form action={signOutCustomer} className="mt-4">
          <button
            type="submit"
            className="h-11 rounded-lg border border-line bg-white px-5 text-sm font-semibold text-ink hover:border-ink/30"
          >
            Sign out
          </button>
        </form>
      </section>
      <section className="max-w-[560px] rounded-2xl border border-line bg-white p-6 shadow-soft">
        <h2 className="text-lg font-bold">Delete my sign-in data</h2>
        <p className="mt-1.5 text-sm">
          Removes your customer profile and signs you out everywhere. Requests
          already shared with installers stay with them, as described in our
          privacy policy.
        </p>
        <form action={eraseCustomerData} className="mt-4">
          <button
            type="submit"
            className="h-11 rounded-lg border border-red-200 bg-white px-5 text-sm font-semibold text-red-700 hover:bg-red-50"
          >
            Delete my data
          </button>
        </form>
      </section>
    </div>
  );
}
