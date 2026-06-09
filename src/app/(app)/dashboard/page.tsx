import { auth } from "@/lib/auth";
import { getEntries } from "@/actions/entries";
import { getStats } from "@/actions/stats";
import { getReminders } from "@/actions/reminders";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PenLine } from "lucide-react";
import { Greeting } from "@/components/dashboard/greeting";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { RecentEntries } from "@/components/dashboard/recent-entries";
import { UpcomingEvents } from "@/components/dashboard/upcoming-events";

export default async function DashboardPage() {
  const session = await auth();
  const [{ entries }, stats, { reminders }] = await Promise.all([
    getEntries({ limit: 5 }),
    getStats(),
    getReminders({ upcoming: true }),
  ]);

  const firstName = session?.user?.name?.split(" ")[0] ?? "friend";

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <Greeting firstName={firstName} />
        <Button asChild>
          <Link href="/journal/new">
            <PenLine className="w-4 h-4" />
            New Entry
          </Link>
        </Button>
      </div>

      <DashboardStats
        totalEntries={stats?.totalEntries ?? 0}
        streak={stats?.streak ?? 0}
        totalWords={stats?.totalWords ?? 0}
        journalingDays={stats?.journalingDays ?? 0}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentEntries entries={entries} />
        </div>
        <div>
          <UpcomingEvents reminders={reminders ?? []} />
        </div>
      </div>
    </div>
  );
}
