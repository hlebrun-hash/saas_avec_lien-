import { prisma } from "@/lib/db";

const BYPASS = process.env.DEV_AUTH_BYPASS === "true";
const CLERK_CONFIGURED = !!process.env.CLERK_SECRET_KEY && !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

export interface CurrentUser {
  id: string;
  email: string;
  plan: "FREE" | "PRO" | "AGENCY";
  analysesUsed: number;
}

const DEV_USER_EMAIL = "dev@influencematch.local";

async function ensureDevUser(): Promise<CurrentUser> {
  const u = await prisma.user.upsert({
    where: { email: DEV_USER_EMAIL },
    update: {},
    create: { email: DEV_USER_EMAIL, name: "Dev User", plan: "FREE" },
  });
  return { id: u.id, email: u.email, plan: u.plan, analysesUsed: u.analysesUsed };
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  if (BYPASS || !CLERK_CONFIGURED) return ensureDevUser();
  const { auth, currentUser } = await import("@clerk/nextjs/server");
  const { userId } = await auth();
  if (!userId) return null;
  const cu = await currentUser();
  const email = cu?.primaryEmailAddress?.emailAddress ?? `${userId}@clerk.local`;
  const u = await prisma.user.upsert({
    where: { externalId: userId },
    update: { email },
    create: { externalId: userId, email, name: cu?.firstName ?? null },
  });
  return { id: u.id, email: u.email, plan: u.plan, analysesUsed: u.analysesUsed };
}

export async function requireUser(): Promise<CurrentUser> {
  const u = await getCurrentUser();
  if (!u) throw new Error("UNAUTHORIZED");
  return u;
}
