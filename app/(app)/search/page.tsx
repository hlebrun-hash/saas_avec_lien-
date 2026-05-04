import { SearchClient } from "@/components/search/SearchClient";

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ url?: string }> }) {
  const params = await searchParams;
  return <SearchClient initialUrl={params.url ?? ""} />;
}
