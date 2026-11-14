import { CategorySidebar } from "@/components/layout/CategorySidebar";

/** Shared by "/" and "/category/[slug]": the sidebar stays mounted while the grid swaps. */
export default function BrowseLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="md:flex">
      <CategorySidebar />
      <main className="min-w-0 flex-1 px-3 py-4 sm:px-4 lg:px-6">{children}</main>
    </div>
  );
}
