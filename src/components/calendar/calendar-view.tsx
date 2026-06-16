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
import type { JournalEntryWithTags, WeightEntry, GymSession, CryEntryWithJournal } from "@/types";
import type { Reminder } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Bell, Scale, Dumbbell, Droplets } from "lucide-react";
import Link from "next/link";

const FOCUS_KEYS = ["chest", "back", "legs", "shoulders", "arms", "fullBody", "cardio", "other"] as const;
const LOAD_KEYS = ["light", "normal", "heavy", "veryHeavy"] as const;

export function CalendarView({
  entries,
  reminders,
  weightEntries,
  gymSessions,
  cryEntries,
}: {
  entries: JournalEntryWithTags[];
  reminders: Reminder[];
  weightEntries: WeightEntry[];
  gymSessions: GymSession[];
  cryEntries: CryEntryWithJournal[];
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

  const getEntriesForDay  = (day: Date) => entries.filter((e) => isSameDay(new Date(e.entryDate), day));
  const getRemindersForDay = (day: Date) => reminders.filter((r) => isSameDay(new Date(r.eventDate), day));
  const getGymForDay      = (day: Date) => gymSessions.find((s) => isSameDay(new Date(s.date), day));
  const getCryForDay      = (day: Date) => cryEntries.find((c) => isSameDay(new Date(c.date), day));
  const getWeightForDay   = (day: Date) => weightEntries.find((w) => isSameDay(new Date(w.date), day));

  const selectedEntries   = selectedDay ? getEntriesForDay(selectedDay)   : [];
  const selectedReminders = selectedDay ? getRemindersForDay(selectedDay) : [];
  const selectedGym       = selectedDay ? getGymForDay(selectedDay)       : undefined;
  const selectedCry       = selectedDay ? getCryForDay(selectedDay)       : undefined;
  const selectedWeight    = selectedDay ? getWeightForDay(selectedDay)    : undefined;

  const h = t.health;

  const hasAnyContent =
    selectedEntries.length > 0 ||
    selectedReminders.length > 0 ||
    !!selectedGym ||
    !!selectedCry ||
    !!selectedWeight;

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
                const dayEntries   = getEntriesForDay(day);
                const dayReminders = getRemindersForDay(day);
                const dayGym       = getGymForDay(day);
                const dayCry       = getCryForDay(day);
                const hasEntries   = dayEntries.length > 0;
                const hasReminders = dayReminders.length > 0;
                const isCurrentMonth = isSameMonth(day, currentDate);
                const isSelected     = selectedDay ? isSameDay(day, selectedDay) : false;
                const isToday        = dateFnsIsToday(day);
                const hasDots        = hasEntries || hasReminders || !!dayGym || !!dayCry;

                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => setSelectedDay(isSelected ? null : day)}
                    className={[
                      "aspect-square flex flex-col items-center justify-center rounded-xl text-sm transition-all",
                      !isCurrentMonth ? "opacity-30" : "",
                      isSelected ? "bg-[var(--primary)] text-[var(--primary-foreground)] font-bold" : "",
                      isToday && !isSelected ? "ring-2 ring-[var(--accent)] font-bold" : "",
                      hasEntries && !isSelected ? "bg-[var(--primary)]/20" : "",
                      !isSelected && isCurrentMonth ? "hover:bg-[var(--muted)]" : "",
                    ].join(" ")}
                  >
                    {format(day, "d")}
                    {hasDots && (
                      <div className="flex gap-0.5 mt-0.5 flex-wrap justify-center max-w-[28px]">
                        {hasEntries && (
                          <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-white" : "bg-[var(--accent)]"}`} />
                        )}
                        {hasReminders && (
                          <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-white/70" : "bg-orange-400"}`} />
                        )}
                        {dayGym && (
                          <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-white/70" : "bg-green-500"}`} />
                        )}
                        {dayCry && (
                          <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-white/70" : "bg-blue-400"}`} />
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            {/* Legend */}
            <div className="flex flex-wrap gap-3 mt-4 pt-3 border-t border-[var(--border)]">
              <span className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
                <span className="w-2 h-2 rounded-full bg-[var(--accent)] inline-block" /> {t.journal.title}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
                <span className="w-2 h-2 rounded-full bg-orange-400 inline-block" /> {t.nav.reminders}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
                <span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> {h.tabGym}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
                <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" /> {h.tabCry}
              </span>
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

              {/* Weight */}
              {selectedWeight && (
                <Card className="border-purple-200 bg-purple-50 dark:bg-purple-950/20 dark:border-purple-900">
                  <CardContent className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Scale className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                      <p className="font-medium text-sm">{selectedWeight.weightKg} kg</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Gym */}
              {selectedGym && (
                <Card className="border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-900">
                  <CardContent className="py-3 px-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Dumbbell className="w-3.5 h-3.5 text-green-600 shrink-0" />
                      <p className="font-medium text-sm">
                        {selectedGym.focus
                          ? (h.gymFocusOptions[selectedGym.focus as typeof FOCUS_KEYS[number]] ?? selectedGym.focus)
                          : h.tabGym}
                      </p>
                      {selectedGym.durationMin && (
                        <span className="text-xs text-[var(--muted-foreground)] ml-auto">{selectedGym.durationMin} min</span>
                      )}
                    </div>
                    {(selectedGym.energyBefore !== null || selectedGym.energyAfter !== null) && (
                      <div className="flex gap-3 ml-5">
                        {selectedGym.energyBefore !== null && (
                          <span className="text-xs text-[var(--muted-foreground)]">
                            {h.gymEnergyBefore}: {"⭐".repeat(selectedGym.energyBefore)}
                          </span>
                        )}
                        {selectedGym.energyAfter !== null && (
                          <span className="text-xs text-[var(--muted-foreground)]">
                            {h.gymEnergyAfter}: {"⭐".repeat(selectedGym.energyAfter)}
                          </span>
                        )}
                      </div>
                    )}
                    {selectedGym.perceivedLoad && (
                      <p className="text-xs text-[var(--muted-foreground)] mt-0.5 ml-5">
                        {h.gymLoadOptions[selectedGym.perceivedLoad as typeof LOAD_KEYS[number]] ?? selectedGym.perceivedLoad}
                      </p>
                    )}
                    {selectedGym.notes && (
                      <p className="text-xs text-[var(--muted-foreground)] mt-1 line-clamp-2 ml-5">{selectedGym.notes}</p>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Cry */}
              {selectedCry && (
                <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-900">
                  <CardContent className="py-3 px-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Droplets className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <p className="font-medium text-sm">
                        {selectedCry.times !== null
                          ? `${selectedCry.times} ${selectedCry.times === 1 ? h.cryTimes1 : h.cryTimesN}`
                          : h.tabCry}
                      </p>
                      {selectedCry.durationMin && (
                        <span className="text-xs text-[var(--muted-foreground)] ml-auto">{selectedCry.durationMin} min</span>
                      )}
                    </div>
                    {selectedCry.reason && (
                      <p className="text-xs text-[var(--muted-foreground)] mt-1 line-clamp-2 ml-5">
                        {selectedCry.reason}
                      </p>
                    )}
                    {selectedCry.journalEntry && (
                      <Link
                        href={`/journal/${selectedCry.journalEntry.id}`}
                        className="text-xs text-[var(--accent)] mt-1 ml-5 hover:underline block"
                      >
                        📓 {selectedCry.journalEntry.title}
                      </Link>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Reminders */}
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

              {/* Journal entries */}
              {!hasAnyContent ? (
                <Card className="border-dashed">
                  <CardContent className="py-8 text-center">
                    <p className="text-[var(--muted-foreground)] text-sm">{t.calendar.noEntries}</p>
                    <Button asChild size="sm" className="mt-3">
                      <Link href="/journal/new">{t.calendar.writeOne}</Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : selectedEntries.length > 0 ? (
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
              ) : null}
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
