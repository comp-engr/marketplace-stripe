import type { CategoryName } from "@/lib/categories";

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
  created_at: string;
  updated_at: string;
};

/** Columns the browser sends when creating a listing */
export type NewListing = Pick<
  Listing,
  "title" | "description" | "price" | "category" | "seller_name" | "seller_email" | "image_url" | "location"
>;

/** Columns needed to render a listing card */
export type ListingSummary = Pick<Listing, "id" | "title" | "price" | "location" | "image_url" | "created_at">;

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
