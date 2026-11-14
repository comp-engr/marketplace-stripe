import { Suspense } from "react";
import { ListingGrid, ListingGridSkeleton } from "@/components/marketplace/ListingGrid";
import { getListings } from "@/lib/listings";

type Props = { category?: string; q?: string };

async function Results({ category, q }: Props) {
  const listings = await getListings({ category, q });
  return <ListingGrid listings={listings} query={q || undefined} />;
}

/**
 * Streams the grid inside its own Suspense boundary so the page shell
 * (heading, 404 checks) renders first with the correct status code,
 * and skeleton cards show while Supabase responds.
 */
export function ListingResults(props: Props) {
  return (
    <Suspense key={`${props.category ?? ""}|${props.q ?? ""}`} fallback={<ListingGridSkeleton />}>
      <Results {...props} />
    </Suspense>
  );
}
