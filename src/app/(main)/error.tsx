"use client";

import { useEffect } from "react";
import { TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MainError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60dvh] items-center justify-center p-4">
      <div className="flex max-w-md flex-col items-center rounded-xl bg-white px-6 py-12 text-center shadow-sm">
        <span className="mb-4 flex size-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <TriangleAlert className="size-8" />
        </span>
        <h1 className="text-xl font-bold">Something went wrong</h1>
        <p className="mt-2 text-[15px] text-muted-foreground">
          We couldn&apos;t load Marketplace right now. Check your connection and try again.
        </p>
        <Button onClick={reset} className="mt-6 h-10 rounded-md bg-fb-blue px-5 font-semibold hover:bg-fb-blue-hover">
          Try again
        </Button>
      </div>
    </div>
  );
}
