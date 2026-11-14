import "server-only";

/** Base URL for Stripe redirect links, without a trailing slash. */
export function getSiteUrl(): string {
  const url = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!url) {
    throw new Error(
      "Missing environment variable NEXT_PUBLIC_SITE_URL (e.g. http://localhost:3000 or https://<project>.vercel.app)."
    );
  }
  return url.replace(/\/+$/, "");
}
