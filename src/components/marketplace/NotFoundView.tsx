import Link from "next/link";
import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";

export function NotFoundView({
  title = "This page isn't available",
  message = "The link may be broken, or the page may have been removed.",
}: {
  title?: string;
  message?: string;
}) {
  return (
    <div className="flex min-h-[60dvh] items-center justify-center p-4">
      <div className="flex max-w-md flex-col items-center rounded-xl bg-white px-6 py-12 text-center shadow-sm">
        <span className="mb-4 flex size-16 items-center justify-center rounded-full bg-fb-active text-fb-blue">
          <SearchX className="size-8" />
        </span>
        <h1 className="text-xl font-bold">{title}</h1>
        <p className="mt-2 text-[15px] text-muted-foreground">{message}</p>
        <Button asChild className="mt-6 h-10 rounded-md bg-fb-blue px-5 font-semibold hover:bg-fb-blue-hover">
          <Link href="/">Back to Marketplace</Link>
        </Button>
      </div>
    </div>
  );
}
