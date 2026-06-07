import { notFound } from "next/navigation";
import { getEntry } from "@/actions/entries";
import { getTags } from "@/actions/tags";
import { EntryForm } from "@/components/journal/entry-form";

export default async function EditEntryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [entry, tags] = await Promise.all([getEntry(id), getTags()]);
  if (!entry) notFound();
  return <EntryForm entry={entry} tags={tags} />;
}
