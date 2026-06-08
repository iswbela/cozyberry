"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Flame, PenLine, Calendar, Hash } from "lucide-react";
import { useLang } from "@/providers/language-provider";

interface DashboardStatsProps {
  totalEntries: number;
  streak: number;
  totalWords: number;
  journalingDays: number;
}

export function DashboardStats({ totalEntries, streak, totalWords, journalingDays }: DashboardStatsProps) {
  const { t } = useLang();
  return (
    <>
      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-0 bg-[var(--primary)]/20">
          <CardContent className="pt-6 pb-4">
            <div className="flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-[var(--accent)]" />
              <div>
                <p className="text-2xl font-bold">{totalEntries}</p>
                <p className="text-xs text-[var(--muted-foreground)]">{t.dashboard.totalEntries}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-[var(--secondary)]/40">
          <CardContent className="pt-6 pb-4">
            <div className="flex items-center gap-3">
              <Flame className="w-8 h-8 text-orange-400" />
              <div>
                <p className="text-2xl font-bold">{streak}</p>
                <p className="text-xs text-[var(--muted-foreground)]">{t.dashboard.dayStreak}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-[var(--muted)]">
          <CardContent className="pt-6 pb-4">
            <div className="flex items-center gap-3">
              <Hash className="w-8 h-8 text-[var(--accent)]" />
              <div>
                <p className="text-2xl font-bold">{totalWords.toLocaleString()}</p>
                <p className="text-xs text-[var(--muted-foreground)]">{t.dashboard.wordsWritten}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-[var(--primary)]/10">
          <CardContent className="pt-6 pb-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-8 h-8 text-[var(--accent)]" />
              <div>
                <p className="text-2xl font-bold">{journalingDays}</p>
                <p className="text-xs text-[var(--muted-foreground)]">{t.dashboard.daysJournaled}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3 flex-wrap">
        <Button asChild variant="secondary">
          <Link href="/journal/new">
            <PenLine className="w-4 h-4" /> {t.dashboard.writeEntry}
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/calendar">
            <Calendar className="w-4 h-4" /> {t.dashboard.viewCalendar}
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/letters">
            <span>✉️</span> {t.dashboard.writeToFuture}
          </Link>
        </Button>
      </div>
    </>
  );
}
