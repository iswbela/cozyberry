"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getMood } from "@/lib/utils";
import { useLang } from "@/providers/language-provider";
import { BookOpen, Calendar, Flame, Hash, TrendingUp, Dumbbell, Droplets } from "lucide-react";

const FOCUS_KEYS = ["chest", "back", "legs", "shoulders", "arms", "fullBody", "cardio", "other"] as const;

interface StatsData {
  totalEntries: number;
  journalingDays: number;
  mostCommonMood: string | null;
  totalWords: number;
  streak: number;
  monthly: { month: string; count: number }[];
  moodDistribution: Record<string, number>;
  totalGymSessions: number;
  avgGymDuration: number | null;
  mostCommonFocus: string | null;
  gymFocusDistribution: Record<string, number>;
  gymMonthly: { month: string; count: number }[];
  avgEnergyBefore: number | null;
  avgEnergyAfter: number | null;
  totalCryEntries: number;
  cryMonthly: { month: string; count: number }[];
}

const JOURNAL_COLORS = ["#F8C8DC", "#E8A7C0", "#E8DFF5", "#A8C5E0", "#6BCB77", "#FFD93D"];
const GYM_COLORS = ["#6BCB77", "#4CAF50", "#81C784", "#A5D6A7", "#C8E6C9", "#388E3C", "#2E7D32", "#1B5E20"];

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-lg font-semibold text-[var(--foreground)] flex items-center gap-2 pt-2 border-t border-[var(--border)]">
      {children}
    </h2>
  );
}

