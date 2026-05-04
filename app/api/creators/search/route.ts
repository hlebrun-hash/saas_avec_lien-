import { z } from "zod";
import { failCode, ok } from "@/lib/api/errors";
import { searchLimiter, getClientKey } from "@/lib/api/ratelimit";
import { getCurrentUser } from "@/lib/auth/current-user";
import { visibleLimit, PLAN_LIMITS } from "@/lib/plans";
import { prisma } from "@/lib/db";
import { brandSignalsSchema } from "@/lib/niche-inference";
import { rankCreators } from "@/lib/matcher";
import { getProvider } from "@/lib/providers";

const PlatformSchema = z.enum(["INSTAGRAM", "TIKTOK", "YOUTUBE", "X", "TWITCH"]);

const InputSchema = z.object({
  jobId: z.string().min(1).optional(),
  signals: brandSignalsSchema.optional(),
  filters: z
    .object({
      platforms: z.array(PlatformSchema).optional(),
      followersMin: z.number().int().nonnegative().optional(),
      followersMax: z.number().int().positive().optional(),
      engagementMin: z.number().min(0).max(1).optional(),
      countries: z.array(z.string().length(2)).max(20).optional(),
      languages: z.array(z.string().length(2)).max(10).optional(),
      categories: z.array(z.string()).max(20).optional(),
      activeWithinDays: z.number().int().positive().max(3650).optional(),
    })
    .default({}),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(50),
});

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return failCode("INVALID_INPUT", "Body must be JSON.");
  }
  const parsed = InputSchema.safeParse(body);
  if (!parsed.success) return failCode("INVALID_INPUT", "Invalid search payload.", parsed.error.flatten());

  const user = await getCurrentUser();
  const rl = await searchLimiter.check(getClientKey(req, user?.id));
  if (!rl.success) return failCode("RATE_LIMITED", "Too many searches.");

  // Resolve brand signals from jobId or inline signals
  let signals = parsed.data.signals;
  if (!signals && parsed.data.jobId) {
    const job = await prisma.analysisJob.findUnique({ where: { id: parsed.data.jobId }, select: { signals: true, status: true } });
    if (!job || job.status !== "COMPLETED") return failCode("NOT_FOUND", "Analysis job not completed.");
    const sigParsed = brandSignalsSchema.safeParse(job.signals);
    if (!sigParsed.success) return failCode("UPSTREAM_ERROR", "Stored signals are malformed.");
    signals = sigParsed.data;
  }
  if (!signals) return failCode("INVALID_INPUT", "Provide jobId or signals.");

  const provider = getProvider();
  const candidates = await provider.searchCreators({
    ...parsed.data.filters,
    keywords: signals.keywords,
    limit: 1000,
  });

  const ranked = rankCreators(signals, candidates);

  // Plan gate: hide deeper results & contact info for FREE
  const plan = user?.plan ?? "FREE";
  const limits = PLAN_LIMITS[plan];
  const visible = visibleLimit(plan);
  const truncated = visible === -1 ? ranked : ranked.slice(0, visible);

  const start = (parsed.data.page - 1) * parsed.data.pageSize;
  const end = start + parsed.data.pageSize;
  const pageItems = truncated.slice(start, end).map((r) => ({
    creator: {
      id: r.creator.id,
      handle: r.creator.handle,
      platform: r.creator.platform,
      displayName: r.creator.displayName,
      followers: r.creator.followers,
      avgViews: r.creator.avgViews,
      engagementRate: r.creator.engagementRate,
      country: r.creator.country,
      language: r.creator.language,
      categories: r.creator.categories,
      recentPostAt: r.creator.recentPostAt,
      brandSafetyScore: r.creator.brandSafetyScore,
      contactEmail: null as string | null,
    },
    score: r.score,
  }));

  // We don't store contactEmail on MatcherCreator (intentional), so re-fetch when allowed
  if (limits.contactInfo && pageItems.length) {
    const ids = pageItems.map((p) => p.creator.id);
    const rows = await prisma.creator.findMany({ where: { id: { in: ids } }, select: { id: true, contactEmail: true } });
    const byId = new Map(rows.map((r) => [r.id, r.contactEmail]));
    for (const p of pageItems) p.creator.contactEmail = byId.get(p.creator.id) ?? null;
  }

  return ok({
    total: truncated.length,
    page: parsed.data.page,
    pageSize: parsed.data.pageSize,
    items: pageItems,
    plan,
    contactInfoUnlocked: limits.contactInfo,
    csvExportUnlocked: limits.csvExport,
    truncatedByPlan: visible !== -1 && ranked.length > visible,
  });
}
