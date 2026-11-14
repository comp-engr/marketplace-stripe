import type { Metadata } from "next";
import Link from "next/link";
import { SellerStatusCard } from "@/components/stripe/SellerStatusCard";
import { TestDataHelp } from "@/components/stripe/TestDataHelp";
import { countAvailableListings, getSellerByEmail, syncSeller } from "@/lib/sellers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Stripe connection" };

type Props = { searchParams: Promise<{ email?: string; error?: string }> };

export default async function SellReturnPage({ searchParams }: Props) {
  const { email = "", error } = await searchParams;
  const found = await getSellerByEmail(email);

  if (!found) {
    return (
      <main className="mx-auto max-w-xl px-4 py-10">
        <div className="rounded-xl bg-white p-6 text-center shadow-sm">
          <h1 className="text-xl font-bold">We couldn&apos;t find that seller</h1>
          <p className="mt-2 text-[15px] text-muted-foreground">Start again with the email on your listings.</p>
          <Link href="/sell" className="mt-4 inline-block font-semibold text-fb-blue hover:underline">
            Go to Connect with Stripe
          </Link>
        </div>
      </main>
    );
  }

  // Source of truth is Stripe: refresh the flags on every visit
  const seller = await syncSeller(found);
  const availableCount = await countAvailableListings(seller.email);

  return (
    <main className="mx-auto max-w-xl space-y-4 px-4 py-6 sm:py-10">
      <h1 className="text-2xl font-bold">Get paid for your listings</h1>
      <SellerStatusCard seller={seller} availableCount={availableCount} dashboardError={error === "dashboard"} />
      {!seller.charges_enabled && <TestDataHelp />}
    </main>
  );
}
