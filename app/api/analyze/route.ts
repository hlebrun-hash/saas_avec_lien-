import { z } from "zod";
import { failCode, ok } from "@/lib/api/errors";
import { analyzeAnonLimiter, analyzeUserLimiter, getClientKey } from "@/lib/api/ratelimit";
import { getCurrentUser } from "@/lib/auth/current-user";
import { canAnalyze } from "@/lib/plans";
import { prisma } from "@/lib/db";
import { validateUrl } from "@/lib/scraper/url-validator";
import { createAnalysisJob, runAnalysisJob } from "@/lib/analyze/runJob";

const InputSchema = z.object({ url: z.string().min(3).max(2048) });

export async function POST(req: Request) {
  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return failCode("INVALID_INPUT", "Body must be JSON.");
    }

    const parsed = InputSchema.safeParse(body);
    if (!parsed.success) return failCode("INVALID_INPUT", "Missing or invalid 'url'.", parsed.error.flatten());

    const v = validateUrl(parsed.data.url);
    if (!v.ok) return failCode("INVALID_INPUT", v.message);

    let user = null;
    try {
      user = await getCurrentUser();
    } catch (e) {
      // DB not reachable — log and continue as anonymous
      console.error("[analyze] getCurrentUser failed:", (e as Error).message);
    }

    const limiter = user ? analyzeUserLimiter : analyzeAnonLimiter;
    const key = getClientKey(req, user?.id);
    const rl = await limiter.check(key);
    if (!rl.success) return failCode("RATE_LIMITED", "Too many analyses. Please slow down.");

    if (user) {
      if (!canAnalyze(user.plan, user.analysesUsed)) {
        return failCode("QUOTA_EXCEEDED", "You've reached your plan's analysis quota.");
      }
      try {
        await prisma.user.update({ where: { id: user.id }, data: { analysesUsed: { increment: 1 } } });
      } catch (e) {
        console.error("[analyze] usage increment failed:", (e as Error).message);
      }
    }

    const job = await createAnalysisJob(v.url.toString());
    void runAnalysisJob(job.id);
    return ok({ jobId: job.id }, { status: 202 });
  } catch (e) {
    const msg = (e as Error).message ?? "Unknown error";
    console.error("[analyze] unhandled error:", msg);
    // Surface a helpful hint for the most common setup mistake
    if (msg.includes("connect") || msg.includes("prisma") || msg.includes("P1") || msg.includes("database")) {
      return failCode("INTERNAL", `Database unreachable. Run: docker compose up -d && pnpm db:push && pnpm db:seed`);
    }
    return failCode("INTERNAL", `Server error: ${msg}`);
  }
}
