import { getEntries } from "@/actions/entries";
import { TimelineView } from "@/components/timeline/timeline-view";

export default async function TimelinePage() {
  const { entries } = await getEntries({ limit: 100 });
  return <TimelineView entries={entries} />;
}
