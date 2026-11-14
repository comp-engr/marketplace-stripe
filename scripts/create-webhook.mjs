// Register this app's Stripe webhook endpoint (run once):
//   node --env-file=.env.local scripts/create-webhook.mjs
//
// The sandbox is shared with other candidates, so this script:
//   - never deletes or edits endpoints,
//   - skips creating one if an endpoint with our exact URL already exists.
import Stripe from "stripe";

const WEBHOOK_URL = "https://marketplace-stripe-eight.vercel.app/api/stripe/webhook";
const EVENTS = ["checkout.session.completed", "account.updated"];

if (!process.env.STRIPE_SECRET_KEY) {
  console.error("STRIPE_SECRET_KEY is missing. Run with: node --env-file=.env.local scripts/create-webhook.mjs");
  process.exit(1);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Look through every existing endpoint for our URL
let existing = null;
for await (const endpoint of stripe.webhookEndpoints.list({ limit: 100 })) {
  if (endpoint.url === WEBHOOK_URL) {
    existing = endpoint;
    break;
  }
}

if (existing) {
  console.log(`An endpoint for ${WEBHOOK_URL} already exists (${existing.id}, status: ${existing.status}).`);
  console.log("Not creating another one. Its signing secret was shown only when it was created;");
  console.log("if you lost it, roll the secret in the Stripe Dashboard or ask the sandbox owner.");
  process.exit(0);
}

const endpoint = await stripe.webhookEndpoints.create({
  url: WEBHOOK_URL,
  connect: true,
  enabled_events: EVENTS,
  description: "capm-marketplace-marco",
  metadata: { app: "capm-marketplace-marco" },
});

console.log("Created webhook endpoint:", endpoint.id);
console.log("Listening for:", EVENTS.join(", "), "(connect: true)");
console.log("Signing secret:", endpoint.secret);
console.log("\nPut this value in STRIPE_WEBHOOK_SECRET in .env.local AND in Vercel, then redeploy.");
