import "server-only";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error("Missing environment variable NEXT_PUBLIC_SUPABASE_URL.");
}
if (!serviceRoleKey) {
  throw new Error(
    "Missing environment variable SUPABASE_SERVICE_ROLE_KEY. Add the service_role / secret key to .env.local (locally) or to your Vercel project settings."
  );
}

/**
 * Bypasses Row Level Security. Use ONLY in route handlers and server
 * components, never in client components.
 */
export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});
