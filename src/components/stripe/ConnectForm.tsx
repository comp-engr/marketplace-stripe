"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { isValidEmail } from "@/lib/validation";

export function ConnectForm({ defaultEmail = "" }: { defaultEmail?: string }) {
  const [email, setEmail] = useState(defaultEmail);
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const valid = isValidEmail(email);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setTouched(true);
    if (!valid || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error ?? "Could not connect to Stripe.");
      window.location.assign(data.url);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not connect to Stripe.";
      setError(message);
      toast.error(message);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-3">
      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold">Seller email</span>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => setTouched(true)}
          placeholder="The email you use on your listings"
          autoComplete="email"
          aria-invalid={touched && !valid}
          className="h-12"
        />
      </label>
      {touched && !valid && <p className="text-[13px] text-destructive">Enter a valid email address.</p>}
      <button
        type="submit"
        disabled={!valid || loading}
        className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-[#635BFF] text-[15px] font-semibold text-white transition hover:bg-[#5249e6] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Connecting...
          </>
        ) : (
          "Connect with Stripe"
        )}
      </button>
      {error && (
        <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}
    </form>
  );
}
