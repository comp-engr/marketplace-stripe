import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { APP_TAG } from "@/lib/constants";
import { getSellerByAccountId, saveAccountStatus } from "@/lib/sellers";
import { recordPaidOrder } from "@/lib/orders";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ok = () => NextResponse.json({ received: true });

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[webhook] STRIPE_WEBHOOK_SECRET is not set");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  // Raw body is required for signature verification
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  let event: Stripe.Event;
  try {
    if (!signature) throw new Error("missing stripe-signature header");
    event = stripe.webhooks.constructEvent(body, signature, secret);
  } catch (err) {
    console.warn("[webhook] invalid signature:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const account = event.account;

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const seller = account ? await getSellerByAccountId(account) : null;
        if (session.metadata?.app !== APP_TAG || !seller || !account) {
          console.log(`[webhook] ignored ${event.type} ${event.id} (not ours, account=${account ?? "platform"})`);
          return ok();
        }
        if (session.payment_status !== "paid") {
          console.log(`[webhook] ${event.id} session ${session.id} not paid yet (${session.payment_status})`);
          return ok();
        }
        const result = await recordPaidOrder(session, account);
        console.log(
          `[webhook] ${event.id} checkout.session.completed ${session.id}:`,
          result.ok ? `order saved, listing ${result.listing.id} sold` : `skipped (${result.reason})`
        );
        return ok();
      }

      case "account.updated": {
        const acct = event.data.object as Stripe.Account;
        const seller = account ? await getSellerByAccountId(account) : null;
        if (!seller) {
          console.log(`[webhook] ignored ${event.type} ${event.id} (not ours, account=${account ?? "platform"})`);
          return ok();
        }
        await saveAccountStatus(acct);
        console.log(
          `[webhook] ${event.id} account.updated ${acct.id}: charges=${acct.charges_enabled} payouts=${acct.payouts_enabled} details=${acct.details_submitted}`
        );
        return ok();
      }

      default:
        console.log(`[webhook] ignored ${event.type} ${event.id} (unhandled type)`);
        return ok();
    }
  } catch (err) {
    // Non-2xx makes Stripe retry later
    console.error(`[webhook] error handling ${event.type} ${event.id}:`, err);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }
}
