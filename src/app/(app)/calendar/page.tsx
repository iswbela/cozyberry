import { getEntries } from "@/actions/entries";
import { getReminders } from "@/actions/reminders";
import { CalendarView } from "@/components/calendar/calendar-view";

export default async function CalendarPage() {
  const [{ entries }, { reminders }] = await Promise.all([
    getEntries({ limit: 500 }),
    getReminders(),
  ]);
  return <CalendarView entries={entries} reminders={reminders ?? []} />;
}
