import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getSellerByEmail } from "@/lib/sellers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET ?email= -> redirect to the seller's Stripe Express dashboard. */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const email = url.searchParams.get("email") ?? "";

  try {
    const seller = await getSellerByEmail(email);
    if (!seller || !seller.details_submitted) {
      return NextResponse.redirect(new URL(`/sell?email=${encodeURIComponent(email)}`, url), 303);
    }
    const link = await stripe.accounts.createLoginLink(seller.stripe_account_id);
    return NextResponse.redirect(link.url, 303);
  } catch (err) {
    console.error("[stripe/dashboard]", err);
    return NextResponse.redirect(new URL(`/sell/return?email=${encodeURIComponent(email)}&error=dashboard`, url), 303);
  }
}
