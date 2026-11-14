# Marketplace + Stripe Connect

A mini **Facebook Marketplace** where buyers can purchase items with **Buy Now** and sellers get paid through **Stripe Connect**. The marketplace keeps a **10% platform fee**. Everything runs in Stripe's **sandbox (test mode)**, so no real money moves.

**Author:** Engr. Marco

**Live demo:** https://marketplace-stripe-eight.vercel.app
**Repository:** https://github.com/comp-engr/marketplace-stripe

---

## What it does

| Flow | How it works |
|---|---|
| **Browse & sell** (from Test 3) | Category browsing, search, create a listing with a photo, message the seller. |
| **Seller onboarding** | `/sell` → enter the email used on your listings → **Connect with Stripe** → finish Stripe's hosted onboarding → the connected account ID is saved in Supabase. |
| **Buy Now** | Listings from onboarded sellers show **Buy Now · $X**. It opens Stripe Checkout with the item's photo and USD price. Listings from sellers who haven't onboarded are not purchasable. |
| **Pay the seller** | A **direct charge** on the seller's connected account with `application_fee_amount` = 10%. The seller receives the price minus the fee. |
| **Order confirmation** | A success page shows after payment. A signed **webhook** (`checkout.session.completed`) saves the order in Supabase and marks the listing **Sold**. |

There is no login: a seller is identified by the email on their listings (always compared trimmed and lowercase).

---

## Stack

- **Next.js 15** (App Router), **React 19**, TypeScript
- **Tailwind CSS v4**, shadcn/ui, lucide-react
- **Supabase**: Postgres with Row Level Security, and Storage for photos
- **Stripe**: Connect (Express Dashboard accounts), Checkout, webhooks, using the official `stripe` Node SDK
- **Vercel** hosting

---

## How payments are built

```
Buyer ── Buy Now ──▶ POST /api/stripe/checkout
                     │ loads listing + seller on the SERVER (never trusts the browser)
                     │ amount = Math.round(price * 100), fee = 10%
                     ▼
          stripe.checkout.sessions.create(..., { stripeAccount: seller })   ← direct charge
                     ▼
          Stripe Checkout (on the seller's account) ── pays ──▶ /purchase/success
                     │                                            │ retrieves session with { stripeAccount }
                     ▼                                            │ fallback: same idempotent save
   Stripe ── checkout.session.completed (Connect event) ──▶ POST /api/stripe/webhook
                                                             │ verify signature (raw body)
                                                             │ ignore events that aren't ours (shared sandbox)
                                                             │ upsert order on session ID → mark listing sold
```

- **Seller accounts.** The shared sandbox requires Stripe to be the losses collector. The legacy `accounts.create({ type: "express" })` can't do that, so sellers are created with **Accounts v2** (`dashboard: "express"`, Stripe-managed risk). The result is a normal `acct_…` ID used with the v1 APIs: account links, `accounts.retrieve`, `createLoginLink`, and Checkout.
- **Shared-sandbox safety.** Every Checkout Session and PaymentIntent carries `metadata.app = "capm-marketplace-marco"`. The webhook only handles events with that tag that come from a connected account stored in our `sellers` table. Everything else is logged and answered with `200`.
- **Idempotency.** Orders are upserted on `stripe_checkout_session_id`. A listing is only marked sold while it's still `available`, so a repeated event can't create duplicates or overwrite `sold_at`.
- **Server-only secrets.** `src/lib/stripe.ts` and `src/lib/supabase-admin.ts` import `server-only`, so they can never be bundled for the browser. The `sellers` and `orders` tables have RLS turned on with no policies, so only the server (service role) can read or write them.

---

## Environment variables

Copy `.env.example` to `.env.local` and fill in the values. Never commit `.env.local`.

