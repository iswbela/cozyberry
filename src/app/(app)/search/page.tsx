import { SearchView } from "@/components/search/search-view";
import { getEntries } from "@/actions/entries";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const { entries } = await getEntries({ search: q, limit: 50 });

  return <SearchView initialQuery={q ?? ""} initialEntries={entries} />;
}
