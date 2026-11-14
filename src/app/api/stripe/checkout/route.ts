import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getSiteUrl } from "@/lib/site-url";
import { getSellerByEmail, isPurchasable } from "@/lib/sellers";
import { APP_TAG, feeFor, normalizeEmail, toCents } from "@/lib/constants";
import { isUuid } from "@/lib/validation";
import type { Listing } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Only pass our own Storage images to Stripe, never arbitrary URLs. */
function safeImage(url: string | null): string[] {
  const base = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/listing-images/`;
  return url && url.startsWith(base) ? [url] : [];
}

/** POST { listingId } -> { url }. Price and account are looked up here, never taken from the browser. */
export async function POST(req: Request) {
  let listingId: string | undefined;
  try {
    listingId = (await req.json())?.listingId;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  if (!listingId || !isUuid(listingId)) {
    return NextResponse.json({ error: "Invalid listing." }, { status: 400 });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from("listings")
      .select("id, title, description, price, image_url, seller_email, status")
      .eq("id", listingId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    const listing = data as Pick<
      Listing,
      "id" | "title" | "description" | "price" | "image_url" | "seller_email" | "status"
    > | null;
    if (!listing) return NextResponse.json({ error: "Listing not found." }, { status: 400 });

    const seller = await getSellerByEmail(listing.seller_email);
    if (!seller || !isPurchasable(listing, seller)) {
      return NextResponse.json({ error: "This item can't be purchased online." }, { status: 400 });
    }

    const amount = toCents(listing.price);
    const fee = feeFor(amount);
    const site = getSiteUrl();
    const description = listing.description?.trim().slice(0, 200);

    const session = await stripe.checkout.sessions.create(
      {
        mode: "payment",
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: "usd",
              unit_amount: amount,
              product_data: {
                name: listing.title,
                ...(description ? { description } : {}),
                images: safeImage(listing.image_url),
              },
            },
          },
        ],
        payment_intent_data: {
          application_fee_amount: fee,
          metadata: { app: APP_TAG, listing_id: listing.id },
        },
        metadata: { app: APP_TAG, listing_id: listing.id, seller_email: normalizeEmail(listing.seller_email) },
        success_url: `${site}/purchase/success?session_id={CHECKOUT_SESSION_ID}&listing=${listing.id}`,
        cancel_url: `${site}/item/${listing.id}`,
      },
      { stripeAccount: seller.stripe_account_id }
    );

    if (!session.url) throw new Error("Stripe did not return a Checkout URL.");
    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[stripe/checkout]", err);
    const message = err instanceof Error ? err.message : "Could not start checkout.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
