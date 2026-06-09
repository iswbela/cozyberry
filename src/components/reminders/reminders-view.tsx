"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createReminder, updateReminder, deleteReminder } from "@/actions/reminders";
import { useLang } from "@/providers/language-provider";
import type { Reminder } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Bell, Plus, Trash2, Pencil, Check, X, CalendarDays } from "lucide-react";
import { format, isPast, isToday, differenceInDays, type Locale } from "date-fns";
import { ptBR, enUS } from "date-fns/locale";

export function RemindersView({ initialReminders }: { initialReminders: Reminder[] }) {
  const router = useRouter();
  const { t, lang } = useLang();
  const locale = lang === "pt" ? ptBR : enUS;

  const [reminders, setReminders] = useState(initialReminders);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");

  const today = format(new Date(), "yyyy-MM-dd");

  const handleCreate = async () => {
    if (!title.trim() || !eventDate) {
      setError(t.reminders.fillFields);
      return;
    }
    setLoading(true);
    setError(null);
    const result = await createReminder({
      title: title.trim(),
      description: description.trim() || undefined,
      eventDate,
      eventTime: eventTime || undefined,
    });
    if (result.success && result.reminder) {
      setReminders((prev) =>
        [...prev, result.reminder!].sort(
          (a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()
        )
      );
      setTitle(""); setDescription(""); setEventDate(""); setEventTime(""); setShowForm(false);
      router.refresh();
    } else if (result.error) {
      setError(result.error);
    }
    setLoading(false);
  };

  const startEdit = (r: Reminder) => {
    setEditingId(r.id);
    setEditTitle(r.title);
    setEditDesc(r.description ?? "");
    setEditDate(format(new Date(r.eventDate), "yyyy-MM-dd"));
    setEditTime(r.eventTime ?? "");
  };

  const handleUpdate = async (id: string) => {
    const result = await updateReminder(id, {
      title: editTitle.trim(),
      description: editDesc.trim() || undefined,
      eventDate: editDate,
      eventTime: editTime || null,
    });
    if (result.success && result.reminder) {
      setReminders((prev) =>
        prev.map((r) => (r.id === id ? result.reminder! : r))
          .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime())
      );
      setEditingId(null);
      router.refresh();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t.reminders.confirmDelete)) return;
    await deleteReminder(id);
    setReminders((prev) => prev.filter((r) => r.id !== id));
    router.refresh();
  };

  const getDaysLabel = (date: Date, time?: string | null) => {
    const now = new Date();

    if (time) {
      const [h, m] = time.split(":").map(Number);
      const eventDateTime = new Date(date);
      eventDateTime.setHours(h, m, 0, 0);
      const diffMs = eventDateTime.getTime() - now.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);
      if (diffMs > 0 && diffHours < 24) {
        const hrs = Math.floor(diffHours);
        const mins = Math.round((diffHours - hrs) * 60);
        if (hrs === 0) return `Em ${mins}min`;
        return mins > 0
          ? t.reminders.inHours.replace("{h}", `${hrs}h${mins}min`)
          : t.reminders.inHours.replace("{h}", String(hrs));
      }
    }

    if (isToday(date)) return t.reminders.today;
    if (isPast(date)) return t.reminders.past;
    const days = differenceInDays(date, now);
    if (days === 1) return t.reminders.tomorrow;
    return t.reminders.inDays.replace("{n}", String(days));
  };

  const upcoming = reminders.filter((r) => !isPast(new Date(r.eventDate)) || isToday(new Date(r.eventDate)));
  const past = reminders.filter((r) => isPast(new Date(r.eventDate)) && !isToday(new Date(r.eventDate)));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t.reminders.title}</h1>
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          {t.reminders.newReminder}
        </Button>
      </div>

      {showForm && (
        <Card className="border-2 border-dashed border-[var(--border)]">
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2 sm:col-span-1">
                <Label>{t.reminders.titleLabel}</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t.reminders.titlePlaceholder}
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label>{t.reminders.dateLabel}</Label>
                <Input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  min={today}
                />
              </div>
              <div className="space-y-2">
                <Label>{t.reminders.timeLabel}</Label>
                <Input
                  type="time"
                  value={eventTime}
                  onChange={(e) => setEventTime(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t.reminders.descriptionLabel}</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t.reminders.descriptionPlaceholder}
                rows={2}
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="flex gap-2">
              <Button onClick={handleCreate} disabled={loading || !title.trim() || !eventDate}>
                {loading ? "..." : t.reminders.save}
              </Button>
              <Button variant="ghost" onClick={() => { setShowForm(false); setError(null); }}>
                {t.reminders.cancel}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {reminders.length === 0 && !showForm ? (
        <div className="text-center py-20 text-[var(--muted-foreground)]">
          <Bell className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium mb-2">{t.reminders.empty}</p>
          <p className="text-sm">{t.reminders.emptyDesc}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {upcoming.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
                {t.reminders.upcoming}
              </h2>
              {upcoming.map((r) => (
                <ReminderCard
                  key={r.id}
                  reminder={r}
                  locale={locale}
                  daysLabel={getDaysLabel(new Date(r.eventDate), r.eventTime)}
                  isEditing={editingId === r.id}
                  editTitle={editTitle}
                  editDesc={editDesc}
                  editDate={editDate}
                  editTime={editTime}
                  onEditTitle={setEditTitle}
                  onEditDesc={setEditDesc}
                  onEditDate={setEditDate}
                  onEditTime={setEditTime}
                  onStartEdit={() => startEdit(r)}
                  onSaveEdit={() => handleUpdate(r.id)}
                  onCancelEdit={() => setEditingId(null)}
                  onDelete={() => handleDelete(r.id)}
                  t={t}
                />
              ))}
            </section>
          )}

          {past.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-wider opacity-60">
                {t.reminders.pastEvents}
              </h2>
              <div className="opacity-60">
                {past.map((r) => (
                  <ReminderCard
                    key={r.id}
                    reminder={r}
                    locale={locale}
                    daysLabel={getDaysLabel(new Date(r.eventDate), r.eventTime)}
                    isEditing={editingId === r.id}
                    editTitle={editTitle}
                    editDesc={editDesc}
                    editDate={editDate}
                    editTime={editTime}
                    onEditTitle={setEditTitle}
                    onEditDesc={setEditDesc}
                    onEditDate={setEditDate}
                    onEditTime={setEditTime}
                    onStartEdit={() => startEdit(r)}
                    onSaveEdit={() => handleUpdate(r.id)}
                    onCancelEdit={() => setEditingId(null)}
                    onDelete={() => handleDelete(r.id)}
                    t={t}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

function ReminderCard({
  reminder,
  locale,
  daysLabel,
  isEditing,
  editTitle,
  editDesc,
  editDate,
  editTime,
  onEditTitle,
  onEditDesc,
  onEditDate,
  onEditTime,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete,
  t,
}: {
  reminder: Reminder;
  locale: Locale;
  daysLabel: string;
  isEditing: boolean;
  editTitle: string;
  editDesc: string;
  editDate: string;
  editTime: string;
  onEditTitle: (v: string) => void;
  onEditDesc: (v: string) => void;
  onEditDate: (v: string) => void;
  onEditTime: (v: string) => void;
  onStartEdit: () => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onDelete: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: any;
}) {
  if (isEditing) {
    return (
      <Card className="border-2 border-[var(--accent)]">
        <CardContent className="pt-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input value={editTitle} onChange={(e) => onEditTitle(e.target.value)} autoFocus />
            <Input type="date" value={editDate} onChange={(e) => onEditDate(e.target.value)} />
            <Input type="time" value={editTime} onChange={(e) => onEditTime(e.target.value)} placeholder={t.reminders.timeLabel} />
          </div>
          <Textarea
            value={editDesc}
            onChange={(e) => onEditDesc(e.target.value)}
            rows={2}
            placeholder={t.reminders.descriptionPlaceholder}
          />
          <div className="flex gap-2">
            <button
              onClick={onSaveEdit}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)] text-sm"
            >
              <Check className="w-3.5 h-3.5" /> {t.reminders.save}
            </button>
            <button
              onClick={onCancelEdit}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-[var(--muted)] text-sm"
            >
              <X className="w-3.5 h-3.5" /> {t.reminders.cancel}
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="group border border-[var(--border)] hover:shadow-sm transition-all">
      <CardContent className="pt-4 pb-4">
        <div className="flex items-start gap-4">
          <div className="shrink-0 flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)]">
            <CalendarDays className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold truncate">
              {reminder.title}
              {reminder.eventTime && (
                <span className="font-normal text-[var(--muted-foreground)]"> - {reminder.eventTime}</span>
              )}
            </p>
            <p className="text-sm text-[var(--muted-foreground)]">
              {format(new Date(reminder.eventDate), "dd 'de' MMMM 'de' yyyy", { locale })} — <span className="font-medium">{daysLabel}</span>
            </p>
            {reminder.description && (
              <p className="text-sm text-[var(--muted-foreground)] mt-1 line-clamp-2">
                {reminder.description}
              </p>
            )}
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <button
              onClick={onStartEdit}
              className="p-1.5 rounded-lg hover:bg-[var(--muted)] text-[var(--muted-foreground)]"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onDelete}
              className="p-1.5 rounded-lg hover:bg-red-50 hover:text-red-500 text-[var(--muted-foreground)]"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
