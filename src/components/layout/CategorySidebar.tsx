"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Store } from "lucide-react";
import { CATEGORIES } from "@/lib/categories";
import { cn } from "@/lib/utils";

type NavItem = {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

const NAV_ITEMS: NavItem[] = [
  { name: "All listings", href: "/", icon: Store },
  ...CATEGORIES.map((c) => ({ name: c.name, href: `/category/${c.slug}`, icon: c.icon })),
];

export function CategorySidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* Tablet / desktop sidebar */}
      <aside className="sticky top-14 hidden h-[calc(100dvh-3.5rem)] w-72 shrink-0 overflow-y-auto border-r border-border/60 bg-white px-2 py-4 shadow-sm md:block lg:w-80">
        <h2 className="px-2 pb-2 text-xl font-bold">Categories</h2>
        <nav aria-label="Categories">
          <ul className="space-y-0.5">
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-2 py-2 text-[15px] font-medium transition-colors",
                      active ? "bg-fb-active text-fb-blue" : "hover:bg-fb-bg"
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-9 shrink-0 items-center justify-center rounded-full",
                        active ? "bg-fb-blue text-white" : "bg-secondary text-foreground"
                      )}
                    >
                      <Icon className="size-[18px]" />
                    </span>
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {/* Mobile: horizontally scrolling chips */}
      <nav
        aria-label="Categories"
        className="scrollbar-none sticky top-14 z-30 flex gap-2 overflow-x-auto border-b border-border/60 bg-white px-4 py-2 md:hidden"
      >
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold whitespace-nowrap transition-colors",
                active ? "bg-fb-active text-fb-blue" : "bg-secondary hover:bg-[#d8dadf]"
              )}
            >
              <Icon className="size-4" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
