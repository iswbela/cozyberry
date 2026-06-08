"use client";

import Link from "next/link";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen } from "lucide-react";
import { getMood } from "@/lib/utils";
import { useLang } from "@/providers/language-provider";
import type { JournalEntryWithTags } from "@/types";

export function RecentEntries({ entries }: { entries: JournalEntryWithTags[] }) {
  const { t } = useLang();
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">{t.dashboard.recentEntries}</h2>
        <Button asChild variant="ghost" size="sm">
          <Link href="/journal">{t.dashboard.viewAll}</Link>
        </Button>
      </div>
      {entries.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <BookOpen className="w-12 h-12 text-[var(--muted-foreground)] mx-auto mb-3 opacity-50" />
            <p className="text-[var(--muted-foreground)]">{t.dashboard.noEntries}</p>
            <Button asChild className="mt-4">
              <Link href="/journal/new">{t.dashboard.writeFirst}</Link>
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
  );
}
