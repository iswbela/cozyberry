import { getReminders } from "@/actions/reminders";
import { RemindersView } from "@/components/reminders/reminders-view";

export default async function RemindersPage() {
  const { reminders } = await getReminders();
  return <RemindersView initialReminders={reminders ?? []} />;
}
