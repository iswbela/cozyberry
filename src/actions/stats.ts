"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

export async function getStats() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const userId = session.user.id;

  const [totalEntries, entries, gymSessions, cryEntries] = await Promise.all([
    prisma.journalEntry.count({ where: { userId } }),
    prisma.journalEntry.findMany({
      where: { userId },
      select: { entryDate: true, content: true, mood: true },
      orderBy: { entryDate: "asc" },
    }),
    db.gymSession.findMany({
      where: { userId },
      select: { date: true, durationMin: true, focus: true, energyBefore: true, energyAfter: true },
      orderBy: { date: "asc" },
    }),
    db.cryEntry.findMany({
      where: { userId },
      select: { date: true, times: true },
      orderBy: { date: "asc" },
    }),
  ]);

  // Journal stats
  const uniqueDays = new Set(
    (entries as { entryDate: Date }[]).map((e) => format(e.entryDate, "yyyy-MM-dd"))
  ).size;

  const moodCounts: Record<string, number> = {};
  (entries as { mood: string | null }[]).forEach((e) => {
    if (e.mood) moodCounts[e.mood] = (moodCounts[e.mood] ?? 0) + 1;
  });
  const mostCommonMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  const totalWords = (entries as { content: string }[]).reduce((sum, e) => {
    const text = e.content.replace(/<[^>]*>/g, "");
    return sum + text.split(/\s+/).filter(Boolean).length;
  }, 0);

  const today = new Date();
  let streak = 0;
  const dateSet = new Set(
    (entries as { entryDate: Date }[]).map((e) => format(e.entryDate, "yyyy-MM-dd"))
  );
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    if (dateSet.has(format(d, "yyyy-MM-dd"))) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }

  const monthly: { month: string; count: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const date = subMonths(today, i);
    const count = await prisma.journalEntry.count({
      where: { userId, entryDate: { gte: startOfMonth(date), lte: endOfMonth(date) } },
    });
    monthly.push({ month: format(date, "MMM"), count });
  }

  // Gym stats
  const gymArr = gymSessions as { date: Date; durationMin: number | null; focus: string | null; energyBefore: number | null; energyAfter: number | null }[];
  const totalGymSessions = gymArr.length;

  const withDuration = gymArr.filter((s) => s.durationMin !== null);
  const avgGymDuration: number | null =
    withDuration.length > 0
      ? Math.round(withDuration.reduce((sum, s) => sum + s.durationMin!, 0) / withDuration.length)
      : null;

  const focusCounts: Record<string, number> = {};
  gymArr.forEach((s) => {
    if (s.focus) focusCounts[s.focus] = (focusCounts[s.focus] ?? 0) + 1;
  });
  const mostCommonFocus: string | null =
    Object.entries(focusCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  const gymMonthly: { month: string; count: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const date = subMonths(today, i);
    const mStart = startOfMonth(date);
    const mEnd = endOfMonth(date);
    const count = gymArr.filter((s) => {
      const d = new Date(s.date);
      return d >= mStart && d <= mEnd;
    }).length;
    gymMonthly.push({ month: format(date, "MMM"), count });
  }

  const ebValues = gymArr.map((s) => s.energyBefore).filter((v): v is number => v !== null);
  const eaValues = gymArr.map((s) => s.energyAfter).filter((v): v is number => v !== null);
  const avgEnergyBefore: number | null =
    ebValues.length > 0
      ? Math.round((ebValues.reduce((a, b) => a + b, 0) / ebValues.length) * 10) / 10
      : null;
  const avgEnergyAfter: number | null =
    eaValues.length > 0
      ? Math.round((eaValues.reduce((a, b) => a + b, 0) / eaValues.length) * 10) / 10
      : null;

  // Cry stats
  const cryArr = cryEntries as { date: Date; times: number | null }[];
  const totalCryEntries = cryArr.length;

  const cryMonthly: { month: string; count: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const date = subMonths(today, i);
    const mStart = startOfMonth(date);
    const mEnd = endOfMonth(date);
    const count = cryArr.filter((c) => {
      const d = new Date(c.date);
      return d >= mStart && d <= mEnd;
    }).length;
    cryMonthly.push({ month: format(date, "MMM"), count });
  }

  return {
    totalEntries,
    journalingDays: uniqueDays,
    mostCommonMood,
    totalWords,
    streak,
    monthly,
    moodDistribution: moodCounts,
    totalGymSessions,
    avgGymDuration,
    mostCommonFocus,
    gymFocusDistribution: focusCounts,
    gymMonthly,
    avgEnergyBefore,
    avgEnergyAfter,
    totalCryEntries,
    cryMonthly,
  };
}
