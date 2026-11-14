import type { CategoryName } from "@/lib/categories";

export type ListingStatus = "available" | "sold";

/** Row in public.listings */
export type Listing = {
  id: string;
  title: string;
  description: string | null;
  price: number;
  category: CategoryName;
  seller_name: string | null;
  seller_email: string;
  image_url: string | null;
  location: string;
  status: ListingStatus;
  sold_at: string | null;
  created_at: string;
  updated_at: string;
};

/** Columns the browser sends when creating a listing */
export type NewListing = Pick<
  Listing,
  "title" | "description" | "price" | "category" | "seller_name" | "seller_email" | "image_url" | "location"
>;

/** Columns needed to render a listing card */
export type ListingSummary = Pick<Listing, "id" | "title" | "price" | "location" | "image_url" | "created_at" | "status">;

/** Row in public.messages (insert-only from the browser; never readable) */
export type Message = {
  id: string;
  listing_id: string;
  buyer_name: string | null;
  buyer_email: string;
  /** Always set by the database trigger from the listing, never by the client */
  seller_email: string;
  message: string;
  created_at: string;
};

/** Columns the browser sends when messaging a seller */
export type NewMessage = Pick<Message, "listing_id" | "buyer_name" | "buyer_email" | "message">;

/** Row in public.sellers (server-only; RLS blocks the browser) */
export type Seller = {
  email: string;
  stripe_account_id: string;
  charges_enabled: boolean;
  payouts_enabled: boolean;
  details_submitted: boolean;
  created_at: string;
  updated_at: string;
};

/** Row in public.orders (server-only; RLS blocks the browser) */
export type Order = {
  id: string;
  listing_id: string | null;
  listing_title: string | null;
  stripe_checkout_session_id: string;
  stripe_payment_intent_id: string | null;
  stripe_account_id: string;
  seller_email: string;
  buyer_email: string | null;
  amount_total: number;
  application_fee_amount: number;
  currency: string;
  status: "paid" | "refunded";
  created_at: string;
};
