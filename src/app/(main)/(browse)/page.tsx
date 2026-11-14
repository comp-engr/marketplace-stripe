import type { Metadata } from "next";
import { ListingResults } from "@/components/marketplace/ListingResults";
import { sanitizeSearch } from "@/lib/listings";

// Render on every request so new listings show up immediately
export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ q?: string | string[] }> };

function readQuery(q: string | string[] | undefined) {
  return sanitizeSearch(Array.isArray(q) ? q[0] : q);
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const q = readQuery((await searchParams).q);
  return { title: q ? `Results for "${q}"` : "Today's picks" };
}

export default async function HomePage({ searchParams }: Props) {
  const q = readQuery((await searchParams).q);

  return (
    <>
      <h1 className="mb-3 text-xl font-bold">{q ? `Results for "${q}"` : "Today's picks"}</h1>
      <ListingResults q={q} />
    </>
  );
}
