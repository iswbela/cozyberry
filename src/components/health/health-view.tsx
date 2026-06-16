"use client";

import { useState, useTransition } from "react";
import { format, isSameDay } from "date-fns";
import { ptBR, enUS } from "date-fns/locale";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useLang } from "@/providers/language-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  upsertWeight,
  deleteWeight,
  upsertGymSession,
  deleteGymSession,
  upsertCryEntry,
  deleteCryEntry,
} from "@/actions/health";
import type { WeightEntry, GymSession, CryEntryWithJournal } from "@/types";
import type { JournalEntryWithTags } from "@/types";
import { Scale, Dumbbell, Droplets, Trash2, Plus, Star } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── EnergyPicker ──────────────────────────────────────────────────────────

function EnergyPicker({
  value,
  onChange,
  label,
}: {
  value: number | null;
  onChange: (v: number | null) => void;
  label: string;
}) {
  return (
    <div>
      <Label className="text-sm mb-1 block">{label}</Label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(value === n ? null : n)}
            className={cn(
              "p-1 rounded-lg transition-colors",
              value !== null && n <= value
                ? "text-yellow-400"
                : "text-[var(--muted-foreground)] hover:text-yellow-300"
            )}
          >
            <Star className="w-5 h-5 fill-current" />
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── DateInput ─────────────────────────────────────────────────────────────

function todayStr() {
  const now = new Date();
  return format(now, "yyyy-MM-dd");
}

// ─── WeightTab ─────────────────────────────────────────────────────────────

function WeightTab({ entries }: { entries: WeightEntry[] }) {
  const { t, lang } = useLang();
  const locale = lang === "pt" ? ptBR : enUS;
  const h = t.health;
  const [pending, startTransition] = useTransition();
  const [date, setDate] = useState(todayStr());
  const [weightKg, setWeightKg] = useState("");
  const [error, setError] = useState("");

  const sorted = [...entries].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  const chartData = sorted.map((e) => ({
    date: format(new Date(e.date), "dd/MM", { locale }),
    weight: e.weightKg,
  }));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const kg = parseFloat(weightKg.replace(",", "."));
    if (!date || isNaN(kg)) { setError("Preencha data e peso."); return; }
    setError("");
    startTransition(async () => {
      const res = await upsertWeight({ date, weightKg: kg });
      if (res.success) setWeightKg("");
    });
  }

  return (
    <div className="space-y-6">
      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{h.weightTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[130px]">
              <Label className="text-sm mb-1 block">{h.weightDate}</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="flex-1 min-w-[130px]">
              <Label className="text-sm mb-1 block">{h.weightKg}</Label>
              <Input
                type="text"
                inputMode="decimal"
                placeholder={h.weightKgPlaceholder}
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={pending} className="shrink-0">
              <Plus className="w-4 h-4 mr-1" />
              {pending ? h.saving : h.save}
            </Button>
          </form>
          {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
        </CardContent>
      </Card>

      {/* Chart */}
      {chartData.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{h.weightEvolution}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis
                  domain={["auto", "auto"]}
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v) => `${v}kg`}
                />
                <Tooltip formatter={(v) => [`${v} kg`, "Peso"]} />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="var(--accent)"
                  strokeWidth={2}
                  dot={{ r: 4, fill: "var(--accent)" }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* History */}
      <div>
        <h3 className="text-sm font-semibold text-[var(--muted-foreground)] mb-3 uppercase tracking-wide">
          {h.weightHistory}
        </h3>
        {entries.length === 0 ? (
          <p className="text-[var(--muted-foreground)] text-sm text-center py-8">{h.noWeightData}</p>
        ) : (
          <div className="space-y-2">
            {[...entries]
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((entry) => (
                <Card key={entry.id}>
                  <CardContent className="py-3 px-4 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <Scale className="w-4 h-4 text-[var(--accent)] shrink-0" />
                      <div>
                        <p className="font-semibold text-sm">{entry.weightKg} kg</p>
                        <p className="text-xs text-[var(--muted-foreground)]">
                          {format(new Date(entry.date), "PPP", { locale })}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        if (!confirm(h.confirmDelete)) return;
                        startTransition(() => { void deleteWeight(entry.id); });
                      }}
                      className="text-[var(--muted-foreground)] hover:text-red-500 transition-colors p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </CardContent>
                </Card>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── GymTab ────────────────────────────────────────────────────────────────

const FOCUS_KEYS = ["chest", "back", "legs", "shoulders", "arms", "fullBody", "cardio", "other"] as const;
const LOAD_KEYS = ["light", "normal", "heavy", "veryHeavy"] as const;

function GymTab({ sessions }: { sessions: GymSession[] }) {
  const { t, lang } = useLang();
  const locale = lang === "pt" ? ptBR : enUS;
  const h = t.health;
  const [pending, startTransition] = useTransition();
  const [date, setDate] = useState(todayStr());
  const [durationMin, setDurationMin] = useState("");
  const [focus, setFocus] = useState("");
  const [energyBefore, setEnergyBefore] = useState<number | null>(null);
  const [energyAfter, setEnergyAfter] = useState<number | null>(null);
  const [perceivedLoad, setPerceivedLoad] = useState("");
  const [notes, setNotes] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      await upsertGymSession({
        date,
        durationMin: durationMin ? parseInt(durationMin) : null,
        focus: focus || null,
        energyBefore,
        energyAfter,
        perceivedLoad: perceivedLoad || null,
        notes: notes || null,
      });
      setDurationMin("");
      setFocus("");
      setEnergyBefore(null);
      setEnergyAfter(null);
      setPerceivedLoad("");
      setNotes("");
    });
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{h.gymTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Date + Duration */}
            <div className="flex flex-wrap gap-3">
              <div className="flex-1 min-w-[130px]">
                <Label className="text-sm mb-1 block">{h.gymDate}</Label>
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
              <div className="flex-1 min-w-[130px]">
                <Label className="text-sm mb-1 block">{h.gymDuration}</Label>
                <Input
                  type="number"
                  min="1"
                  max="600"
                  placeholder={h.gymDurationPlaceholder}
                  value={durationMin}
                  onChange={(e) => setDurationMin(e.target.value)}
                />
              </div>
            </div>

            {/* Focus */}
            <div>
              <Label className="text-sm mb-1 block">{h.gymFocus}</Label>
              <div className="flex flex-wrap gap-2">
                {FOCUS_KEYS.map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setFocus(focus === key ? "" : key)}
                    className={cn(
                      "px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors",
                      focus === key
                        ? "bg-[var(--primary)] text-[var(--primary-foreground)] border-transparent"
                        : "border-[var(--border)] text-[var(--muted-foreground)] hover:bg-[var(--muted)]"
                    )}
                  >
                    {h.gymFocusOptions[key]}
                  </button>
                ))}
              </div>
            </div>

            {/* Energy */}
            <div className="flex flex-wrap gap-6">
              <EnergyPicker value={energyBefore} onChange={setEnergyBefore} label={h.gymEnergyBefore} />
              <EnergyPicker value={energyAfter} onChange={setEnergyAfter} label={h.gymEnergyAfter} />
            </div>

            {/* Perceived Load */}
            <div>
              <Label className="text-sm mb-1 block">{h.gymLoad}</Label>
              <div className="flex flex-wrap gap-2">
                {LOAD_KEYS.map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setPerceivedLoad(perceivedLoad === key ? "" : key)}
                    className={cn(
                      "px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors",
                      perceivedLoad === key
                        ? "bg-[var(--primary)] text-[var(--primary-foreground)] border-transparent"
                        : "border-[var(--border)] text-[var(--muted-foreground)] hover:bg-[var(--muted)]"
                    )}
                  >
                    {h.gymLoadOptions[key]}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <Label className="text-sm mb-1 block">{h.gymNotes}</Label>
              <Textarea
                placeholder={h.gymNotesPlaceholder}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="resize-none"
              />
            </div>

            <Button type="submit" disabled={pending}>
              <Plus className="w-4 h-4 mr-1" />
              {pending ? h.saving : h.save}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* History */}
      <div>
        <h3 className="text-sm font-semibold text-[var(--muted-foreground)] mb-3 uppercase tracking-wide">
          {h.gymHistory}
        </h3>
        {sessions.length === 0 ? (
          <p className="text-[var(--muted-foreground)] text-sm text-center py-8">{h.gymNoData}</p>
        ) : (
          <div className="space-y-2">
            {sessions.map((s) => (
              <Card key={s.id}>
                <CardContent className="py-3 px-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-3">
                      <Dumbbell className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-sm">
                            {format(new Date(s.date), "PPP", { locale })}
                          </p>
                          {s.focus && (
                            <span className="text-xs bg-[var(--primary)]/20 text-[var(--foreground)] px-2 py-0.5 rounded-full">
                              {h.gymFocusOptions[s.focus as typeof FOCUS_KEYS[number]] ?? s.focus}
                            </span>
                          )}
                          {s.durationMin && (
                            <span className="text-xs text-[var(--muted-foreground)]">
                              {s.durationMin} min
                            </span>
                          )}
                        </div>
                        {(s.energyBefore !== null || s.energyAfter !== null) && (
                          <div className="flex gap-3 mt-1">
                            {s.energyBefore !== null && (
                              <span className="text-xs text-[var(--muted-foreground)]">
                                {h.gymEnergyBefore}: {"⭐".repeat(s.energyBefore)}
                              </span>
                            )}
                            {s.energyAfter !== null && (
                              <span className="text-xs text-[var(--muted-foreground)]">
                                {h.gymEnergyAfter}: {"⭐".repeat(s.energyAfter)}
                              </span>
                            )}
                          </div>
                        )}
                        {s.perceivedLoad && (
                          <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                            {h.gymLoad}: {h.gymLoadOptions[s.perceivedLoad as typeof LOAD_KEYS[number]] ?? s.perceivedLoad}
                          </p>
                        )}
                        {s.notes && (
                          <p className="text-xs text-[var(--muted-foreground)] mt-1 line-clamp-2">{s.notes}</p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        if (!confirm(h.confirmDelete)) return;
                        startTransition(() => { void deleteGymSession(s.id); });
                      }}
                      className="text-[var(--muted-foreground)] hover:text-red-500 transition-colors p-1 shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── CryTab ────────────────────────────────────────────────────────────────

function CryTab({
  entries,
  allJournalEntries,
}: {
  entries: CryEntryWithJournal[];
  allJournalEntries: JournalEntryWithTags[];
}) {
  const { t, lang } = useLang();
  const locale = lang === "pt" ? ptBR : enUS;
  const h = t.health;
  const [pending, startTransition] = useTransition();
  const [date, setDate] = useState(todayStr());
  const [times, setTimes] = useState("");
  const [durationMin, setDurationMin] = useState("");
  const [reason, setReason] = useState("");
  const [journalEntryId, setJournalEntryId] = useState("");

  // Journal entries matching the selected date
  const journalForDate = allJournalEntries.filter((e) =>
    isSameDay(new Date(e.entryDate), new Date(date + "T12:00:00"))
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      await upsertCryEntry({
        date,
        times: times ? parseInt(times) : null,
        durationMin: durationMin ? parseInt(durationMin) : null,
        reason: reason || null,
        journalEntryId: journalEntryId || null,
      });
      setTimes("");
      setDurationMin("");
      setReason("");
      setJournalEntryId("");
    });
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{h.cryTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Date */}
            <div>
              <Label className="text-sm mb-1 block">{h.cryDate}</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => { setDate(e.target.value); setJournalEntryId(""); }}
                className="max-w-[200px]"
              />
            </div>

            {/* Times + Duration */}
            <div className="flex flex-wrap gap-3">
              <div className="flex-1 min-w-[120px]">
                <Label className="text-sm mb-1 block">{h.cryTimes}</Label>
                <Input
                  type="number"
                  min="1"
                  max="99"
                  placeholder={h.cryTimesPlaceholder}
                  value={times}
                  onChange={(e) => setTimes(e.target.value)}
                />
              </div>
              <div className="flex-1 min-w-[120px]">
                <Label className="text-sm mb-1 block">{h.cryDuration}</Label>
                <Input
                  type="number"
                  min="1"
                  max="999"
                  placeholder={h.cryDurationPlaceholder}
                  value={durationMin}
                  onChange={(e) => setDurationMin(e.target.value)}
                />
              </div>
            </div>

            {/* Reason */}
            <div>
              <Label className="text-sm mb-1 block">{h.cryReason}</Label>
              <Textarea
                placeholder={h.cryReasonPlaceholder}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={2}
                className="resize-none"
              />
            </div>

            {/* Link to journal entry */}
            <div>
              <Label className="text-sm mb-1 block">{h.cryJournalLink}</Label>
              {journalForDate.length === 0 ? (
                <p className="text-xs text-[var(--muted-foreground)] italic">{h.cryNoJournalEntries}</p>
              ) : (
                <select
                  value={journalEntryId}
                  onChange={(e) => setJournalEntryId(e.target.value)}
                  className="w-full border border-[var(--border)] rounded-lg px-3 py-2 text-sm bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                >
                  <option value="">{h.cryJournalLinkPlaceholder}</option>
                  {journalForDate.map((entry) => (
                    <option key={entry.id} value={entry.id}>
                      {entry.title}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <Button type="submit" disabled={pending}>
              <Plus className="w-4 h-4 mr-1" />
              {pending ? h.saving : h.save}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* History */}
      <div>
        <h3 className="text-sm font-semibold text-[var(--muted-foreground)] mb-3 uppercase tracking-wide">
          {h.cryHistory}
        </h3>
        {entries.length === 0 ? (
          <p className="text-[var(--muted-foreground)] text-sm text-center py-8">{h.cryNoData}</p>
        ) : (
          <div className="space-y-2">
            {entries.map((entry) => (
              <Card key={entry.id}>
                <CardContent className="py-3 px-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-3">
                      <Droplets className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="font-semibold text-sm">
                          {format(new Date(entry.date), "PPP", { locale })}
                        </p>
                        {(entry.times !== null || entry.durationMin !== null) && (
                          <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                            {entry.times !== null && (
                              <span>
                                {entry.times} {entry.times === 1 ? h.cryTimes1 : h.cryTimesN}
                                {entry.durationMin !== null ? " · " : ""}
                              </span>
                            )}
                            {entry.durationMin !== null && (
                              <span>{entry.durationMin} min</span>
                            )}
                          </p>
                        )}
                        {entry.reason && (
                          <p className="text-xs text-[var(--muted-foreground)] mt-1 line-clamp-2">
                            {entry.reason}
                          </p>
                        )}
                        {entry.journalEntry && (
                          <p className="text-xs text-[var(--accent)] mt-1">
                            📓 {entry.journalEntry.title}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        if (!confirm(h.confirmDelete)) return;
                        startTransition(() => { void deleteCryEntry(entry.id); });
                      }}
                      className="text-[var(--muted-foreground)] hover:text-red-500 transition-colors p-1 shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── HealthView ─────────────────────────────────────────────────────────────

type Tab = "weight" | "gym" | "cry";

export function HealthView({
  weightEntries,
  gymSessions,
  cryEntries,
  journalEntries,
}: {
  weightEntries: WeightEntry[];
  gymSessions: GymSession[];
  cryEntries: CryEntryWithJournal[];
  journalEntries: JournalEntryWithTags[];
}) {
  const { t } = useLang();
  const h = t.health;
  const [tab, setTab] = useState<Tab>("weight");

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "weight", label: h.tabWeight, icon: <Scale className="w-4 h-4" /> },
    { key: "gym",    label: h.tabGym,    icon: <Dumbbell className="w-4 h-4" /> },
    { key: "cry",    label: h.tabCry,    icon: <Droplets className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{h.title}</h1>

      {/* Tab Bar */}
      <div className="flex gap-1 border-b border-[var(--border)] overflow-x-auto [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
        {tabs.map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors whitespace-nowrap border-b-2 -mb-px",
              tab === key
                ? "border-[var(--accent)] text-[var(--foreground)]"
                : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            )}
          >
            {icon}
            {label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === "weight" && <WeightTab entries={weightEntries} />}
      {tab === "gym"    && <GymTab sessions={gymSessions} />}
      {tab === "cry"    && <CryTab entries={cryEntries} allJournalEntries={journalEntries} />}
    </div>
  );
}
