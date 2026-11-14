"use client";

import { useState } from "react";
import { Loader2, ShoppingCart } from "lucide-react";
import { toast } from "sonner";

export function BuyNowButton({ listingId, priceLabel }: { listingId: string; priceLabel: string }) {
  const [loading, setLoading] = useState(false);

  async function onClick() {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId }),
      });
      const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error ?? "Could not start checkout.");
      window.location.assign(data.url);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not start checkout.");
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-[#31a24c] text-[15px] font-semibold text-white shadow-sm transition hover:bg-[#2b9143] disabled:cursor-wait disabled:opacity-80"
    >
      {loading ? (
        <>
          <Loader2 className="size-4 animate-spin" />
          Opening checkout...
        </>
      ) : (
        <>
          <ShoppingCart className="size-4" />
          Buy Now · {priceLabel}
        </>
      )}
    </button>
  );
}
