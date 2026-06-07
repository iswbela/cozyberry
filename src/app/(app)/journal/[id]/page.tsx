import { notFound } from "next/navigation";
import { getEntry } from "@/actions/entries";
import { EntryView } from "@/components/journal/entry-view";

export default async function EntryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const entry = await getEntry(id);
  if (!entry) notFound();
  return <EntryView entry={entry} />;
}
