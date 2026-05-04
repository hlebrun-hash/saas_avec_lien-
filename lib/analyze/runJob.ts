import { prisma } from "@/lib/db";
import { scrape } from "@/lib/scraper";
import { inferBrandSignals } from "@/lib/niche-inference";
import { hashUrl } from "@/lib/scraper/url-validator";

export async function createAnalysisJob(url: string): Promise<{ id: string }> {
  const job = await prisma.analysisJob.create({
    data: { url, urlHash: hashUrl(url), status: "PENDING" },
    select: { id: true },
  });
  return { id: job.id };
}

export async function runAnalysisJob(jobId: string): Promise<void> {
  const start = Date.now();
  await prisma.analysisJob.update({ where: { id: jobId }, data: { status: "RUNNING" } });
  try {
    const job = await prisma.analysisJob.findUniqueOrThrow({ where: { id: jobId } });
    const scraped = await scrape(job.url);
    if (!scraped.ok) {
      await prisma.analysisJob.update({
        where: { id: jobId },
        data: { status: "FAILED", error: scraped.message, latencyMs: Date.now() - start, completedAt: new Date() },
      });
      return;
    }
    const inference = await inferBrandSignals(scraped.site);
    await prisma.analysisJob.update({
      where: { id: jobId },
      data: {
        status: "COMPLETED",
        signals: inference.signals as unknown as object,
        latencyMs: Date.now() - start,
        tokenCost: inference.tokenCost,
        completedAt: new Date(),
      },
    });
  } catch (e) {
    await prisma.analysisJob.update({
      where: { id: jobId },
      data: { status: "FAILED", error: (e as Error).message, latencyMs: Date.now() - start, completedAt: new Date() },
    });
  }
}
