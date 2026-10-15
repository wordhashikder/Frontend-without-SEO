const money = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  maximumFractionDigits: 0,
});
const moneyExact = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
});
const dateOnly = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeZone: "Europe/London",
});
const dateTime = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Europe/London",
});

/** £949, or £949.50 when there are pence. */
export function gbp(amount: string | number | null | undefined) {
  if (amount === null || amount === undefined) return "-";
  const value = Number(amount);
  return Number.isInteger(value)
    ? money.format(value)
    : moneyExact.format(value);
}

export const formatDate = (iso: string) => dateOnly.format(new Date(iso));
export const formatDateTime = (iso: string) => dateTime.format(new Date(iso));
