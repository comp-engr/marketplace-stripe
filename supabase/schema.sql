create table public.listings (
  id uuid primary key default gen_random_uuid(),
  title varchar(100) not null check (char_length(trim(title)) > 0),
  description text check (char_length(description) <= 2000),
  price numeric(10,2) not null check (price >= 0),
  category varchar(100) not null check (category in (
    'Vehicles','Property Rentals','Apparel','Classifieds','Electronics','Entertainment',
    'Family','Free Stuff','Garden & Outdoor','Hobbies','Home Goods','Home Improvement',
    'Home Sales','Musical Instruments','Office Supplies','Pet Supplies','Sporting Goods','Toys & Games'
  )),
  seller_name varchar(100),
  seller_email varchar(255) not null check (seller_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  image_url text,
  location varchar(255) not null default 'Palo Alto, CA',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  buyer_name varchar(100),
  buyer_email varchar(255) not null check (buyer_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  seller_email varchar(255) not null,
  message text not null check (char_length(trim(message)) between 1 and 1000),
  created_at timestamptz not null default now()
);

create index idx_listings_category on public.listings (category);
create index idx_listings_created_at on public.listings (created_at desc);
create index idx_messages_listing_id on public.messages (listing_id);

-- Copy the seller email from the listing so the browser cannot fake it
create or replace function public.set_message_seller_email()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  select seller_email into new.seller_email from public.listings where id = new.listing_id;
  return new;
end;
$$;

create trigger messages_set_seller_email
before insert on public.messages
for each row execute function public.set_message_seller_email();

-- Keep updated_at current
create or replace function public.update_updated_at_column()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger update_listings_updated_at
before update on public.listings
for each row execute function public.update_updated_at_column();

-- Row Level Security
alter table public.listings enable row level security;
alter table public.messages enable row level security;

create policy "Anyone can view listings"
  on public.listings for select to anon, authenticated using (true);

create policy "Anyone can create listings"
  on public.listings for insert to anon, authenticated with check (true);

-- Messages: insert only. No select policy, so buyer emails stay private.
create policy "Anyone can send messages"
  on public.messages for insert to anon, authenticated with check (true);

-- Storage bucket for listing photos (5 MB, images only)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('listing-images', 'listing-images', true, 5242880,
        array['image/jpeg','image/png','image/webp','image/gif'])
on conflict (id) do nothing;

create policy "Anyone can upload listing images"
  on storage.objects for insert to anon, authenticated
  with check (bucket_id = 'listing-images');

create policy "Anyone can view listing images"
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'listing-images');
