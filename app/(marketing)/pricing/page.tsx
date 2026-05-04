import { t } from "@/lib/i18n";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { UpgradeButton } from "@/components/billing/UpgradeButton";

export default function PricingPage() {
  return (
    <div className="container max-w-5xl py-16">
      <h1 className="text-3xl md:text-4xl font-bold text-center">{t.pricing.title}</h1>
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>{t.pricing.free}</CardTitle>
            <CardDescription>$0 / month</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{t.pricing.freeBlurb}</p>
          </CardContent>
        </Card>
        <Card className="border-primary">
          <CardHeader>
            <CardTitle>{t.pricing.pro}</CardTitle>
            <CardDescription>$49 / month</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{t.pricing.proBlurb}</p>
          </CardContent>
          <CardFooter>
            <UpgradeButton plan="PRO" label={t.pricing.upgrade} />
          </CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t.pricing.agency}</CardTitle>
            <CardDescription>$199 / month</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{t.pricing.agencyBlurb}</p>
          </CardContent>
          <CardFooter>
            <UpgradeButton plan="AGENCY" label={t.pricing.upgrade} />
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
