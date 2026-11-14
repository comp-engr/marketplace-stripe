import Image from "next/image";
import Link from "next/link";
import { ImageIcon } from "lucide-react";
import { formatPrice } from "@/lib/format";
import type { ListingSummary } from "@/types";

export function ListingCard({ listing, priority = false }: { listing: ListingSummary; priority?: boolean }) {
  return (
    <Link
      href={`/item/${listing.id}`}
      className="group block rounded-lg p-1 transition-colors hover:bg-black/[0.04] focus-visible:ring-2 focus-visible:ring-fb-blue focus-visible:outline-none"
    >
      <div className="relative aspect-square overflow-hidden rounded-lg border border-black/5 bg-[#e4e6eb]">
        {listing.image_url ? (
          <Image
            src={listing.image_url}
            alt={listing.title}
            fill
            priority={priority}
            sizes="(min-width: 1280px) 20vw, (min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-muted-foreground">
            <ImageIcon className="size-10" />
          </div>
        )}
      </div>
      <div className="px-0.5 pt-1.5 pb-1">
        <p className="text-[17px] leading-snug font-bold">{formatPrice(listing.price)}</p>
        <p className="truncate text-[15px] leading-snug" title={listing.title}>
          {listing.title}
        </p>
        <p className="truncate text-[13px] text-muted-foreground">{listing.location}</p>
      </div>
    </Link>
  );
}
