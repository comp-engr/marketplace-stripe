import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ImageIcon, Mail, MapPin, UserRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MessageSellerForm } from "@/components/marketplace/MessageSellerForm";
import { BuyNowButton } from "@/components/stripe/BuyNowButton";
import { getCategoryByName } from "@/lib/categories";
import { formatPrice, formatRelativeTime } from "@/lib/format";
import { getListing } from "@/lib/listings";
import { getSellerByEmail, isPurchasable, isSellerActive } from "@/lib/sellers";
import { MIN_CHARGE_CENTS, toCents } from "@/lib/constants";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const listing = await getListing(id);
  if (!listing) return { title: "Listing not found" };
  return {
    title: listing.title,
    description: listing.description?.slice(0, 160) ?? `${formatPrice(listing.price)} in ${listing.location}`,
    openGraph: listing.image_url ? { images: [listing.image_url] } : undefined,
  };
}

export default async function ItemPage({ params }: Props) {
  const { id } = await params;
  const listing = await getListing(id);
  if (!listing) notFound();

  const category = getCategoryByName(listing.category);

  // Seller lookup happens on the server (sellers table is not readable from the browser)
  const seller = await getSellerByEmail(listing.seller_email);
  const sold = listing.status === "sold";
  const canBuy = isPurchasable(listing, seller);
  const belowMinimum = toCents(listing.price) < MIN_CHARGE_CENTS;

  return (
    <div className="lg:grid lg:h-[calc(100dvh-3.5rem)] lg:grid-cols-3">
      {/* Photo */}
      <div className="relative flex aspect-square items-center justify-center bg-[#18191a] sm:aspect-[4/3] lg:col-span-2 lg:aspect-auto lg:h-full">
        {listing.image_url ? (
          <Image
            src={listing.image_url}
            alt={listing.title}
            fill
            priority
            sizes="(min-width: 1024px) 66vw, 100vw"
            className="object-contain"
          />
        ) : (
          <ImageIcon className="size-16 text-white/40" />
        )}
      </div>

      {/* Details panel */}
      <aside className="bg-white lg:h-full lg:overflow-y-auto lg:border-l lg:shadow-sm">
        <div className="space-y-4 p-4">
          <div>
            <h1 className="text-2xl leading-tight font-bold break-words">{listing.title}</h1>
            <p className="mt-1 flex items-center gap-2 text-[17px] font-semibold">
              <span className={sold ? "text-muted-foreground line-through" : ""}>{formatPrice(listing.price)}</span>
              {sold && (
                <span className="rounded-full bg-red-600 px-2.5 py-0.5 text-xs font-bold tracking-wide text-white uppercase">
                  Sold
                </span>
              )}
            </p>
            <p className="mt-1 flex items-center gap-1 text-[13px] text-muted-foreground">
              <MapPin className="size-3.5 shrink-0" />
              Listed {formatRelativeTime(listing.created_at)} in {listing.location}
            </p>
          </div>

          <Separator />

          <section>
            <h2 className="mb-2 text-[17px] font-bold">Details</h2>
            <Badge asChild variant="secondary" className="h-7 gap-1.5 rounded-full px-3 text-[13px] hover:bg-fb-active">
              <Link href={category ? `/category/${category.slug}` : "/"}>
                {category && <category.icon className="size-3.5" />}
                {listing.category}
              </Link>
            </Badge>
            <p className="mt-3 text-[15px] leading-relaxed break-words whitespace-pre-line">
              {listing.description || <span className="text-muted-foreground">No description provided.</span>}
            </p>
          </section>

          <Separator />

          <section>
            <h2 className="mb-3 text-[17px] font-bold">Seller information</h2>
            <div className="flex items-center gap-3">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-secondary">
                <UserRound className="size-5 text-muted-foreground" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-[15px] font-semibold">{listing.seller_name || "Seller"}</p>
                <a
                  href={`mailto:${listing.seller_email}`}
                  className="flex items-center gap-1 truncate text-[13px] text-fb-blue hover:underline"
                >
                  <Mail className="size-3.5 shrink-0" />
                  {listing.seller_email}
                </a>
              </div>
            </div>
          </section>

          {canBuy ? (
            <BuyNowButton listingId={listing.id} priceLabel={formatPrice(listing.price)} />
          ) : sold ? (
            <p className="rounded-lg bg-red-50 px-3 py-2.5 text-sm font-medium text-red-700">
              This item has been sold.
            </p>
          ) : !isSellerActive(seller) ? (
            <p className="rounded-lg bg-secondary px-3 py-2.5 text-sm text-muted-foreground">
              This seller hasn&apos;t set up payments yet.
            </p>
          ) : belowMinimum ? (
            <p className="rounded-lg bg-secondary px-3 py-2.5 text-sm text-muted-foreground">
              Free items can&apos;t be bought online. Message the seller to arrange pickup.
            </p>
          ) : null}

          <MessageSellerForm listingId={listing.id} />
        </div>
      </aside>
    </div>
  );
}
