import { auth } from "@/lib/auth";
import { getEntries } from "@/actions/entries";
import { getStats } from "@/actions/stats";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { format } from "date-fns";
import { getMood } from "@/lib/utils";
import { BookOpen, Flame, PenLine, Calendar, Hash } from "lucide-react";
import { Greeting } from "@/components/dashboard/greeting";

export default async function DashboardPage() {
  const session = await auth();
  const [{ entries }, stats] = await Promise.all([
    getEntries({ limit: 5 }),
    getStats(),
  ]);

  const firstName = session?.user?.name?.split(" ")[0] ?? "friend";

  return (
    <div className="space-y-8">
      {/* Greeting Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <Greeting firstName={firstName} />
        <Button asChild>
          <Link href="/journal/new">
            <PenLine className="w-4 h-4" />
            New Entry
          </Link>
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-0 bg-[var(--primary)]/20">
          <CardContent className="pt-6 pb-4">
            <div className="flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-[var(--accent)]" />
              <div>
                <p className="text-2xl font-bold">{stats?.totalEntries ?? 0}</p>
                <p className="text-xs text-[var(--muted-foreground)]">Total Entries</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-[var(--secondary)]/40">
          <CardContent className="pt-6 pb-4">
            <div className="flex items-center gap-3">
              <Flame className="w-8 h-8 text-orange-400" />
              <div>
                <p className="text-2xl font-bold">{stats?.streak ?? 0}</p>
                <p className="text-xs text-[var(--muted-foreground)]">Day Streak</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-[var(--muted)]">
          <CardContent className="pt-6 pb-4">
            <div className="flex items-center gap-3">
              <Hash className="w-8 h-8 text-[var(--accent)]" />
              <div>
                <p className="text-2xl font-bold">{stats?.totalWords?.toLocaleString() ?? 0}</p>
                <p className="text-xs text-[var(--muted-foreground)]">Words Written</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-[var(--primary)]/10">
          <CardContent className="pt-6 pb-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-8 h-8 text-[var(--accent)]" />
              <div>
                <p className="text-2xl font-bold">{stats?.journalingDays ?? 0}</p>
                <p className="text-xs text-[var(--muted-foreground)]">Days Journaled</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3 flex-wrap">
        <Button asChild variant="secondary">
          <Link href="/journal/new">
            <PenLine className="w-4 h-4" /> Write an Entry
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/calendar">
            <Calendar className="w-4 h-4" /> View Calendar
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/letters">
            <span>✉️</span> Write to Future Me
          </Link>
        </Button>
      </div>

      {/* Recent Entries */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Recent Entries</h2>
          <Button asChild variant="ghost" size="sm">
            <Link href="/journal">View all</Link>
          </Button>
        </div>

        {entries.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <BookOpen className="w-12 h-12 text-[var(--muted-foreground)] mx-auto mb-3 opacity-50" />
              <p className="text-[var(--muted-foreground)]">No entries yet.</p>
              <Button asChild className="mt-4">
                <Link href="/journal/new">Write your first entry</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {entries.map((entry) => {
              const mood = getMood(entry.mood);
              return (
                <Link key={entry.id} href={`/journal/${entry.id}`}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer border hover:border-[var(--accent)]">
                    <CardContent className="py-4 px-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {mood && <span className="text-lg">{mood.emoji}</span>}
                            <h3 className="font-semibold text-[var(--foreground)] truncate">{entry.title}</h3>
                          </div>
                          <p className="text-sm text-[var(--muted-foreground)] line-clamp-2">
                            {entry.content.replace(/<[^>]*>/g, "").slice(0, 150)}
                          </p>
                          {entry.tags.length > 0 && (
                            <div className="flex gap-1.5 mt-2 flex-wrap">
                              {entry.tags.slice(0, 3).map(({ tag }) => (
                                <Badge key={tag.id} style={{ backgroundColor: tag.color + "33", color: tag.color }}>
                                  {tag.name}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-[var(--muted-foreground)] shrink-0 mt-1">
                          {format(new Date(entry.entryDate), "MMM d")}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
