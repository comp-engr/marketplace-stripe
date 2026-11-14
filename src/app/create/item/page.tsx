import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, X } from "lucide-react";
import { LogoMark } from "@/components/layout/Logo";
import { ListingForm } from "@/components/marketplace/ListingForm";

export const metadata: Metadata = { title: "Item for sale" };

export default function CreateItemPage() {
  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-white px-4 shadow-sm">
        <Link
          href="/create"
          aria-label="Close"
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary transition hover:bg-[#d8dadf]"
        >
          <X className="size-5" />
        </Link>
        <Link href="/" aria-label="Marketplace home">
          <LogoMark />
        </Link>
        <div className="min-w-0">
          <p className="flex items-center gap-1 text-[13px] text-muted-foreground">
            <Link href="/" className="hover:underline">
              Marketplace
            </Link>
            <ChevronRight className="size-3" />
            <Link href="/create" className="hover:underline">
              Create new listing
            </Link>
          </p>
          <h1 className="truncate text-xl leading-tight font-bold">Item for sale</h1>
        </div>
      </header>
      <ListingForm />
    </div>
  );
}
