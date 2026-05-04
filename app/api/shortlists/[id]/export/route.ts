import { failCode } from "@/lib/api/errors";
import { getCurrentUser } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db";
import { PLAN_LIMITS } from "@/lib/plans";

function csvEscape(v: unknown): string {
  if (v === null || v === undefined) return "";
  const s = String(v);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return failCode("UNAUTHORIZED", "Sign in required.");
  if (!PLAN_LIMITS[user.plan].csvExport) return failCode("FORBIDDEN", "CSV export requires Pro or Agency.");

  const { id: shortlistId } = await ctx.params;
  const list = await prisma.shortlist.findUnique({
    where: { id: shortlistId },
    include: { entries: { include: { creator: true } } },
  });
  if (!list || list.userId !== user.id) return failCode("NOT_FOUND", "Shortlist not found.");

  const showContact = PLAN_LIMITS[user.plan].contactInfo;
  const headers = [
    "handle",
    "platform",
    "displayName",
    "followers",
    "avgViews",
    "engagementRate",
    "country",
    "language",
    "categories",
    "recentPostAt",
    "brandSafetyScore",
    ...(showContact ? ["contactEmail"] : []),
    "note",
  ];

  const lines: string[] = [headers.join(",")];
  for (const e of list.entries) {
    const c = e.creator;
    const row = [
      c.handle,
      c.platform,
      c.displayName,
      c.followers,
      c.avgViews,
      c.engagementRate,
      c.country,
      c.language,
      c.categories.join("|"),
      c.recentPostAt.toISOString(),
      c.brandSafetyScore,
      ...(showContact ? [c.contactEmail ?? ""] : []),
      e.note ?? "",
    ].map(csvEscape);
    lines.push(row.join(","));
  }

  return new Response(lines.join("\n"), {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="shortlist-${list.id}.csv"`,
    },
  });
}
