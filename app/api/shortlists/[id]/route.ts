import { failCode, ok } from "@/lib/api/errors";
import { getCurrentUser } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return failCode("UNAUTHORIZED", "Sign in required.");
  const { id } = await ctx.params;
  const list = await prisma.shortlist.findUnique({
    where: { id },
    include: {
      entries: {
        orderBy: { addedAt: "desc" },
        include: {
          creator: {
            select: {
              id: true,
              handle: true,
              platform: true,
              displayName: true,
              followers: true,
              engagementRate: true,
              country: true,
              categories: true,
            },
          },
        },
      },
    },
  });
  if (!list || list.userId !== user.id) return failCode("NOT_FOUND", "Shortlist not found.");
  return ok({ id: list.id, name: list.name, entries: list.entries });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return failCode("UNAUTHORIZED", "Sign in required.");
  const { id } = await ctx.params;
  const list = await prisma.shortlist.findUnique({ where: { id }, select: { userId: true } });
  if (!list || list.userId !== user.id) return failCode("NOT_FOUND", "Shortlist not found.");
  await prisma.shortlist.delete({ where: { id } });
  return ok({ deleted: true });
}
