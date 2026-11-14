"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase";
import { LIMITS, isValidEmail } from "@/lib/validation";
import type { NewMessage } from "@/types";

const DEFAULT_MESSAGE = "Is this available?";

export function MessageSellerForm({ listingId }: { listingId: string }) {
  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [message, setMessage] = useState(DEFAULT_MESSAGE);
  const [emailTouched, setEmailTouched] = useState(false);
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const emailOk = isValidEmail(buyerEmail) && buyerEmail.trim().length <= LIMITS.email;
  const messageOk = message.trim().length > 0 && message.trim().length <= LIMITS.message;
  const canSend = emailOk && messageOk && !sending;

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setEmailTouched(true);
    if (!canSend) return;

    setSending(true);
    setStatus(null);

    const payload: NewMessage = {
      listing_id: listingId,
      buyer_name: buyerName.trim() || null,
      buyer_email: buyerEmail.trim(),
      message: message.trim(),
    };

    // No .select(): messages have no SELECT policy, so reading the row back would fail.
    // seller_email is filled in by a database trigger from the listing.
    const { error } = await supabase.from("messages").insert(payload);

    setSending(false);
    if (error) {
      const text = `Your message couldn't be sent: ${error.message}`;
      setStatus({ type: "error", text });
      toast.error(text);
      return;
    }

    setMessage("");
    setStatus({ type: "success", text: "Message sent to the seller!" });
    toast.success("Message sent to the seller!");
  }

  return (
    <form onSubmit={onSubmit} noValidate className="rounded-xl border bg-white p-4 shadow-sm">
      <h3 className="mb-3 flex items-center gap-2 text-[17px] font-bold">
        <MessageCircle className="size-5 text-fb-blue" />
        Send seller a message
      </h3>

      <div className="space-y-2.5">
        <Input
          value={buyerName}
          onChange={(e) => setBuyerName(e.target.value)}
          maxLength={LIMITS.name}
          placeholder="Your name (optional)"
          aria-label="Your name (optional)"
          autoComplete="name"
          className="h-10 bg-fb-bg"
        />
        <div>
          <Input
            type="email"
            value={buyerEmail}
            onChange={(e) => setBuyerEmail(e.target.value)}
            onBlur={() => setEmailTouched(true)}
            maxLength={LIMITS.email}
            placeholder="Your email"
            aria-label="Your email"
            autoComplete="email"
            required
            aria-invalid={emailTouched && !emailOk}
            className="h-10 bg-fb-bg"
          />
          {emailTouched && !emailOk && (
            <p role="alert" className="mt-1 text-[13px] text-destructive">
              Enter a valid email so the seller can reply.
            </p>
          )}
        </div>
        <Textarea
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            if (status?.type === "success") setStatus(null);
          }}
          maxLength={LIMITS.message}
          rows={3}
          aria-label="Message"
          className="min-h-20 resize-y bg-fb-bg"
        />
        <Button
          type="submit"
          disabled={!canSend}
          className="h-9 w-full rounded-md bg-fb-blue font-semibold hover:bg-fb-blue-hover"
        >
          {sending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Sending...
            </>
          ) : (
            "Send"
          )}
        </Button>
      </div>

      {status && (
        <p
          role="status"
          className={
            status.type === "success"
              ? "mt-3 flex items-center gap-1.5 text-sm font-medium text-green-700"
              : "mt-3 text-sm text-destructive"
          }
        >
          {status.type === "success" && <CheckCircle2 className="size-4" />}
          {status.text}
        </p>
      )}
    </form>
  );
}
