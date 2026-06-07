"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns";

export async function getStats() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const userId = session.user.id;

  const [totalEntries, entries] = await Promise.all([
    prisma.journalEntry.count({ where: { userId } }),
    prisma.journalEntry.findMany({
      where: { userId },
      select: { entryDate: true, content: true, mood: true },
      orderBy: { entryDate: "asc" },
    }),
  ]);

  const uniqueDays = new Set(entries.map((e) => format(e.entryDate, "yyyy-MM-dd"))).size;

  const moodCounts: Record<string, number> = {};
  entries.forEach((e) => {
    if (e.mood) moodCounts[e.mood] = (moodCounts[e.mood] ?? 0) + 1;
  });
  const mostCommonMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  const totalWords = entries.reduce((sum, e) => {
    const text = e.content.replace(/<[^>]*>/g, "");
    return sum + text.split(/\s+/).filter(Boolean).length;
  }, 0);

  const today = new Date();
  let streak = 0;
  const dateSet = new Set(entries.map((e) => format(e.entryDate, "yyyy-MM-dd")));
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    if (dateSet.has(format(d, "yyyy-MM-dd"))) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }

  const monthly = [];
  for (let i = 5; i >= 0; i--) {
    const date = subMonths(today, i);
    const count = await prisma.journalEntry.count({
      where: {
        userId,
        entryDate: { gte: startOfMonth(date), lte: endOfMonth(date) },
      },
    });
    monthly.push({ month: format(date, "MMM"), count });
  }

  return {
    totalEntries,
    journalingDays: uniqueDays,
    mostCommonMood,
    totalWords,
    streak,
    monthly,
    moodDistribution: moodCounts,
  };
}
