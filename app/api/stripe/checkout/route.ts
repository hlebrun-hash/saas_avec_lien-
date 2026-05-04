import { z } from "zod";
import { failCode, ok } from "@/lib/api/errors";
import { getCurrentUser } from "@/lib/auth/current-user";
import { stripe } from "@/lib/stripe";

const Schema = z.object({ plan: z.enum(["PRO", "AGENCY"]) });

export async function POST(req: Request) {
  if (!stripe) return failCode("INTERNAL", "Stripe not configured.");
  const user = await getCurrentUser();
  if (!user) return failCode("UNAUTHORIZED", "Sign in required.");
  const body = await req.json().catch(() => null);
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return failCode("INVALID_INPUT", "Invalid plan.");

  const priceId = parsed.data.plan === "PRO" ? process.env.STRIPE_PRICE_PRO : process.env.STRIPE_PRICE_AGENCY;
  if (!priceId) return failCode("INTERNAL", "Stripe price not configured for this plan.");

  const origin = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    customer_email: user.email,
    success_url: `${origin}/settings?checkout=success`,
    cancel_url: `${origin}/settings?checkout=cancel`,
    metadata: { userId: user.id, plan: parsed.data.plan },
  });
  return ok({ url: session.url });
}
