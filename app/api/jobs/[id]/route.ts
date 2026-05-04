import { prisma } from "@/lib/db";
import { failCode, ok } from "@/lib/api/errors";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const job = await prisma.analysisJob.findUnique({
    where: { id },
    select: { id: true, status: true, error: true, signals: true, latencyMs: true, completedAt: true, url: true },
  });
  if (!job) return failCode("NOT_FOUND", "Job not found.");
  return ok({
    id: job.id,
    status: job.status,
    error: job.error,
    signals: job.signals,
    latencyMs: job.latencyMs,
    completedAt: job.completedAt,
    url: job.url,
  });
}
