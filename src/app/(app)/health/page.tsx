import { getWeightEntries, getGymSessions, getCryEntries } from "@/actions/health";
import { getEntries } from "@/actions/entries";
import { HealthView } from "@/components/health/health-view";

export default async function HealthPage() {
  const [
    { entries: weightEntries },
    { sessions: gymSessions },
    { entries: cryEntries },
    { entries: journalEntries },
  ] = await Promise.all([
    getWeightEntries(),
    getGymSessions(),
    getCryEntries(),
    getEntries({ limit: 500 }),
  ]);

  return (
    <HealthView
      weightEntries={weightEntries}
      gymSessions={gymSessions ?? []}
      cryEntries={cryEntries}
      journalEntries={journalEntries}
    />
  );
}
