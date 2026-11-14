/** Percentage of each sale the marketplace keeps as an application fee. */
export const PLATFORM_FEE_PERCENT = 10;

/**
 * Tag added to every Checkout Session and PaymentIntent we create.
 * The Stripe sandbox is shared, so the webhook ignores anything without it.
 */
export const APP_TAG = "capm-marketplace-marco";

/** Stripe's minimum charge in USD. */
export const MIN_CHARGE_CENTS = 50;

/** Convert a USD price to cents. */
export function toCents(price: number | string): number {
  return Math.round(Number(price) * 100);
}

/** Platform fee in cents for an amount in cents. */
export function feeFor(amountCents: number): number {
  return Math.round((amountCents * PLATFORM_FEE_PERCENT) / 100);
}

/** Sellers are identified by email: always compare trimmed and lowercase. */
export function normalizeEmail(email: string | null | undefined): string {
  return (email ?? "").trim().toLowerCase();
}
