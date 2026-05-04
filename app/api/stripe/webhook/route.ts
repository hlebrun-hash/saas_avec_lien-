import { failCode, ok } from "@/lib/api/errors";
import { stripe, priceToPlan } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import type Stripe from "stripe";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!stripe) return failCode("INTERNAL", "Stripe not configured.");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return failCode("INTERNAL", "Webhook secret not set.");

  const sig = req.headers.get("stripe-signature");
  if (!sig) return failCode("INVALID_INPUT", "Missing stripe-signature header.");
  const payload = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, sig, secret);
  } catch (e) {
    return failCode("INVALID_INPUT", `Invalid signature: ${(e as Error).message}`);
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      if (userId && session.subscription && session.customer) {
        const sub = await stripe.subscriptions.retrieve(session.subscription as string);
        const priceId = sub.items.data[0]?.price.id ?? null;
        const plan = priceToPlan(priceId);
        await prisma.user.update({ where: { id: userId }, data: { plan } });
        await prisma.subscription.upsert({
          where: { userId },
          update: {
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: sub.id,
            stripePriceId: priceId,
            plan,
            status: sub.status,
            currentPeriodEnd: new Date(sub.current_period_end * 1000),
          },
          create: {
            userId,
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: sub.id,
            stripePriceId: priceId,
            plan,
            status: sub.status,
            currentPeriodEnd: new Date(sub.current_period_end * 1000),
          },
        });
      }
      break;
    }
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const priceId = sub.items.data[0]?.price.id ?? null;
      const plan = event.type === "customer.subscription.deleted" ? "FREE" : priceToPlan(priceId);
      const existing = await prisma.subscription.findUnique({ where: { stripeSubscriptionId: sub.id } });
      if (existing) {
        await prisma.subscription.update({
          where: { stripeSubscriptionId: sub.id },
          data: { plan, status: sub.status, stripePriceId: priceId, currentPeriodEnd: new Date(sub.current_period_end * 1000) },
        });
        await prisma.user.update({ where: { id: existing.userId }, data: { plan } });
      }
      break;
    }
    default:
      // Ignore other events
      break;
  }

  return ok({ received: true });
}
