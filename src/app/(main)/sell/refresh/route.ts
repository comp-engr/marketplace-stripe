import { NextResponse } from "next/server";
import { createOnboardingLink, getSellerByEmail } from "@/lib/sellers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Account links expire: Stripe sends the seller here to get a fresh one. */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const email = url.searchParams.get("email") ?? "";

  try {
    const seller = await getSellerByEmail(email);
    if (!seller) return NextResponse.redirect(new URL(`/sell?email=${encodeURIComponent(email)}`, url), 303);
    const link = await createOnboardingLink(seller);
    return NextResponse.redirect(link, 303);
  } catch (err) {
    console.error("[sell/refresh]", err);
    return NextResponse.redirect(new URL(`/sell?email=${encodeURIComponent(email)}`, url), 303);
  }
}
