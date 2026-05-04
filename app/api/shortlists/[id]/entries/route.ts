import { z } from "zod";
import { failCode, ok } from "@/lib/api/errors";
import { getCurrentUser } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db";

const AddSchema = z.object({
  creatorId: z.string().min(1),
  scoreSnapshot: z.unknown().optional(),
  note: z.string().max(2000).optional(),
});

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return failCode("UNAUTHORIZED", "Sign in required.");
  const { id: shortlistId } = await ctx.params;

  const list = await prisma.shortlist.findUnique({ where: { id: shortlistId }, select: { userId: true } });
  if (!list || list.userId !== user.id) return failCode("NOT_FOUND", "Shortlist not found.");

  const body = await req.json().catch(() => null);
  const parsed = AddSchema.safeParse(body);
  if (!parsed.success) return failCode("INVALID_INPUT", "Invalid entry payload.");

  const entry = await prisma.shortlistEntry.upsert({
    where: { shortlistId_creatorId: { shortlistId, creatorId: parsed.data.creatorId } },
    update: { note: parsed.data.note ?? null, scoreSnapshot: (parsed.data.scoreSnapshot ?? null) as object | null },
    create: {
      shortlistId,
      creatorId: parsed.data.creatorId,
      note: parsed.data.note ?? null,
      scoreSnapshot: (parsed.data.scoreSnapshot ?? null) as object | null,
    },
  });
  return ok({ id: entry.id }, { status: 201 });
}

export async function DELETE(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return failCode("UNAUTHORIZED", "Sign in required.");
  const { id: shortlistId } = await ctx.params;
  const url = new URL(req.url);
  const creatorId = url.searchParams.get("creatorId");
  if (!creatorId) return failCode("INVALID_INPUT", "Missing creatorId.");

  const list = await prisma.shortlist.findUnique({ where: { id: shortlistId }, select: { userId: true } });
  if (!list || list.userId !== user.id) return failCode("NOT_FOUND", "Shortlist not found.");

  await prisma.shortlistEntry.deleteMany({ where: { shortlistId, creatorId } });
  return ok({ deleted: true });
}
