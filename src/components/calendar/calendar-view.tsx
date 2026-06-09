"use client";

import { useState } from "react";
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek,
  isToday as dateFnsIsToday,
} from "date-fns";
import { ptBR, enUS } from "date-fns/locale";
import { getMood } from "@/lib/utils";
import { useLang } from "@/providers/language-provider";
import type { JournalEntryWithTags } from "@/types";
import type { Reminder } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Bell } from "lucide-react";
import Link from "next/link";

export function CalendarView({
  entries,
  reminders,
}: {
  entries: JournalEntryWithTags[];
  reminders: Reminder[];
}) {
  const { t, lang } = useLang();
  const locale = lang === "pt" ? ptBR : enUS;
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calStart = startOfWeek(monthStart);
  const calEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  const getEntriesForDay = (day: Date) =>
    entries.filter((e) => isSameDay(new Date(e.entryDate), day));

  const getRemindersForDay = (day: Date) =>
    reminders.filter((r) => isSameDay(new Date(r.eventDate), day));

  const selectedEntries = selectedDay ? getEntriesForDay(selectedDay) : [];
  const selectedReminders = selectedDay ? getRemindersForDay(selectedDay) : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold">{t.calendar.title}</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setCurrentDate(subMonths(currentDate, 1))}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-lg font-semibold min-w-[140px] text-center capitalize">
            {format(currentDate, "MMMM yyyy", { locale })}
          </span>
          <Button variant="outline" size="icon" onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* Calendar Grid */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-7 mb-2">
              {t.calendar.days.map((d) => (
                <div key={d} className="text-center text-xs font-medium text-[var(--muted-foreground)] py-2">
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {days.map((day) => {
                const dayEntries = getEntriesForDay(day);
                const dayReminders = getRemindersForDay(day);
                const hasEntries = dayEntries.length > 0;
                const hasReminders = dayReminders.length > 0;
                const isCurrentMonth = isSameMonth(day, currentDate);
                const isSelected = selectedDay && isSameDay(day, selectedDay);
                const isToday = dateFnsIsToday(day);

                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => setSelectedDay(isSelected ? null : day)}
                    className={`
                      aspect-square flex flex-col items-center justify-center rounded-xl text-sm relative transition-all
                      ${!isCurrentMonth ? "opacity-30" : ""}
                      ${isSelected ? "bg-[var(--primary)] text-[var(--primary-foreground)] font-bold" : ""}
                      ${isToday && !isSelected ? "ring-2 ring-[var(--accent)] font-bold" : ""}
                      ${hasEntries && !isSelected ? "bg-[var(--primary)]/20" : ""}
                      ${!isSelected && isCurrentMonth ? "hover:bg-[var(--muted)]" : ""}
                    `}
                  >
                    {format(day, "d")}
                    {(hasEntries || hasReminders) && (
                      <div className="flex gap-0.5 mt-0.5">
                        {hasEntries && (
                          <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-white" : "bg-[var(--accent)]"}`} />
                        )}
                        {hasReminders && (
                          <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-white/70" : "bg-orange-400"}`} />
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Day Detail */}
        <div className="space-y-3">
          {selectedDay ? (
            <>
              <h2 className="font-semibold text-[var(--foreground)] capitalize">
                {format(selectedDay, "EEEE, MMMM d", { locale })}
              </h2>

              {/* Reminders for the day */}
              {selectedReminders.map((reminder) => (
                <Card key={reminder.id} className="border-orange-200 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-900">
                  <CardContent className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Bell className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                      <p className="font-medium text-sm truncate">{reminder.title}</p>
                    </div>
                    {reminder.description && (
                      <p className="text-xs text-[var(--muted-foreground)] mt-1 line-clamp-2 ml-5">
                        {reminder.description}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}

              {/* Journal entries for the day */}
              {selectedEntries.length === 0 && selectedReminders.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="py-8 text-center">
                    <p className="text-[var(--muted-foreground)] text-sm">{t.calendar.noEntries}</p>
                    <Button asChild size="sm" className="mt-3">
                      <Link href="/journal/new">{t.calendar.writeOne}</Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : selectedEntries.length === 0 ? null : (
                selectedEntries.map((entry) => {
                  const mood = getMood(entry.mood);
                  return (
                    <Link key={entry.id} href={`/journal/${entry.id}`}>
                      <Card className="hover:shadow-md transition-shadow hover:border-[var(--accent)] cursor-pointer">
                        <CardContent className="py-3 px-4">
                          <div className="flex items-center gap-2 mb-1">
                            {mood && <span>{mood.emoji}</span>}
                            <p className="font-medium text-sm truncate">{entry.title}</p>
                          </div>
                          <p className="text-xs text-[var(--muted-foreground)] line-clamp-2">
                            {entry.content.replace(/<[^>]*>/g, "").slice(0, 100)}
                          </p>
                          {entry.tags.length > 0 && (
                            <div className="flex gap-1 mt-2 flex-wrap">
                              {entry.tags.map(({ tag }) => (
                                <Badge key={tag.id} style={{ backgroundColor: tag.color + "33", color: tag.color }} className="text-xs">
                                  {tag.name}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })
              )}
            </>
          ) : (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <p className="text-[var(--muted-foreground)] text-sm">{t.calendar.selectDay}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
