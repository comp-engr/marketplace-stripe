import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ListingResults } from "@/components/marketplace/ListingResults";
import { getCategoryBySlug } from "@/lib/categories";
import { sanitizeSearch } from "@/lib/listings";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ q?: string | string[] }>;
};

function readQuery(q: string | string[] | undefined) {
  return sanitizeSearch(Array.isArray(q) ? q[0] : q);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  return { title: category?.name ?? "Category not found" };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  // Runs before any streaming starts, so the response is a real 404
  if (!category) notFound();

  const q = readQuery((await searchParams).q);

  return (
    <>
      <h1 className="mb-3 text-xl font-bold">
        {q ? `Results for "${q}"` : category.name}
        {q && <span className="ml-2 text-[15px] font-normal text-muted-foreground">in {category.name}</span>}
      </h1>
      <ListingResults category={category.name} q={q} />
    </>
  );
}
