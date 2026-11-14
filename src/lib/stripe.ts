import "server-only";
import Stripe from "stripe";

const secretKey = process.env.STRIPE_SECRET_KEY;

if (!secretKey) {
  throw new Error(
    "Missing environment variable STRIPE_SECRET_KEY. Add it to .env.local (locally) or to your Vercel project settings, then restart or redeploy."
  );
}

export const stripe = new Stripe(secretKey, {
  appInfo: { name: "capm-marketplace-marco" },
});
