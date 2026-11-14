import type { Metadata } from "next";
import Link from "next/link";
import { Car, CircleHelp, Home, Layers, ShoppingBag, Tag, X, type LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { LogoMark } from "@/components/layout/Logo";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Create new listing" };

type ListingType = {
  title: string;
  description: string;
  icon: LucideIcon;
  href?: string;
};

const LISTING_TYPES: ListingType[] = [
  {
    title: "Item for sale",
    description: "Create a single listing for one or more items to sell.",
    icon: Tag,
    href: "/create/item",
  },
  {
    title: "Create multiple listings",
    description: "Quickly create multiple listings at the same time.",
    icon: Layers,
  },
  {
    title: "Vehicle for sale",
    description: "Sell a car, truck, or other type of vehicle.",
    icon: Car,
  },
  {
    title: "Home for sale or rent",
    description: "List a house or apartment for sale or rent.",
    icon: Home,
  },
];

export default function ChooseListingTypePage() {
  return (
    <div className="min-h-dvh md:flex">
      {/* Left panel */}
      <aside className="border-b bg-white p-4 shadow-sm md:sticky md:top-0 md:h-dvh md:w-80 md:shrink-0 md:border-r md:border-b-0">
        <div className="flex items-center gap-2">
          <Link
            href="/"
            aria-label="Close"
            className="flex size-10 items-center justify-center rounded-full bg-secondary transition hover:bg-[#d8dadf]"
          >
            <X className="size-5" />
          </Link>
          <Link href="/" aria-label="Marketplace home">
            <LogoMark />
          </Link>
        </div>
        <h1 className="mt-4 text-2xl font-bold">Create new listing</h1>
        <Separator className="my-3" />
        <nav className="space-y-1">
          <SidebarItem icon={ShoppingBag} label="Your listings" />
          <SidebarItem icon={CircleHelp} label="Seller help" />
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 p-4 md:p-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-5 text-xl font-bold">Choose listing type</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 md:grid-cols-2">
            {LISTING_TYPES.map((type) => (
              <ListingTypeCard key={type.title} type={type} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

function SidebarItem({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg px-2 py-2 text-[15px] font-semibold text-foreground/90">
      <span className="flex size-9 items-center justify-center rounded-full bg-secondary">
        <Icon className="size-[18px]" />
      </span>
      {label}
    </div>
  );
}

function ListingTypeCard({ type }: { type: ListingType }) {
  const Icon = type.icon;
  const enabled = Boolean(type.href);

  const body = (
    <>
      {!enabled && (
        <Badge variant="secondary" className="absolute top-2 right-2 rounded-full text-[11px]">
          Coming soon
        </Badge>
      )}
      <span
        className={cn(
          "mb-3 flex size-14 items-center justify-center rounded-full",
          enabled ? "bg-fb-active text-fb-blue" : "bg-secondary text-muted-foreground"
        )}
      >
        <Icon className="size-7" />
      </span>
      <h3 className="text-[15px] font-bold">{type.title}</h3>
      <p className="mt-1 text-[13px] leading-snug text-muted-foreground">{type.description}</p>
    </>
  );

  const base =
    "relative flex h-full flex-col items-center rounded-xl bg-white px-4 pt-8 pb-6 text-center shadow-sm";

  if (!enabled) {
    return (
      <div aria-disabled="true" className={cn(base, "cursor-not-allowed opacity-60")}>
        {body}
      </div>
    );
  }

  return (
    <Link
      href={type.href!}
      className={cn(
        base,
        "transition hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-2 focus-visible:ring-fb-blue focus-visible:outline-none"
      )}
    >
      {body}
    </Link>
  );
}
