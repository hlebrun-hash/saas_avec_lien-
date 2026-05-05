import Link from "next/link";
import { t } from "@/lib/i18n";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  const appName = process.env.NEXT_PUBLIC_APP_NAME ?? "InfluenceMatch";
  return (
    <div className="min-h-screen flex flex-col bg-canvas font-sans">
      <header className="sticky top-0 bg-canvas/80 backdrop-blur-md z-50 border-b border-accent">
        <div className="container flex h-20 items-center justify-between">
          <Link href="/" className="font-display text-2xl font-bold tracking-tight text-ink">
            {appName}
          </Link>
          <nav className="flex items-center gap-8 text-sm font-medium">
            <Link href="/pricing" className="text-body hover:text-sunset transition-colors">{t.nav.pricing}</Link>
            <Link href="/search" className="px-5 py-2 bg-sunset text-white rounded-sm hover:scale-105 transition-transform">{t.nav.search}</Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-accent py-12 text-center text-sm text-muted font-medium">
        © {new Date().getFullYear()} {appName}
      </footer>
    </div>

  );
}