| Name | Where it's used | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | browser + server | Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | browser + server | anon / publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | **server only** | bypasses RLS: for `sellers` / `orders` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | browser | `pk_test_…` |
| `STRIPE_SECRET_KEY` | **server only** | `sk_test_…` |
| `STRIPE_WEBHOOK_SECRET` | **server only** | `whsec_…` from the webhook script |
| `NEXT_PUBLIC_SITE_URL` | server | base URL for Stripe redirects, e.g. `http://localhost:3000` or `https://<project>.vercel.app` |

On Vercel, add the same variables under **Settings → Environment Variables** and redeploy.

---

## Run locally

```bash
git clone https://github.com/comp-engr/marketplace-stripe.git
cd marketplace-stripe
npm install
cp .env.example .env.local        # fill in the values
npm run dev                       # http://localhost:3000
```

**Database.** In the Supabase SQL Editor, run `supabase/schema.sql` (listings, messages, storage) and then `supabase/stripe-schema.sql` (status/sold_at columns, plus the `sellers` and `orders` tables).

**Webhooks locally** (optional) with the Stripe CLI:

```bash
stripe listen --api-key $STRIPE_SECRET_KEY --forward-connect-to localhost:3000/api/stripe/webhook
```

Put the temporary `whsec_…` it prints into `STRIPE_WEBHOOK_SECRET` while it runs.

---

## Register the webhook (production)

1. Deploy to Vercel and note your **production** URL. Preview URLs are login-protected, so Stripe can't reach them.
2. Set `WEBHOOK_URL` in `scripts/create-webhook.mjs` to `https://<your-app>.vercel.app/api/stripe/webhook`.
3. Run it once:
   ```bash
   node --env-file=.env.local scripts/create-webhook.mjs
   ```
   The script lists existing endpoints first and **skips creating** one if your URL is already registered. It never deletes or edits other endpoints, because the sandbox is shared. It registers `connect: true` for `checkout.session.completed` and `account.updated`.
4. Copy the printed `whsec_…` into `STRIPE_WEBHOOK_SECRET` in `.env.local` **and** in Vercel, then redeploy.

---

## Test it

1. Create a listing with a photo and a seller email you choose.
2. Go to **/sell**, enter the same email → **Connect with Stripe** → complete onboarding with Stripe's [test data](https://docs.stripe.com/connect/testing). Use the test phone number, SMS code `000000`, SSN `000000000`, address line `address_full_match`, routing `110000000`, account `000123456789`.
3. Open the listing → **Buy Now** → pay with `4242 4242 4242 4242`, any future date, any CVC, any ZIP.
4. The success page appears. The `orders` table has the row with a 10% `application_fee_amount`, and the listing shows **Sold**.
5. **/sell** → **View Stripe dashboard** shows the payment minus the platform fee.

---

## Project structure (new for Stripe)

```
src/app/(main)/sell/               onboarding page, /sell/refresh (route), /sell/return (status)
src/app/(main)/purchase/success/   payment confirmation
src/app/api/stripe/connect/        create account + onboarding link
src/app/api/stripe/checkout/       create Checkout Session (direct charge + fee)
src/app/api/stripe/webhook/        verify + record orders, sync account status
src/app/api/stripe/dashboard/      Express Dashboard login link
src/components/stripe/             ConnectForm, SellerStatusCard, BuyNowButton, TestDataHelp
src/lib/stripe.ts                  Stripe client (server-only)
src/lib/supabase-admin.ts          service-role Supabase client (server-only)
src/lib/sellers.ts, orders.ts      seller + order logic shared by routes
src/lib/constants.ts               PLATFORM_FEE_PERCENT = 10, APP_TAG
scripts/create-webhook.mjs         one-time webhook registration
supabase/stripe-schema.sql         Stripe tables and columns
```

---

## Known limitations

- **No authentication**, by design for this test. Anyone who knows a seller's email can open the `/sell` status for it, including the Express Dashboard link. In a real app, seller actions would need a verified login (for example Supabase Auth with a magic link).
- Uses Stripe **test mode** only.

---

© 2026 Engr. Marco. Built as a learning project. Not affiliated with Meta, Facebook or Stripe.
