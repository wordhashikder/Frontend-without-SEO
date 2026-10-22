/** £29 or £29.50: whole pounds without pence. Safe to import from client components. */
export const formatPrice = (pounds: number) =>
  Number.isInteger(pounds) ? `£${pounds}` : `£${pounds.toFixed(2)}`;
