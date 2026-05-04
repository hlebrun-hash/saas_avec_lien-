import Link from "next/link";
import { t } from "@/lib/i18n";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const appName = process.env.NEXT_PUBLIC_APP_NAME ?? "InfluenceMatch";
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b sticky top-0 bg-background/80 backdrop-blur z-10">
        <div className="container flex h-14 items-center justify-between">
          <Link href="/" className="font-bold tracking-tight">{appName}</Link>
          <nav className="flex items-center gap-6 text-sm">
            <Link href="/search" className="hover:text-primary">{t.nav.search}</Link>
            <Link href="/shortlists" className="hover:text-primary">{t.nav.shortlists}</Link>
            <Link href="/settings" className="hover:text-primary">{t.nav.settings}</Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
