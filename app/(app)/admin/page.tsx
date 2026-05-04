import { getCurrentUser } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user || user.plan !== "AGENCY") redirect("/search");

  const [jobCount, creatorCount, userCount, recentJobs] = await Promise.all([
    prisma.analysisJob.count(),
    prisma.creator.count(),
    prisma.user.count(),
    prisma.analysisJob.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      select: { id: true, url: true, status: true, latencyMs: true, tokenCost: true, createdAt: true },
    }),
  ]);

  const avgLatency =
    recentJobs.filter((j) => j.latencyMs).reduce((s, j) => s + (j.latencyMs ?? 0), 0) /
    Math.max(1, recentJobs.filter((j) => j.latencyMs).length);

  return (
    <div className="container py-8 max-w-5xl">
      <h1 className="text-2xl font-bold mb-6">Admin</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          ["Jobs", jobCount],
          ["Creators", creatorCount],
          ["Users", userCount],
          ["Avg latency", `${avgLatency.toFixed(0)}ms`],
        ].map(([label, value]) => (
          <Card key={String(label)}>
            <CardHeader className="pb-1"><CardTitle className="text-sm">{label}</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">{value}</div></CardContent>
          </Card>
        ))}
      </div>
      <h2 className="text-lg font-semibold mb-3">Recent jobs</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="text-muted-foreground border-b">
              <th className="py-2 text-left">URL</th>
              <th className="py-2 text-left">Status</th>
              <th className="py-2 text-right">Latency</th>
              <th className="py-2 text-right">Tokens</th>
              <th className="py-2 text-left">Created</th>
            </tr>
          </thead>
          <tbody>
            {recentJobs.map((j) => (
              <tr key={j.id} className="border-b">
                <td className="py-1.5 max-w-xs truncate">{j.url}</td>
                <td className="py-1.5">{j.status}</td>
                <td className="py-1.5 text-right">{j.latencyMs ? `${j.latencyMs}ms` : "—"}</td>
                <td className="py-1.5 text-right">{j.tokenCost ?? "—"}</td>
                <td className="py-1.5">{new Date(j.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
