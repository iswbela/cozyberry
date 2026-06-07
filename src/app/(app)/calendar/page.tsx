import { getEntries } from "@/actions/entries";
import { CalendarView } from "@/components/calendar/calendar-view";

export default async function CalendarPage() {
  const { entries } = await getEntries({ limit: 500 });
  return <CalendarView entries={entries} />;
}
