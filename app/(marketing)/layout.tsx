import Link from "next/link";
import { t } from "@/lib/i18n";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  const appName = process.env.NEXT_PUBLIC_APP_NAME ?? "InfluenceMatch";
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="font-bold text-lg tracking-tight">
            {appName}
          </Link>
          <nav className="flex items-center gap-6 text-sm">
            <Link href="/pricing" className="text-muted-foreground hover:text-foreground">{t.nav.pricing}</Link>
            <Link href="/search" className="font-medium hover:text-primary">{t.nav.search}</Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} {appName}
      </footer>
    </div>
  );
}
