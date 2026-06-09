"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { createEntry, updateEntry } from "@/actions/entries";
import { RichTextEditor } from "@/components/editor/rich-text-editor";
import { useLang } from "@/providers/language-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MOODS } from "@/lib/utils";
import type { Tag } from "@prisma/client";
import type { JournalEntryWithTags } from "@/types";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

const schema = z.object({
  title: z.string().min(1).max(200),
  entryDate: z.string().min(1),
});
type FormData = z.infer<typeof schema>;

interface EntryFormProps {
  tags: Tag[];
  entry?: JournalEntryWithTags;
}

// Converts yyyy-MM-dd → DD/MM/YYYY for display
function toDisplay(v: string) {
  if (!v) return "";
  const [y, m, d] = v.split("-");
  if (!y || !m || !d) return v;
  return `${d}/${m}/${y}`;
}

// Converts DD/MM/YYYY → yyyy-MM-dd for storage
function toInternal(display: string) {
  const parts = display.replace(/\D/g, "");
  if (parts.length < 8) return "";
  const d = parts.slice(0, 2);
  const m = parts.slice(2, 4);
  const y = parts.slice(4, 8);
  return `${y}-${m}-${d}`;
}

function DateInputDMY({
  value,
  onChange,
  placeholder = "DD/MM/AAAA",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const [display, setDisplay] = useState(() => toDisplay(value));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, "");
    if (raw.length > 8) raw = raw.slice(0, 8);

    let formatted = raw;
    if (raw.length > 4) {
      formatted = raw.slice(0, 2) + "/" + raw.slice(2, 4) + "/" + raw.slice(4);
    } else if (raw.length > 2) {
      formatted = raw.slice(0, 2) + "/" + raw.slice(2);
    }

    setDisplay(formatted);

    if (raw.length === 8) {
      const internal = toInternal(formatted);
      onChange(internal);
    }
  };

  return (
    <Input
      value={display}
      onChange={handleChange}
      placeholder={placeholder}
      maxLength={10}
      inputMode="numeric"
    />
  );
}

export function EntryForm({ tags, entry }: EntryFormProps) {
  const router = useRouter();
  const { t } = useLang();
  const [content, setContent] = useState(entry?.content ?? "");
  const [selectedMood, setSelectedMood] = useState(entry?.mood ?? "");
  const [selectedTags, setSelectedTags] = useState<string[]>(entry?.tags.map((t) => t.tag.id) ?? []);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: entry?.title ?? "",
      entryDate: entry ? format(new Date(entry.entryDate), "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
    },
  });

  const entryDate = watch("entryDate");

  const toggleTag = (id: string) =>
    setSelectedTags((prev) => prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]);

  const onSubmit = async (data: FormData) => {
    if (!content || content === "<p></p>") { setError(t.journal.entryPlaceholder); return; }
    setSaving(true);
    setError(null);
    try {
      if (entry) {
        const result = await updateEntry(entry.id, { title: data.title, content, mood: selectedMood || undefined, entryDate: data.entryDate, tagIds: selectedTags });
        if (result.error) { setError(result.error); return; }
        router.push(`/journal/${entry.id}`);
      } else {
        const result = await createEntry({ title: data.title, content, mood: selectedMood || undefined, entryDate: data.entryDate, tagIds: selectedTags });
        if (result.error) { setError(result.error); return; }
        router.push("/journal");
      }
      router.refresh();
    } catch { setError(t.auth.somethingWrong); }
    finally { setSaving(false); }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex items-center justify-between gap-2">
        <Button asChild variant="ghost" size="sm" className="shrink-0">
          <Link href={entry ? `/journal/${entry.id}` : "/journal"}>
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">{t.journal.back}</span>
          </Link>
        </Button>
        <h1 className="text-lg md:text-xl font-bold truncate">{entry ? t.journal.editEntry : t.journal.newEntryTitle}</h1>
        <Button type="submit" disabled={saving} className="shrink-0">
          <Save className="w-4 h-4" />
          {saving ? t.journal.saving : t.journal.save}
        </Button>
      </div>

      {error && <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">{t.journal.titleLabel}</Label>
          <Input id="title" placeholder={t.journal.titlePlaceholder} {...register("title")} />
          {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="entryDate">{t.journal.dateLabel}</Label>
          <DateInputDMY
            value={entryDate}
            onChange={(v) => setValue("entryDate", v, { shouldValidate: true })}
          />
          {errors.entryDate && <p className="text-xs text-red-500">{errors.entryDate.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label>{t.journal.moodLabel}</Label>
        <div className="flex gap-2 flex-wrap">
          {MOODS.map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => setSelectedMood(selectedMood === m.value ? "" : m.value)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border-2 transition-all ${selectedMood === m.value ? "border-[var(--accent)] bg-[var(--primary)]/20 font-medium" : "border-[var(--border)] hover:border-[var(--accent)]/50"}`}
            >
              <span>{m.emoji}</span><span>{m.label}</span>
            </button>
          ))}
        </div>
      </div>

      {tags.length > 0 && (
        <div className="space-y-2">
          <Label>{t.journal.tagsLabel}</Label>
          <div className="flex gap-2 flex-wrap">
            {tags.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => toggleTag(tag.id)}
                className="px-3 py-1 rounded-full text-sm border-2 transition-all"
                style={{
                  borderColor: selectedTags.includes(tag.id) ? tag.color : "var(--border)",
                  backgroundColor: selectedTags.includes(tag.id) ? tag.color + "33" : "transparent",
                  color: selectedTags.includes(tag.id) ? tag.color : "var(--muted-foreground)",
                }}
              >
                {tag.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label>{t.journal.entryLabel}</Label>
        <RichTextEditor content={content} onChange={setContent} placeholder={t.journal.entryPlaceholder} />
      </div>
    </form>
  );
}
