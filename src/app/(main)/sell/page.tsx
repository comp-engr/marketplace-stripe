import type { Metadata } from "next";
import { BadgeDollarSign } from "lucide-react";
import { ConnectForm } from "@/components/stripe/ConnectForm";
import { SellerStatusCard } from "@/components/stripe/SellerStatusCard";
import { TestDataHelp } from "@/components/stripe/TestDataHelp";
import { countAvailableListings, getSellerByEmail } from "@/lib/sellers";
import { normalizeEmail } from "@/lib/constants";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Get paid for your listings" };

type Props = { searchParams: Promise<{ email?: string }> };

export default async function SellPage({ searchParams }: Props) {
  const email = normalizeEmail((await searchParams).email);
  const seller = email ? await getSellerByEmail(email) : null;
  const active = Boolean(seller?.charges_enabled);
  const availableCount = active && seller ? await countAvailableListings(seller.email) : 0;

  return (
    <main className="mx-auto max-w-xl space-y-4 px-4 py-6 sm:py-10">
      <div className="flex items-center gap-3">
        <span className="flex size-12 items-center justify-center rounded-full bg-[#635BFF] text-white">
          <BadgeDollarSign className="size-6" />
        </span>
        <div>
          <h1 className="text-2xl font-bold">Get paid for your listings</h1>
          <p className="text-[15px] text-muted-foreground">
            Connect Stripe once and buyers can pay for your items with Buy Now.
          </p>
        </div>
      </div>

      {active && seller ? (
        <SellerStatusCard seller={seller} availableCount={availableCount} />
      ) : (
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <ConnectForm defaultEmail={email} />
          <p className="mt-3 text-[13px] text-muted-foreground">
            Use the same email as on your listings. Every listing with this email gets a Buy Now button once Stripe
            onboarding is complete. The marketplace keeps a 10% fee.
          </p>
        </div>
      )}

      <TestDataHelp />
    </main>
  );
}
