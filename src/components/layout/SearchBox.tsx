"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

export function SearchBox() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const q = searchParams.get("q") ?? "";

  // Stay inside the current category when searching from /category/[slug]
  const categoryMatch = pathname.match(/^\/category\/([^/]+)/);
  const basePath = categoryMatch ? `/category/${categoryMatch[1]}` : "/";

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = String(new FormData(event.currentTarget).get("q") ?? "").trim();
    router.push(value ? `${basePath}?q=${encodeURIComponent(value)}` : basePath);
  }

  return (
    <form role="search" onSubmit={onSubmit} className="relative">
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <input
        // Re-mount when the URL query changes so the box mirrors it
        key={q}
        name="q"
        type="search"
        defaultValue={q}
        placeholder="Search Marketplace"
        aria-label="Search Marketplace"
        className="h-10 w-full rounded-full bg-fb-bg pr-4 pl-9 text-[15px] outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-fb-blue/40"
      />
    </form>
  );
}
