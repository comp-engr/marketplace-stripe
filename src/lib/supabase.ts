import { createClient } from "@supabase/supabase-js";

// NEXT_PUBLIC_* values are inlined at build time, so they must be read by
// their literal names (process.env[name] would be undefined in the browser).
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error(
    "Missing environment variable NEXT_PUBLIC_SUPABASE_URL. Add it to .env.local (locally) or to your Vercel project settings, then restart or redeploy."
  );
}

if (!supabaseAnonKey) {
  throw new Error(
    "Missing environment variable NEXT_PUBLIC_SUPABASE_ANON_KEY. Add your Supabase anon or publishable key to .env.local (locally) or to your Vercel project settings, then restart or redeploy."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false },
});

export const LISTING_IMAGES_BUCKET = "listing-images";
