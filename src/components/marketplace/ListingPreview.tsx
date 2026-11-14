import Image from "next/image";
import { ImageIcon, UserRound } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/lib/format";

type Props = {
  imageUrl: string | null;
  title: string;
  price: string;
  location: string;
  sellerName: string;
  description: string;
  category: string;
};

/** Middle (photo) and right (details) columns of the create-listing page. */
export function ListingPreview({ imageUrl, title, price, location, sellerName, description, category }: Props) {
  const priceNumber = price.trim() === "" ? NaN : Number(price);
  const priceLabel = Number.isFinite(priceNumber) && priceNumber >= 0 ? formatPrice(priceNumber) : "Price";

  return (
    <>
      <section className="flex flex-col rounded-xl bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-[17px] font-bold">Preview</h2>
        <div className="relative flex aspect-[4/3] w-full flex-1 items-center justify-center overflow-hidden rounded-lg bg-[#e4e6eb] lg:aspect-auto lg:min-h-[420px]">
          {imageUrl ? (
            <Image src={imageUrl} alt="Listing photo preview" fill unoptimized className="object-contain" />
          ) : (
            <div className="flex flex-col items-center gap-2 px-6 text-center text-muted-foreground">
              <ImageIcon className="size-12" />
              <p className="text-[15px] font-semibold">Your listing preview</p>
              <p className="text-sm">As you create your listing, you can preview how it will appear to others.</p>
            </div>
          )}
        </div>
      </section>

      <section className="rounded-xl bg-white p-4 shadow-sm">
        <h2 className={`text-2xl leading-tight font-bold break-words ${title ? "" : "text-muted-foreground"}`}>
          {title || "Title"}
        </h2>
        <p className={`mt-1 text-[17px] font-semibold ${priceLabel === "Price" ? "text-muted-foreground" : ""}`}>
          {priceLabel}
        </p>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Listed just now in {location.trim() || "Palo Alto, CA"}
        </p>

        <Separator className="my-4" />

        <h3 className="text-[17px] font-bold">Details</h3>
        {category && <p className="mt-1 text-[15px]">{category}</p>}
        <p className="mt-1 text-[15px] break-words whitespace-pre-line text-muted-foreground">
          {description || "Description will appear here."}
        </p>

        <Separator className="my-4" />

        <h3 className="text-[17px] font-bold">Seller information</h3>
        <div className="mt-3 flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-full bg-secondary">
            <UserRound className="size-5 text-muted-foreground" />
          </span>
          <span className="text-[15px] font-semibold">{sellerName.trim() || "Seller"}</span>
        </div>
      </section>
    </>
  );
}
