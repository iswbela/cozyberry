"use client";

import { useState } from "react";
import Link from "next/link";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
} from "date-fns";
import { getMood } from "@/lib/utils";
import type { JournalEntryWithTags } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight } from "lucide-react";

const DAY_HEADERS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function CalendarView({ entries }: { entries: JournalEntryWithTags[] }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calStart = startOfWeek(monthStart);
  const calEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  const getEntriesForDay = (day: Date) =>
    entries.filter((e) => isSameDay(new Date(e.entryDate), day));

  const selectedEntries = selectedDay ? getEntriesForDay(selectedDay) : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Calendar</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setCurrentDate(subMonths(currentDate, 1))}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-lg font-semibold min-w-[160px] text-center">
            {format(currentDate, "MMMM yyyy")}
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
              {DAY_HEADERS.map((d) => (
                <div key={d} className="text-center text-xs font-medium text-[var(--muted-foreground)] py-2">
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {days.map((day) => {
                const dayEntries = getEntriesForDay(day);
                const hasEntries = dayEntries.length > 0;
                const isCurrentMonth = isSameMonth(day, currentDate);
                const isSelected = selectedDay && isSameDay(day, selectedDay);
                const isToday = isSameDay(day, new Date());

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
                    {hasEntries && (
                      <div className={`w-1.5 h-1.5 rounded-full mt-0.5 ${isSelected ? "bg-white" : "bg-[var(--accent)]"}`} />
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
              <h2 className="font-semibold text-[var(--foreground)]">
                {format(selectedDay, "EEEE, MMMM d")}
              </h2>
              {selectedEntries.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="py-8 text-center">
                    <p className="text-[var(--muted-foreground)] text-sm">No entries this day.</p>
                    <Button asChild size="sm" className="mt-3">
                      <Link href="/journal/new">Write one</Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
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
                <p className="text-[var(--muted-foreground)] text-sm">Click a day to see entries.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
