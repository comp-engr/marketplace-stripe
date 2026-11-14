import "server-only";
import type Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { APP_TAG, feeFor, normalizeEmail, toCents } from "@/lib/constants";
import { getSellerByAccountId } from "@/lib/sellers";
import type { Listing } from "@/types";

export type RecordResult =
  | { ok: true; listing: Pick<Listing, "id" | "title"> }
  | { ok: false; reason: string };

/**
 * Save a paid Checkout Session as an order and mark the listing sold.
 * Idempotent: called by the webhook (main path) and by the success page
 * (fallback), possibly several times for the same session.
 */
export async function recordPaidOrder(session: Stripe.Checkout.Session, accountId: string): Promise<RecordResult> {
  if (session.metadata?.app !== APP_TAG) return { ok: false, reason: "not our session" };
  if (session.payment_status !== "paid") return { ok: false, reason: `payment_status=${session.payment_status}` };

  const listingId = session.metadata?.listing_id;
  if (!listingId) return { ok: false, reason: "missing listing_id" };

  const seller = await getSellerByAccountId(accountId);
  if (!seller) return { ok: false, reason: "unknown connected account" };

  const { data: listing, error: listingError } = await supabaseAdmin
    .from("listings")
    .select("id, title, price, seller_email")
    .eq("id", listingId)
    .maybeSingle();
  if (listingError) throw new Error(`Could not load listing: ${listingError.message}`);
  if (!listing) return { ok: false, reason: "listing not found" };

  // The listing must belong to the account that was paid
  if (normalizeEmail(listing.seller_email) !== seller.email) {
    return { ok: false, reason: "listing does not belong to this seller" };
  }

  const amount = toCents(listing.price);
  const paymentIntentId =
    typeof session.payment_intent === "string" ? session.payment_intent : (session.payment_intent?.id ?? null);

  const { error: orderError } = await supabaseAdmin.from("orders").upsert(
    {
      listing_id: listing.id,
      listing_title: listing.title,
      stripe_checkout_session_id: session.id,
      stripe_payment_intent_id: paymentIntentId,
      stripe_account_id: accountId,
      seller_email: seller.email,
      buyer_email: session.customer_details?.email ?? null,
      amount_total: session.amount_total ?? amount,
      application_fee_amount: feeFor(amount),
      currency: session.currency ?? "usd",
      status: "paid",
    },
    { onConflict: "stripe_checkout_session_id" }
  );
  if (orderError) throw new Error(`Could not save order: ${orderError.message}`);

  // Only the first time: keep the original sold_at on repeat events
  const { error: soldError } = await supabaseAdmin
    .from("listings")
    .update({ status: "sold", sold_at: new Date().toISOString() })
    .eq("id", listing.id)
    .eq("status", "available");
  if (soldError) throw new Error(`Could not mark listing sold: ${soldError.message}`);

  return { ok: true, listing: { id: listing.id, title: listing.title } };
}
