import { cache } from "react";
import { supabase } from "@/lib/supabase";
import { isUuid } from "@/lib/validation";
import type { Listing, ListingSummary } from "@/types";

const SUMMARY_COLUMNS = "id, title, price, location, image_url, created_at";

/**
 * Strip characters that have meaning in PostgREST filter syntax
 * (commas/parentheses split `or` clauses; % _ * are wildcards).
 */
export function sanitizeSearch(q: string | undefined): string {
  return (q ?? "")
    .replace(/[%_*,()"'\\:]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 100);
}

export async function getListings(
  options: { category?: string; q?: string } = {}
): Promise<ListingSummary[]> {
  let query = supabase
    .from("listings")
    .select(SUMMARY_COLUMNS)
    .order("created_at", { ascending: false })
    .limit(200);

  if (options.category) query = query.eq("category", options.category);

  const term = sanitizeSearch(options.q);
  if (term) query = query.or(`title.ilike.%${term}%,description.ilike.%${term}%`);

  const { data, error } = await query;
  if (error) throw new Error(`Could not load listings: ${error.message}`);
  return (data ?? []) as ListingSummary[];
}

/** Cached per request so generateMetadata and the page share one query. */
export const getListing = cache(async (id: string): Promise<Listing | null> => {
  if (!isUuid(id)) return null;
  const { data, error } = await supabase.from("listings").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(`Could not load listing: ${error.message}`);
  return data as Listing | null;
});
