import Link from "next/link";
import { PackageOpen, Plus, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ListingCard } from "@/components/marketplace/ListingCard";
import type { ListingSummary } from "@/types";

const GRID = "grid grid-cols-2 gap-x-2 gap-y-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5";

export function ListingGrid({ listings, query }: { listings: ListingSummary[]; query?: string }) {
  if (listings.length === 0) return <EmptyState query={query} />;

  return (
    <div className={GRID}>
      {listings.map((listing, index) => (
        <ListingCard key={listing.id} listing={listing} priority={index < 4} />
      ))}
    </div>
  );
}

function EmptyState({ query }: { query?: string }) {
  const Icon = query ? SearchX : PackageOpen;
  return (
    <div className="flex flex-col items-center justify-center rounded-xl bg-white px-6 py-16 text-center shadow-sm">
      <span className="mb-4 flex size-16 items-center justify-center rounded-full bg-fb-active text-fb-blue">
        <Icon className="size-8" />
      </span>
      <h2 className="text-lg font-bold">{query ? "No listings found" : "No listings yet"}</h2>
      <p className="mt-1 max-w-sm text-[15px] text-muted-foreground">
        {query
          ? `Nothing matches "${query}". Try a different word, or list something yourself.`
          : "Be the first to sell something here."}
      </p>
      <Button asChild className="mt-5 h-10 rounded-md bg-fb-blue px-4 font-semibold hover:bg-fb-blue-hover">
        <Link href="/create/item">
          <Plus className="size-4" strokeWidth={2.5} />
          Create the first listing
        </Link>
      </Button>
    </div>
  );
}

export function ListingGridSkeleton({ count = 10 }: { count?: number }) {
  return (
    <div className={GRID} aria-busy="true" aria-label="Loading listings">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-1">
          <Skeleton className="aspect-square w-full rounded-lg bg-[#e4e6eb]" />
          <Skeleton className="mt-2 h-4 w-1/3 bg-[#e4e6eb]" />
          <Skeleton className="mt-1.5 h-4 w-4/5 bg-[#e4e6eb]" />
          <Skeleton className="mt-1.5 h-3 w-1/2 bg-[#e4e6eb]" />
        </div>
      ))}
    </div>
  );
}
