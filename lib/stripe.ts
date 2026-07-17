import Stripe from "stripe";
import { requireEnv } from "@/lib/env";

// NOTE: The plan pinned "2025-01-27.acacia", but the installed `stripe` SDK
// (22.x) only types `apiVersion` as its own bundled literal ("2026-06-24.dahlia").
// Passing the plan's string would fail `tsc`/the Next.js build, so this pins
// the version the installed SDK actually supports instead.
export function getStripeClient(): Stripe {
  return new Stripe(requireEnv("STRIPE_SECRET_KEY"), {
    apiVersion: "2026-06-24.dahlia",
  });
}
