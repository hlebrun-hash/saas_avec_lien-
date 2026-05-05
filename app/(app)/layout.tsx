import Link from "next/link";
import { t } from "@/lib/i18n";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const appName = process.env.NEXT_PUBLIC_APP_NAME ?? "InfluenceMatch";
  return (
    <div className="min-h-screen flex flex-col bg-canvas font-sans">
      <header className="sticky top-0 bg-canvas/80 backdrop-blur-md z-50 border-b border-accent">
        <div className="container flex h-20 items-center justify-between">
          <Link href="/" className="font-display text-2xl font-bold tracking-tight text-ink">{appName}</Link>
          <nav className="flex items-center gap-8 text-sm font-medium">
            <Link href="/search" className="text-body hover:text-sunset transition-colors">{t.nav.search}</Link>
            <Link href="/shortlists" className="text-body hover:text-sunset transition-colors">{t.nav.shortlists}</Link>
            <Link href="/settings" className="text-body hover:text-sunset transition-colors">{t.nav.settings}</Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 py-12">{children}</main>
    </div>
  );
}

