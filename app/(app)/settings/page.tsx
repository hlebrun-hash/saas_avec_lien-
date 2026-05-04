import { getCurrentUser } from "@/lib/auth/current-user";
import { PLAN_LIMITS } from "@/lib/plans";
import { UpgradeButton } from "@/components/billing/UpgradeButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ checkout?: string }> }) {
  const user = await getCurrentUser();
  const params = await searchParams;
  const limits = PLAN_LIMITS[user?.plan ?? "FREE"];

  return (
    <div className="container py-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      {params.checkout === "success" && (
        <div className="mb-4 p-3 bg-green-50 text-green-800 rounded-md text-sm">
          Subscription activated. Welcome to {user?.plan}!
        </div>
      )}
      <Card>
        <CardHeader><CardTitle>Account</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div><span className="text-muted-foreground">Email</span> · {user?.email ?? "—"}</div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Plan</span>
            <Badge>{user?.plan ?? "FREE"}</Badge>
          </div>
          <div><span className="text-muted-foreground">Analyses used</span> · {user?.analysesUsed ?? 0}</div>
        </CardContent>
      </Card>
      <Card className="mt-4">
        <CardHeader><CardTitle>Plan limits</CardTitle></CardHeader>
        <CardContent className="text-sm space-y-2">
          <div>Monthly analyses: {limits.monthlyAnalyses === -1 ? "unlimited" : limits.monthlyAnalyses}</div>
          <div>Visible creators: {limits.visibleCreators === -1 ? "all" : `top ${limits.visibleCreators}`}</div>
          <div>CSV export: {limits.csvExport ? "yes" : "no"}</div>
          <div>Contact info: {limits.contactInfo ? "yes" : "no"}</div>
        </CardContent>
      </Card>
      {user?.plan === "FREE" && (
        <Card className="mt-4">
          <CardHeader><CardTitle>Upgrade</CardTitle></CardHeader>
          <CardContent className="flex gap-3">
            <UpgradeButton plan="PRO" label="Go Pro — $49/mo" />
            <UpgradeButton plan="AGENCY" label="Agency — $199/mo" />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
