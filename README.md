# Marketplace

A mini **Facebook Marketplace** clone where people can browse local listings, search, post an item with a photo, and message the seller.

**Author:** Engr. Marco

**Live demo:** https://marketplace-one-lemon.vercel.app
**Repository:** https://github.com/comp-engr/marketplace

---

## Features

### Browse
- **Today's picks** home page with a responsive grid: 2 columns on mobile, 3 on tablet, 4–5 on desktop.
- Newest listings first. Skeleton cards while loading, and an empty state with a "Create the first listing" button.
- **Category sidebar** with 18 categories and icons. On mobile it becomes a row of horizontally scrolling chips.
- The active category is highlighted. An unknown category returns a real **404**.

### Search
- The header search box filters by title **and** description (case-insensitive `ilike`).
- Searching inside a category stays inside that category (`/category/electronics?q=phone`).
- Special characters are sanitized before they reach the database query.

### Create a listing
- **Choose listing type** page. "Item for sale" works; the other three types show a *Coming soon* badge.
- A three-column create page: **form → photo preview → live details preview**.
- Photo dropzone (click or drag and drop) for JPG, PNG, WEBP or GIF up to 5 MB, with a thumbnail and a remove button.
- Inline validation for the required photo, title (max 100), price (0 or more, up to 2 decimals), category, a valid email, and description (max 2000, with a counter).
- **Publish** stays disabled until the form is valid and shows a spinner while saving. Afterwards it redirects to the new listing with a success toast. On errors the form keeps its values.

### Listing detail
- Large photo on a dark background. The side panel shows title, price, "Listed *x minutes ago* in *location*", category badge, description and seller info.
- **Send seller a message** box. "Is this available?" is pre-filled.
- An invalid or missing listing shows a friendly 404 page.

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router, `src/` directory), React 19, TypeScript |
| Styling | Tailwind CSS v4, shadcn/ui (Radix), lucide-react icons |
| Backend | Supabase: Postgres, Row Level Security, Storage |
| Hosting | Vercel |

Design follows Facebook Marketplace: `#f0f2f5` page background, white cards, `#1877F2` primary blue, and the system "Segoe UI / Helvetica" font stack.

---

## Security model

There are no user accounts. The browser only ever uses the public **anon/publishable** key, so all rules are enforced in the database:

- **Listings:** anyone can read and create them. Check constraints validate price ≥ 0, the email format, category values and text lengths.
- **Messages are insert-only.** There is no `SELECT` policy, so buyer emails can never be read back from the browser.
- **The seller email on a message can't be faked.** A `BEFORE INSERT` trigger copies it from the listing, ignoring anything the client sends.
- **Storage:** the `listing-images` bucket is public-read and accepts images only, up to 5 MB.
- The `service_role` / secret key is never used anywhere in the app.

> **Known limitation:** anyone can post a listing under any seller email, because there is no sign-in. Adding Supabase Auth would let the seller email come from the logged-in account.

---

## Project structure

```
src/
├─ app/
│  ├─ (main)/                    pages with the header
│  │  ├─ (browse)/               share the category sidebar
│  │  │  ├─ page.tsx             /  (Today's picks + search)
│  │  │  └─ category/[slug]/     /category/[slug]
│  │  └─ item/[id]/              listing detail + message seller
│  ├─ create/                    choose listing type
│  │  └─ item/                   create item form
│  └─ layout.tsx, not-found.tsx
├─ components/
│  ├─ layout/                    Header, SearchBox, CategorySidebar, Logo
│  ├─ marketplace/               ListingCard, ListingGrid, ListingResults,
│  │                             ListingForm, ListingPreview, MessageSellerForm
│  └─ ui/                        shadcn/ui components
├─ lib/
│  ├─ supabase.ts                single Supabase client (throws if env missing)
│  ├─ categories.ts              18 categories: name, slug, icon
│  ├─ listings.ts                data access + search sanitizing
│  ├─ format.ts                  price ("$2,300" / "Free") and relative time
│  └─ validation.ts              shared limits, email/UUID checks
└─ types/index.ts                Listing and Message types
supabase/schema.sql              tables, constraints, triggers, RLS, storage
```

---

## Getting started

### 1. Supabase
1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor**, paste the contents of `supabase/schema.sql`, and click **Run**.
3. Copy the **Project URL** and the **anon / publishable key** from *Project Settings → API Keys*.

### 2. Run locally
```bash
git clone https://github.com/comp-engr/marketplace.git
cd marketplace
npm install
cp .env.example .env.local      # then fill in both values
npm run dev                     # http://localhost:3000
```

`.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon or publishable key>
```

### 3. Deploy to Vercel
1. Import the repository at [vercel.com/new](https://vercel.com/new).
2. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` under **Environment Variables**.
3. Click **Deploy**, and check that **Deployment Protection** is off for the production domain.

Listing pages use `export const dynamic = "force-dynamic"`, so new listings appear immediately without a redeploy.

---

## Testing

Tested before deployment against a production build and again on the live site:

- Creating a listing with a photo redirects to its detail page, and the photo shows.
- New listings appear first on the home page and in the database. Photos are stored in `listing-images`.
- Each category shows only its own listings, and unknown slugs or invalid IDs return HTTP 404.
- Search matches words in the title or description, and works inside a category.
- Sending a message stores it with the correct seller email, even when the browser sends a fake one.
- An invalid email, a missing photo, a negative price or a non-image file is blocked, both in the form and by the database.
- At 375 px width there is no horizontal scrolling, the grid has 2 columns, and the category chips are visible.

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the dev server (Turbopack) |
| `npm run build` | Production build (type-check and lint) |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |

---

© 2026 Engr. Marco. Built as a learning project. Not affiliated with Meta or Facebook.
