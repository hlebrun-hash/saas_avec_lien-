import { z } from "zod";
import { failCode, ok } from "@/lib/api/errors";
import { getCurrentUser } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return failCode("UNAUTHORIZED", "Sign in required.");
  const lists = await prisma.shortlist.findMany({
    where: { userId: user.id },
    include: { _count: { select: { entries: true } } },
    orderBy: { createdAt: "desc" },
  });
  return ok(
    lists.map((l) => ({ id: l.id, name: l.name, createdAt: l.createdAt, entryCount: l._count.entries }))
  );
}

const CreateSchema = z.object({ name: z.string().min(1).max(120) });

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return failCode("UNAUTHORIZED", "Sign in required.");
  const body = await req.json().catch(() => null);
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) return failCode("INVALID_INPUT", "Invalid name.");
  const list = await prisma.shortlist.create({ data: { userId: user.id, name: parsed.data.name } });
  return ok({ id: list.id, name: list.name }, { status: 201 });
}
