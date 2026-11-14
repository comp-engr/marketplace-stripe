import "server-only";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getSiteUrl } from "@/lib/site-url";
import { APP_TAG, MIN_CHARGE_CENTS, normalizeEmail, toCents } from "@/lib/constants";
import type { Listing, Seller } from "@/types";

/** Express Dashboard + Stripe-managed risk is a public preview in Accounts v2. */
const STRIPE_V2_PREVIEW_VERSION = "2026-10-28.preview";

export async function getSellerByEmail(email: string): Promise<Seller | null> {
  const normalized = normalizeEmail(email);
  if (!normalized) return null;
  const { data, error } = await supabaseAdmin.from("sellers").select("*").eq("email", normalized).maybeSingle();
  if (error) throw new Error(`Could not load seller: ${error.message}`);
  return data as Seller | null;
}

export async function getSellerByAccountId(accountId: string): Promise<Seller | null> {
  const { data, error } = await supabaseAdmin
    .from("sellers")
    .select("*")
    .eq("stripe_account_id", accountId)
    .maybeSingle();
  if (error) throw new Error(`Could not load seller: ${error.message}`);
  return data as Seller | null;
}

/** Create the Express account and sellers row if this email is new. */
export async function getOrCreateSeller(email: string): Promise<Seller> {
  const normalized = normalizeEmail(email);
  const existing = await getSellerByEmail(normalized);
  if (existing) return existing;

  // The shared sandbox requires Stripe to be the losses collector, which the
  // legacy v1 `type: "express"` cannot do. Accounts v2 gives the same result:
  // a US individual with the Express Dashboard, onboarded by Stripe. The
  // account is still an acct_... ID that works with every v1 API we use
  // (accountLinks, accounts.retrieve, createLoginLink, direct charges).
  const account = await stripe.v2.core.accounts.create(
    {
      contact_email: normalized,
      dashboard: "express",
      identity: { country: "us", entity_type: "individual" },
      defaults: { responsibilities: { fees_collector: "stripe", losses_collector: "stripe" } },
      configuration: { merchant: { capabilities: { card_payments: { requested: true } } } },
      metadata: { app: APP_TAG },
    },
    { apiVersion: STRIPE_V2_PREVIEW_VERSION }
  );

  const { data, error } = await supabaseAdmin
    .from("sellers")
    .insert({ email: normalized, stripe_account_id: account.id })
    .select("*")
    .single();

  if (error) {
    // Lost a race with a parallel request: use the row that won
    const winner = await getSellerByEmail(normalized);
    if (winner) return winner;
    throw new Error(`Could not save seller: ${error.message}`);
  }
  return data as Seller;
}

/** Copy the account's capability flags from Stripe into the sellers row. */
export async function saveAccountStatus(account: Stripe.Account): Promise<Seller | null> {
  const { data, error } = await supabaseAdmin
    .from("sellers")
    .update({
      charges_enabled: Boolean(account.charges_enabled),
      payouts_enabled: Boolean(account.payouts_enabled),
      details_submitted: Boolean(account.details_submitted),
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_account_id", account.id)
    .select("*")
    .maybeSingle();
  if (error) throw new Error(`Could not update seller: ${error.message}`);
  return data as Seller | null;
}

/** Fetch the latest account status from Stripe and save it. */
export async function syncSeller(seller: Seller): Promise<Seller> {
  const account = await stripe.accounts.retrieve(seller.stripe_account_id);
  return (await saveAccountStatus(account)) ?? seller;
}

export async function createOnboardingLink(seller: Seller): Promise<string> {
  const site = getSiteUrl();
  const q = `email=${encodeURIComponent(seller.email)}`;
  const link = await stripe.accountLinks.create({
    account: seller.stripe_account_id,
    type: "account_onboarding",
    refresh_url: `${site}/sell/refresh?${q}`,
    return_url: `${site}/sell/return?${q}`,
  });
  return link.url;
}

export function isSellerActive(seller: Seller | null): boolean {
  return Boolean(seller?.charges_enabled);
}

export function isPurchasable(listing: Pick<Listing, "status" | "price">, seller: Seller | null): boolean {
  return isSellerActive(seller) && listing.status === "available" && toCents(listing.price) >= MIN_CHARGE_CENTS;
}

/** Count a seller's available listings (email match is case-insensitive). */
export async function countAvailableListings(email: string): Promise<number> {
  const escaped = normalizeEmail(email).replace(/[\\%_]/g, (c) => `\\${c}`);
  const { count, error } = await supabaseAdmin
    .from("listings")
    .select("id", { count: "exact", head: true })
    .ilike("seller_email", escaped)
    .eq("status", "available");
  if (error) throw new Error(`Could not count listings: ${error.message}`);
  return count ?? 0;
}
