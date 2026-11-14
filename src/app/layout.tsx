import type { Metadata, Viewport } from "next";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Marketplace",
    template: "%s | Marketplace",
  },
  description: "Buy and sell items in your community.",
};

export const viewport: Viewport = {
  themeColor: "#1877f2",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-dvh bg-fb-bg text-foreground antialiased">
        {children}
        <Toaster theme="light" position="top-center" richColors closeButton />
      </body>
    </html>
  );
}
