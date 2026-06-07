import { redirect } from "next/navigation";
import { getTags } from "@/actions/tags";
import { getEntries } from "@/actions/entries";
import { EntryForm } from "@/components/journal/entry-form";

export default async function NewEntryPage() {
  // Redirect to edit if today already has an entry
  const { entries } = await getEntries({ limit: 1 });
  const today = new Date();
  const todayEntry = entries.find((e) => {
    const d = new Date(e.entryDate);
    return (
      d.getFullYear() === today.getFullYear() &&
      d.getMonth() === today.getMonth() &&
      d.getDate() === today.getDate()
    );
  });

  if (todayEntry) {
    redirect(`/journal/${todayEntry.id}/edit`);
  }

  const tags = await getTags();
  return <EntryForm tags={tags} />;
}
