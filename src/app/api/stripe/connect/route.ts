import { NextResponse } from "next/server";
import { createOnboardingLink, getOrCreateSeller, syncSeller } from "@/lib/sellers";
import { normalizeEmail } from "@/lib/constants";
import { isValidEmail } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST { email } -> { url }
 * Already-active sellers are sent to /sell/return (status card);
 * everyone else gets a fresh Stripe onboarding link.
 */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const email = normalizeEmail((body as { email?: string })?.email);
  if (!email || email.length > 255 || !isValidEmail(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  try {
    let seller = await getOrCreateSeller(email);
    seller = await syncSeller(seller);

    if (seller.charges_enabled && seller.details_submitted) {
      return NextResponse.json({ url: `/sell/return?email=${encodeURIComponent(email)}`, active: true });
    }

    const url = await createOnboardingLink(seller);
    return NextResponse.json({ url, active: false });
  } catch (err) {
    console.error("[stripe/connect]", err);
    const message = err instanceof Error ? err.message : "Could not start Stripe onboarding.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
