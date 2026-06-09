"use client";

import type { Reminder } from "@prisma/client";
import { useLang } from "@/providers/language-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, Bell } from "lucide-react";
import { format, isToday, differenceInDays } from "date-fns";
import { ptBR, enUS } from "date-fns/locale";
import Link from "next/link";

export function UpcomingEvents({ reminders }: { reminders: Reminder[] }) {
  const { t, lang } = useLang();
  const locale = lang === "pt" ? ptBR : enUS;

  const getDaysLabel = (date: Date) => {
    if (isToday(date)) return t.reminders.today;
    const days = differenceInDays(date, new Date());
    if (days === 1) return t.reminders.tomorrow;
    return t.reminders.inDays.replace("{n}", String(days));
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Bell className="w-4 h-4 text-[var(--primary)]" />
          {t.reminders.upcomingEvents}
        </CardTitle>
        <Link
          href="/reminders"
          className="text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
        >
          {t.dashboard.viewAll}
        </Link>
      </CardHeader>
      <CardContent className="space-y-2">
        {reminders.length === 0 ? (
          <div className="text-center py-6 text-[var(--muted-foreground)]">
            <CalendarDays className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">{t.reminders.noUpcoming}</p>
            <Link
              href="/reminders"
              className="text-xs mt-1 inline-block text-[var(--primary)] hover:underline"
            >
              {t.reminders.addOne}
            </Link>
          </div>
        ) : (
          reminders.slice(0, 5).map((r) => (
            <div
              key={r.id}
              className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-[var(--muted)] transition-colors"
            >
              <div className="shrink-0 w-10 h-10 rounded-xl bg-[var(--primary)]/10 flex flex-col items-center justify-center text-[var(--primary)]">
                <span className="text-xs font-bold leading-none">
                  {format(new Date(r.eventDate), "dd")}
                </span>
                <span className="text-[10px] uppercase opacity-70">
                  {format(new Date(r.eventDate), "MMM", { locale })}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{r.title}</p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  {getDaysLabel(new Date(r.eventDate))}
                </p>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
