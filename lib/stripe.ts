import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY;

export const stripe: Stripe | null = key
  ? new Stripe(key, { apiVersion: "2024-10-28.acacia" })
  : null;

export function priceToPlan(priceId: string | null | undefined): "FREE" | "PRO" | "AGENCY" {
  if (!priceId) return "FREE";
  if (priceId === process.env.STRIPE_PRICE_AGENCY) return "AGENCY";
  if (priceId === process.env.STRIPE_PRICE_PRO) return "PRO";
  return "FREE";
}
