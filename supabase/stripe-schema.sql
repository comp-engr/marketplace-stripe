alter table public.listings
  add column if not exists status text not null default 'available'
    check (status in ('available', 'sold')),
  add column if not exists sold_at timestamptz;

create table if not exists public.sellers (
  email varchar(255) primary key check (email = lower(trim(email))),
  stripe_account_id text not null unique,
  charges_enabled boolean not null default false,
  payouts_enabled boolean not null default false,
  details_submitted boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references public.listings(id) on delete set null,
  listing_title text,
  stripe_checkout_session_id text not null unique,
  stripe_payment_intent_id text,
  stripe_account_id text not null,
  seller_email varchar(255) not null,
  buyer_email varchar(255),
  amount_total integer not null,
  application_fee_amount integer not null,
  currency text not null default 'usd',
  status text not null default 'paid' check (status in ('paid', 'refunded')),
  created_at timestamptz not null default now()
);

create index if not exists idx_orders_listing_id on public.orders (listing_id);
create index if not exists idx_listings_status on public.listings (status);

-- Only the server (service role) can read or write these tables
alter table public.sellers enable row level security;
alter table public.orders enable row level security;
