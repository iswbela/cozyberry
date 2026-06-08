"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getMood } from "@/lib/utils";
import { useLang } from "@/providers/language-provider";
import { BookOpen, Calendar, Flame, Hash, TrendingUp } from "lucide-react";

interface StatsData {
  totalEntries: number;
  journalingDays: number;
  mostCommonMood: string | null;
  totalWords: number;
  streak: number;
  monthly: { month: string; count: number }[];
  moodDistribution: Record<string, number>;
}

const CHART_COLORS = ["#F8C8DC", "#E8A7C0", "#E8DFF5", "#A8C5E0", "#6BCB77", "#FFD93D"];

export function StatsView({ stats }: { stats: StatsData | null }) {
  const { t } = useLang();

  if (!stats) {
    return <div className="text-center py-20 text-[var(--muted-foreground)]">{t.stats.noData}</div>;
  }

  const mostCommonMoodData = getMood(stats.mostCommonMood);
  const moodChartData = Object.entries(stats.moodDistribution).map(([key, value]) => {
    const mood = getMood(key);
    return { name: mood ? `${mood.emoji} ${mood.label}` : key, value };
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t.stats.title}</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card className="border-0 bg-[var(--primary)]/20">
          <CardContent className="pt-5 pb-4 text-center">
            <BookOpen className="w-6 h-6 text-[var(--accent)] mx-auto mb-2" />
            <p className="text-2xl font-bold">{stats.totalEntries}</p>
            <p className="text-xs text-[var(--muted-foreground)]">{t.stats.totalEntries}</p>
          </CardContent>
        </Card>
        <Card className="border-0 bg-[var(--secondary)]/40">
          <CardContent className="pt-5 pb-4 text-center">
            <Calendar className="w-6 h-6 text-[var(--accent)] mx-auto mb-2" />
            <p className="text-2xl font-bold">{stats.journalingDays}</p>
            <p className="text-xs text-[var(--muted-foreground)]">{t.stats.daysJournaled}</p>
          </CardContent>
        </Card>
        <Card className="border-0 bg-orange-50 dark:bg-orange-900/20">
          <CardContent className="pt-5 pb-4 text-center">
            <Flame className="w-6 h-6 text-orange-400 mx-auto mb-2" />
            <p className="text-2xl font-bold">{stats.streak}</p>
            <p className="text-xs text-[var(--muted-foreground)]">{t.stats.dayStreak}</p>
          </CardContent>
        </Card>
        <Card className="border-0 bg-[var(--muted)]">
          <CardContent className="pt-5 pb-4 text-center">
            <Hash className="w-6 h-6 text-[var(--accent)] mx-auto mb-2" />
            <p className="text-2xl font-bold">{stats.totalWords.toLocaleString()}</p>
            <p className="text-xs text-[var(--muted-foreground)]">{t.stats.wordsWritten}</p>
          </CardContent>
        </Card>
        <Card className="border-0 bg-[var(--primary)]/10">
          <CardContent className="pt-5 pb-4 text-center">
            {mostCommonMoodData ? (
              <>
                <span className="text-2xl mx-auto block mb-1">{mostCommonMoodData.emoji}</span>
                <p className="text-sm font-semibold">{mostCommonMoodData.label}</p>
                <p className="text-xs text-[var(--muted-foreground)]">{t.stats.topMood}</p>
              </>
            ) : (
              <>
                <TrendingUp className="w-6 h-6 text-[var(--accent)] mx-auto mb-2" />
                <p className="text-sm font-semibold">—</p>
                <p className="text-xs text-[var(--muted-foreground)]">{t.stats.topMood}</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">{t.stats.monthlyActivity}</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stats.monthly} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} />
                <YAxis tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "0.75rem", fontSize: "0.8rem" }} />
                <Bar dataKey="count" fill="var(--primary)" radius={[6, 6, 0, 0]} name={t.stats.entries} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">{t.stats.moodDistribution}</CardTitle></CardHeader>
          <CardContent>
            {moodChartData.length === 0 ? (
              <div className="h-[220px] flex items-center justify-center text-[var(--muted-foreground)] text-sm">
                {t.stats.noMoodData}
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={moodChartData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} dataKey="value">
                    {moodChartData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "0.75rem", fontSize: "0.8rem" }} />
                </PieChart>
              </ResponsiveContainer>
            )}
            {moodChartData.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {moodChartData.map((item, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                    {item.name} ({item.value})
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
