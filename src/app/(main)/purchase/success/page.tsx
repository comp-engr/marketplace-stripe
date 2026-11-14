import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CircleCheck, CircleHelp } from "lucide-react";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getSellerByEmail } from "@/lib/sellers";
import { recordPaidOrder } from "@/lib/orders";
import { APP_TAG } from "@/lib/constants";
import { isUuid } from "@/lib/validation";
import type Stripe from "stripe";
import type { Listing } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Payment" };

type Props = { searchParams: Promise<{ session_id?: string; listing?: string }> };

const usd = (cents: number, currency = "usd") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: currency.toUpperCase() }).format(cents / 100);

type Confirmed = {
  listing: Pick<Listing, "id" | "title" | "image_url">;
  session: Stripe.Checkout.Session;
};

async function confirm(sessionId: string, listingId: string): Promise<Confirmed | null> {
  if (!sessionId.startsWith("cs_") || !isUuid(listingId)) return null;

  const { data: listing } = await supabaseAdmin
    .from("listings")
    .select("id, title, image_url, seller_email")
    .eq("id", listingId)
    .maybeSingle();
  if (!listing) return null;

  // Account comes from the listing's seller, never from the URL
  const seller = await getSellerByEmail(listing.seller_email);
  if (!seller) return null;

  let session: Stripe.Checkout.Session;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId, {}, { stripeAccount: seller.stripe_account_id });
  } catch {
    return null;
  }

  if (session.metadata?.app !== APP_TAG || session.metadata?.listing_id !== listing.id) return null;
  if (session.payment_status !== "paid") return null;

  // Fallback in case the webhook is slow; the webhook stays the main path
  try {
    await recordPaidOrder(session, seller.stripe_account_id);
  } catch (err) {
    console.error("[purchase/success] recordPaidOrder failed", err);
  }

  return { listing, session };
}

export default async function PurchaseSuccessPage({ searchParams }: Props) {
  const { session_id = "", listing = "" } = await searchParams;
  const result = await confirm(session_id, listing);

  if (!result) {
    return (
      <main className="mx-auto max-w-md px-4 py-12">
        <div className="flex flex-col items-center rounded-xl bg-white px-6 py-10 text-center shadow-sm">
          <span className="mb-4 flex size-16 items-center justify-center rounded-full bg-amber-100 text-amber-700">
            <CircleHelp className="size-8" />
          </span>
          <h1 className="text-xl font-bold">We couldn&apos;t confirm this payment</h1>
          <p className="mt-2 text-[15px] text-muted-foreground">
            If you completed checkout, it may take a moment to show up. You haven&apos;t been charged twice.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex h-10 items-center rounded-md bg-fb-blue px-5 font-semibold text-white hover:bg-fb-blue-hover"
          >
            Back to Marketplace
          </Link>
        </div>
      </main>
    );
  }

  const { listing: item, session } = result;

  return (
    <main className="mx-auto max-w-md px-4 py-8 sm:py-12">
      <div className="overflow-hidden rounded-xl bg-white shadow-sm">
        <div className="flex flex-col items-center px-6 pt-8 text-center">
          <span className="mb-3 flex size-16 items-center justify-center rounded-full bg-green-100 text-green-700">
            <CircleCheck className="size-9" />
          </span>
          <h1 className="text-2xl font-bold">Payment successful!</h1>
          <p className="mt-1 text-[15px] text-muted-foreground">Thanks for your purchase. Message the seller to arrange pickup.</p>
        </div>

        <div className="mx-6 mt-6 flex gap-3 rounded-lg bg-fb-bg p-3">
          <div className="relative size-20 shrink-0 overflow-hidden rounded-md bg-[#e4e6eb]">
            {item.image_url && <Image src={item.image_url} alt={item.title} fill sizes="80px" className="object-cover" />}
          </div>
          <div className="min-w-0">
            <p className="line-clamp-2 font-semibold">{item.title}</p>
            <p className="mt-1 text-lg font-bold">{usd(session.amount_total ?? 0, session.currency ?? "usd")}</p>
          </div>
        </div>

        <dl className="mx-6 mt-4 space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Receipt sent to</dt>
            <dd className="truncate font-medium">{session.customer_details?.email ?? "-"}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Order reference</dt>
            <dd className="font-mono font-medium">{session.id.slice(-8).toUpperCase()}</dd>
          </div>
        </dl>

        <div className="mt-6 flex flex-col gap-2 border-t p-4 sm:flex-row">
          <Link
            href="/"
            className="inline-flex h-10 flex-1 items-center justify-center rounded-md bg-fb-blue font-semibold text-white hover:bg-fb-blue-hover"
          >
            Back to Marketplace
          </Link>
          <Link
            href={`/item/${item.id}`}
            className="inline-flex h-10 flex-1 items-center justify-center rounded-md bg-secondary font-semibold hover:bg-[#d8dadf]"
          >
            View item
          </Link>
        </div>
      </div>
    </main>
  );
}