export function StatsView({ stats }: { stats: StatsData | null }) {
  const { t } = useLang();
  const s = t.stats;
  const h = t.health;

  if (!stats) {
    return <div className="text-center py-20 text-[var(--muted-foreground)]">{s.noData}</div>;
  }

  const mostCommonMoodData = getMood(stats.mostCommonMood);
  const moodChartData = Object.entries(stats.moodDistribution).map(([key, value]) => {
    const mood = getMood(key);
    return { name: mood ? `${mood.emoji} ${mood.label}` : key, value };
  });

  const gymFocusChartData = Object.entries(stats.gymFocusDistribution).map(([key, value]) => ({
    name: h.gymFocusOptions[key as typeof FOCUS_KEYS[number]] ?? key,
    value,
  }));

  const mostCommonFocusLabel = stats.mostCommonFocus
    ? (h.gymFocusOptions[stats.mostCommonFocus as typeof FOCUS_KEYS[number]] ?? stats.mostCommonFocus)
    : "\u2014";

  const tooltipStyle = {
    background: "var(--card)",
    border: "1px solid var(--border)",
    borderRadius: "0.75rem",
    fontSize: "0.8rem",
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">{s.title}</h1>

      {/* Journal */}
      <SectionTitle><BookOpen className="w-5 h-5 text-[var(--accent)]" /> {t.journal.title}</SectionTitle>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card className="border-0 bg-[var(--primary)]/20">
          <CardContent className="pt-5 pb-4 text-center">
            <BookOpen className="w-6 h-6 text-[var(--accent)] mx-auto mb-2" />
            <p className="text-2xl font-bold">{stats.totalEntries}</p>
            <p className="text-xs text-[var(--muted-foreground)]">{s.totalEntries}</p>
          </CardContent>
        </Card>
        <Card className="border-0 bg-[var(--secondary)]/40">
          <CardContent className="pt-5 pb-4 text-center">
            <Calendar className="w-6 h-6 text-[var(--accent)] mx-auto mb-2" />
            <p className="text-2xl font-bold">{stats.journalingDays}</p>
            <p className="text-xs text-[var(--muted-foreground)]">{s.daysJournaled}</p>
          </CardContent>
        </Card>
        <Card className="border-0 bg-orange-50 dark:bg-orange-900/20">
          <CardContent className="pt-5 pb-4 text-center">
            <Flame className="w-6 h-6 text-orange-400 mx-auto mb-2" />
            <p className="text-2xl font-bold">{stats.streak}</p>
            <p className="text-xs text-[var(--muted-foreground)]">{s.dayStreak}</p>
          </CardContent>
        </Card>
        <Card className="border-0 bg-[var(--muted)]">
          <CardContent className="pt-5 pb-4 text-center">
            <Hash className="w-6 h-6 text-[var(--accent)] mx-auto mb-2" />
            <p className="text-2xl font-bold">{stats.totalWords.toLocaleString()}</p>
            <p className="text-xs text-[var(--muted-foreground)]">{s.wordsWritten}</p>
          </CardContent>
        </Card>
        <Card className="border-0 bg-[var(--primary)]/10">
          <CardContent className="pt-5 pb-4 text-center">
            {mostCommonMoodData ? (
              <>
                <span className="text-2xl mx-auto block mb-1">{mostCommonMoodData.emoji}</span>
                <p className="text-sm font-semibold">{mostCommonMoodData.label}</p>
                <p className="text-xs text-[var(--muted-foreground)]">{s.topMood}</p>
              </>
            ) : (
              <>
                <TrendingUp className="w-6 h-6 text-[var(--accent)] mx-auto mb-2" />
                <p className="text-sm font-semibold">\u2014</p>
                <p className="text-xs text-[var(--muted-foreground)]">{s.topMood}</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">{s.monthlyActivity}</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stats.monthly} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} />
                <YAxis tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="count" fill="var(--primary)" radius={[6, 6, 0, 0]} name={s.entries} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">{s.moodDistribution}</CardTitle></CardHeader>
          <CardContent>
            {moodChartData.length === 0 ? (
              <div className="h-[220px] flex items-center justify-center text-[var(--muted-foreground)] text-sm">
                {s.noMoodData}
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={moodChartData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} dataKey="value">
                    {moodChartData.map((_, i) => (
                      <Cell key={i} fill={JOURNAL_COLORS[i % JOURNAL_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            )}
            {moodChartData.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {moodChartData.map((item, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: JOURNAL_COLORS[i % JOURNAL_COLORS.length] }} />
                    {item.name} ({item.value})
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Gym */}
      <SectionTitle><Dumbbell className="w-5 h-5 text-green-500" /> {s.gymSection}</SectionTitle>

      {stats.totalGymSessions === 0 ? (
        <p className="text-[var(--muted-foreground)] text-sm">{s.noGymData}</p>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="border-0 bg-green-50 dark:bg-green-900/20">
              <CardContent className="pt-5 pb-4 text-center">
                <Dumbbell className="w-6 h-6 text-green-500 mx-auto mb-2" />
                <p className="text-2xl font-bold">{stats.totalGymSessions}</p>
                <p className="text-xs text-[var(--muted-foreground)]">{s.gymSessions}</p>
              </CardContent>
            </Card>
            <Card className="border-0 bg-green-50/60 dark:bg-green-900/10">
              <CardContent className="pt-5 pb-4 text-center">
                <p className="text-2xl font-bold">
                  {stats.avgGymDuration !== null ? stats.avgGymDuration : "\u2014"}
                </p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  {s.avgGymDuration}{stats.avgGymDuration !== null ? ` (${s.minutes})` : ""}
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 bg-green-50/60 dark:bg-green-900/10">
              <CardContent className="pt-5 pb-4 text-center">
                <p className="text-lg font-bold leading-tight mt-2">{mostCommonFocusLabel}</p>
                <p className="text-xs text-[var(--muted-foreground)] mt-1">{s.mostCommonFocus}</p>
              </CardContent>
            </Card>
            <Card className="border-0 bg-green-50/60 dark:bg-green-900/10">
              <CardContent className="pt-5 pb-4 text-center">
                <p className="text-xl font-bold">
                  {stats.avgEnergyBefore !== null ? stats.avgEnergyBefore : "\u2014"}
                  {stats.avgEnergyAfter !== null ? ` \u2192 ${stats.avgEnergyAfter}` : ""}
                </p>
                <p className="text-xs text-[var(--muted-foreground)]">{s.avgEnergyBefore} / {s.avgEnergyAfter}</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle className="text-base">{s.gymMonthly}</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={stats.gymMonthly} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} />
                    <YAxis tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} allowDecimals={false} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="count" fill="#6BCB77" radius={[6, 6, 0, 0]} name={s.gymSessions} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {gymFocusChartData.length > 0 && (
              <Card>
                <CardHeader><CardTitle className="text-base">{s.gymFocusDistribution}</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={gymFocusChartData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} dataKey="value">
                        {gymFocusChartData.map((_, i) => (
                          <Cell key={i} fill={GYM_COLORS[i % GYM_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {gymFocusChartData.map((item, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: GYM_COLORS[i % GYM_COLORS.length] }} />
                        {item.name} ({item.value})
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </>
      )}

      {/* Emotional */}
      <SectionTitle><Droplets className="w-5 h-5 text-blue-400" /> {s.wellbeingSection}</SectionTitle>

      {stats.totalCryEntries === 0 ? (
        <p className="text-[var(--muted-foreground)] text-sm">{s.noCryData}</p>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Card className="border-0 bg-blue-50 dark:bg-blue-900/20">
              <CardContent className="pt-5 pb-4 text-center">
                <Droplets className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                <p className="text-2xl font-bold">{stats.totalCryEntries}</p>
                <p className="text-xs text-[var(--muted-foreground)]">{s.cryEntries}</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader><CardTitle className="text-base">{s.cryMonthly}</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={stats.cryMonthly} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} />
                  <YAxis tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} allowDecimals={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#60a5fa"
                    strokeWidth={2}
                    dot={{ r: 4, fill: "#60a5fa" }}
                    activeDot={{ r: 6 }}
                    name={s.cryEntries}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
