import Link from "next/link";
import { CircleAlert, CircleCheck, ExternalLink } from "lucide-react";
import type { Seller } from "@/types";

export function SellerStatusCard({
  seller,
  availableCount,
  dashboardError = false,
}: {
  seller: Seller;
  availableCount: number;
  dashboardError?: boolean;
}) {
  const active = seller.charges_enabled;
  const q = `email=${encodeURIComponent(seller.email)}`;

  return (
    <div className="rounded-xl bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        {active ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-800">
            <CircleCheck className="size-4" /> Active
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-800">
            <CircleAlert className="size-4" /> Pending
          </span>
        )}
        <span className="truncate text-sm text-muted-foreground">{seller.email}</span>
      </div>

      <p className="mt-3 text-[15px]">
        {active
          ? "Your Stripe account is connected. Your listings now show a Buy Now button."
          : "Onboarding is not finished."}
      </p>

      <dl className="mt-4 grid grid-cols-1 gap-3 rounded-lg bg-fb-bg p-3 text-sm sm:grid-cols-2">
        <div className="min-w-0">
          <dt className="text-muted-foreground">Stripe account</dt>
          <dd className="truncate font-mono text-[13px] font-semibold">{seller.stripe_account_id}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Available listings</dt>
          <dd className="font-semibold">{availableCount}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Charges</dt>
          <dd className="font-semibold">{seller.charges_enabled ? "Enabled" : "Not yet"}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Payouts</dt>
          <dd className="font-semibold">{seller.payouts_enabled ? "Enabled" : "Not yet"}</dd>
        </div>
      </dl>

      {dashboardError && (
        <p className="mt-3 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          Couldn&apos;t open the Stripe dashboard. Finish onboarding first, then try again.
        </p>
      )}

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        {active ? (
          <a
            href={`/api/stripe/dashboard?${q}`}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#635BFF] px-4 text-[15px] font-semibold text-white transition hover:bg-[#5249e6]"
          >
            View Stripe dashboard <ExternalLink className="size-4" />
          </a>
        ) : (
          <a
            href={`/sell/refresh?${q}`}
            className="inline-flex h-10 items-center justify-center rounded-md bg-[#635BFF] px-4 text-[15px] font-semibold text-white transition hover:bg-[#5249e6]"
          >
            Continue onboarding
          </a>
        )}
        <Link
          href="/create/item"
          className="inline-flex h-10 items-center justify-center rounded-md bg-secondary px-4 text-[15px] font-semibold transition hover:bg-[#d8dadf]"
        >
          Create a listing
        </Link>
      </div>
    </div>
  );
}
