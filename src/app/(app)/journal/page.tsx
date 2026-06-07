import { getEntries } from "@/actions/entries";
import { getTags } from "@/actions/tags";
import { JournalList } from "@/components/journal/journal-list";

export default async function JournalPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; mood?: string; tagId?: string }>;
}) {
  const params = await searchParams;
  const [{ entries }, tags] = await Promise.all([
    getEntries({
      search: params.search,
      mood: params.mood,
      tagId: params.tagId,
    }),
    getTags(),
  ]);

  return <JournalList initialEntries={entries} tags={tags} />;
}
