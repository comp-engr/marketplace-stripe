import Link from "next/link";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-10 shrink-0 items-center justify-center rounded-full bg-fb-blue text-2xl leading-none font-bold text-white",
        className
      )}
    >
      F
    </span>
  );
}

export function Logo() {
  return (
    <Link href="/" className="flex shrink-0 items-center gap-2" aria-label="Marketplace home">
      <LogoMark />
      <span className="text-xl font-bold tracking-tight max-[400px]:hidden">Marketplace</span>
    </Link>
  );
}
