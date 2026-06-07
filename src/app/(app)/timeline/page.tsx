import { getEntries } from "@/actions/entries";
import Link from "next/link";
import { format } from "date-fns";
import { getMood } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PenLine } from "lucide-react";

export default async function TimelinePage() {
  const { entries } = await getEntries({ limit: 100 });

  // Group by month
  const grouped = entries.reduce<Record<string, typeof entries>>((acc, entry) => {
    const key = format(new Date(entry.entryDate), "MMMM yyyy");
    if (!acc[key]) acc[key] = [];
    acc[key].push(entry);
    return acc;
  }, {});

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Timeline</h1>
        <Button asChild>
          <Link href="/journal/new">
            <PenLine className="w-4 h-4" /> New Entry
          </Link>
        </Button>
      </div>

      {entries.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <p className="text-[var(--muted-foreground)]">Your timeline is empty.</p>
            <Button asChild className="mt-4">
              <Link href="/journal/new">Write your first entry</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        Object.entries(grouped).map(([month, monthEntries]) => (
          <div key={month}>
            <h2 className="text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-4 sticky top-0 bg-[var(--background)] py-1">
              {month}
            </h2>
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 top-0 bottom-0 w-px bg-[var(--border)]" />
              <div className="space-y-4 pl-10">
                {monthEntries.map((entry) => {
                  const mood = getMood(entry.mood);
                  return (
                    <div key={entry.id} className="relative">
                      {/* Dot */}
                      <div
                        className="absolute -left-6 top-4 w-3 h-3 rounded-full border-2 border-[var(--card)] bg-[var(--accent)]"
                        style={{ left: "-1.6rem" }}
                      />
                      <Link href={`/journal/${entry.id}`}>
                        <Card className="hover:shadow-md transition-all hover:border-[var(--accent)] cursor-pointer">
                          <CardContent className="py-4 px-5">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  {mood && <span className="text-base">{mood.emoji}</span>}
                                  <h3 className="font-semibold text-[var(--foreground)] truncate">{entry.title}</h3>
                                </div>
                                <p className="text-sm text-[var(--muted-foreground)] line-clamp-2">
                                  {entry.content.replace(/<[^>]*>/g, "").slice(0, 150)}
                                </p>
                                {entry.tags.length > 0 && (
                                  <div className="flex gap-1.5 mt-2 flex-wrap">
                                    {entry.tags.map(({ tag }) => (
                                      <Badge
                                        key={tag.id}
                                        style={{ backgroundColor: tag.color + "33", color: tag.color }}
                                        className="text-xs"
                                      >
                                        {tag.name}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <p className="text-xs text-[var(--muted-foreground)] shrink-0">
                                {format(new Date(entry.entryDate), "MMM d")}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
