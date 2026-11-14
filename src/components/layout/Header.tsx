import { Suspense } from "react";
import Link from "next/link";
import { BadgeDollarSign, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/layout/Logo";
import { SearchBox } from "@/components/layout/SearchBox";

export function Header() {
  return (
    <header className="sticky top-0 z-40 h-14 border-b border-border/60 bg-white shadow-sm">
      <div className="flex h-full items-center gap-3 px-4">
        <Logo />
        <div className="min-w-0 flex-1 md:max-w-md">
          <Suspense fallback={<div className="h-10 rounded-full bg-fb-bg" />}>
            <SearchBox />
          </Suspense>
        </div>
        <Link
          href="/sell"
          aria-label="Sell: connect with Stripe"
          className="ml-auto flex h-9 shrink-0 items-center gap-1.5 rounded-md px-2.5 text-[15px] font-semibold text-[#635BFF] transition hover:bg-[#635BFF]/10"
        >
          <BadgeDollarSign className="size-5" />
          <span className="hidden md:inline">Sell</span>
        </Link>
        <Button
          asChild
          className="h-9 shrink-0 rounded-md bg-fb-blue px-3 font-semibold hover:bg-fb-blue-hover"
        >
          <Link href="/create" aria-label="Create new listing">
            <Plus className="size-4" strokeWidth={2.5} />
            <span className="hidden sm:inline">Create new listing</span>
          </Link>
        </Button>
      </div>
    </header>
  );
}
