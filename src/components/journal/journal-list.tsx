"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format, isSameDay, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getMood, MOODS } from "@/lib/utils";
import { deleteEntry } from "@/actions/entries";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import type { Tag } from "@prisma/client";
import type { JournalEntryWithTags } from "@/types";
import {
  PenLine,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  List,
  Search,
  X,
  Edit2,
  Trash2,
} from "lucide-react";

interface JournalListProps {
  initialEntries: JournalEntryWithTags[];
  tags: Tag[];
}

export function JournalList({ initialEntries, tags }: JournalListProps) {
  const router = useRouter();
  const [view, setView] = useState<"notebook" | "list">("notebook");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [search, setSearch] = useState("");
  const [selectedMood, setSelectedMood] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [deleting, setDeleting] = useState(false);

  // Sorted newest first for notebook navigation
  const sortedEntries = useMemo(
    () =>
      [...initialEntries].sort(
        (a, b) =>
          new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime()
      ),
    [initialEntries]
  );

  const currentEntry = sortedEntries[currentIndex] ?? null;
  const hasPrev = currentIndex < sortedEntries.length - 1;
  const hasNext = currentIndex > 0;

  // Check if today already has an entry
  const today = startOfDay(new Date());
  const todayEntry = sortedEntries.find((e) =>
    isSameDay(new Date(e.entryDate), today)
  );

  // List view: filtered + grouped by day
  const filtered = useMemo(() => {
    return [...initialEntries]
      .filter((entry) => {
        const text =
          `${entry.title} ${entry.content.replace(/<[^>]*>/g, "")}`.toLowerCase();
        const matchesSearch = !search || text.includes(search.toLowerCase());
        const matchesMood = !selectedMood || entry.mood === selectedMood;
        const matchesTag =
          !selectedTag || entry.tags.some((t) => t.tag.id === selectedTag);
        return matchesSearch && matchesMood && matchesTag;
      })
      .sort(
        (a, b) =>
          new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime()
      );
  }, [initialEntries, search, selectedMood, selectedTag]);

  const groupedByDay = useMemo(() => {
    const groups: {
      dateKey: string;
      date: Date;
      entries: JournalEntryWithTags[];
    }[] = [];
    filtered.forEach((entry) => {
      const date = new Date(entry.entryDate);
      const dateKey = format(date, "yyyy-MM-dd");
      const existing = groups.find((g) => g.dateKey === dateKey);
      if (existing) {
        existing.entries.push(entry);
      } else {
        groups.push({ dateKey, date, entries: [entry] });
      }
    });
    return groups;
  }, [filtered]);

  const handleDelete = async () => {
    if (!currentEntry) return;
    if (!confirm("Deletar este entry? Essa ação não pode ser desfeita.")) return;
    setDeleting(true);
    await deleteEntry(currentEntry.id);
    setCurrentIndex(0);
    router.refresh();
    setDeleting(false);
  };

  const jumpToEntry = (id: string) => {
    const idx = sortedEntries.findIndex((e) => e.id === id);
    if (idx !== -1) {
      setCurrentIndex(idx);
      setView("notebook");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Diário</h1>
          <p className="text-[var(--muted-foreground)] text-sm">
            {initialEntries.length}{" "}
            {initialEntries.length === 1 ? "entry" : "entries"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex rounded-xl border overflow-hidden">
            <button
              onClick={() => setView("notebook")}
              className={`px-3 py-2 text-sm flex items-center gap-1.5 transition-colors ${
                view === "notebook"
                  ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                  : "hover:bg-[var(--muted)] text-[var(--foreground)]"
              }`}
            >
              <BookOpen className="w-4 h-4" /> Caderno
            </button>
            <button
              onClick={() => setView("list")}
              className={`px-3 py-2 text-sm flex items-center gap-1.5 transition-colors ${
                view === "list"
                  ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                  : "hover:bg-[var(--muted)] text-[var(--foreground)]"
              }`}
            >
              <List className="w-4 h-4" /> Lista
            </button>
          </div>

          {/* New entry — only if no entry today */}
          {!todayEntry ? (
            <Button asChild>
              <Link href="/journal/new">
                <PenLine className="w-4 h-4" /> Escrever hoje
              </Link>
            </Button>
          ) : (
            <Button asChild variant="outline">
              <Link href={`/journal/${todayEntry.id}/edit`}>
                <Edit2 className="w-4 h-4" /> Editar hoje
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* ===== NOTEBOOK VIEW ===== */}
      {view === "notebook" && (
        <>
          {sortedEntries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <BookOpen className="w-16 h-16 text-[var(--muted-foreground)] opacity-30 mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                Seu diário está vazio
              </h3>
              <p className="text-[var(--muted-foreground)] mb-6">
                Comece escrevendo o seu primeiro entry.
              </p>
              <Button asChild>
                <Link href="/journal/new">
                  <PenLine className="w-4 h-4" /> Escrever agora
                </Link>
              </Button>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto">
              {/* Day navigation */}
              <div className="flex items-center justify-between mb-5">
                <button
                  onClick={() => setCurrentIndex((i) => i + 1)}
                  disabled={!hasPrev}
                  className="p-2 rounded-full hover:bg-[var(--muted)] disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
                  title="Entry anterior"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="text-center">
                  <p className="text-sm text-[var(--muted-foreground)] capitalize">
                    {format(new Date(currentEntry!.entryDate), "EEEE", {
                      locale: ptBR,
                    })}
                  </p>
                  <p className="font-semibold text-[var(--foreground)]">
                    {format(
                      new Date(currentEntry!.entryDate),
                      "d 'de' MMMM 'de' yyyy",
                      { locale: ptBR }
                    )}
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                    {currentIndex + 1} de {sortedEntries.length}
                  </p>
                </div>

                <button
                  onClick={() => setCurrentIndex((i) => i - 1)}
                  disabled={!hasNext}
                  className="p-2 rounded-full hover:bg-[var(--muted)] disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
                  title="Entry seguinte"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Notebook page */}
              <div
                className="rounded-3xl border bg-[var(--card)] shadow-lg overflow-hidden"
                style={{ minHeight: 560 }}
              >
                {/* Colored top strip */}
                <div className="h-2 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)]" />

                <div className="p-5 md:p-12">
                  {/* Mood */}
                  {currentEntry!.mood &&
                    (() => {
                      const mood = getMood(currentEntry!.mood);
                      return mood ? (
                        <div
                          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 text-sm font-medium"
                          style={{
                            backgroundColor: mood.color + "22",
                            color: mood.color,
                            border: `1px solid ${mood.color}55`,
                          }}
                        >
                          <span className="text-xl">{mood.emoji}</span>
                          {mood.label}
                        </div>
                      ) : null;
                    })()}

                  {/* Title */}
                  <h2 className="text-2xl md:text-5xl font-bold text-[var(--foreground)] leading-tight mb-4">
                    {currentEntry!.title}
                  </h2>

                  {/* Tags */}
                  {currentEntry!.tags.length > 0 && (
                    <div className="flex gap-2 flex-wrap mb-8">
                      {currentEntry!.tags.map(({ tag }) => (
                        <Badge
                          key={tag.id}
                          style={{
                            backgroundColor: tag.color + "33",
                            color: tag.color,
                          }}
                          className="text-xs"
                        >
                          {tag.name}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="border-t border-[var(--border)] mb-8" />

                  {/* Content */}
                  <div
                    className="ProseMirror text-[var(--foreground)] text-base leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: currentEntry!.content }}
                  />
                </div>

                {/* Footer */}
                <div className="border-t border-[var(--border)] px-5 md:px-12 py-4 flex justify-between items-center bg-[var(--muted)]/30 flex-wrap gap-2">
                  <p className="text-xs text-[var(--muted-foreground)]">
                    Atualizado em{" "}
                    {format(
                      new Date(currentEntry!.updatedAt),
                      "d MMM yyyy",
                      { locale: ptBR }
                    )}
                  </p>
                  <div className="flex gap-2">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/journal/${currentEntry!.id}/edit`}>
                        <Edit2 className="w-3 h-3" /> Editar
                      </Link>
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleDelete}
                      disabled={deleting}
                    >
                      <Trash2 className="w-3 h-3" />
                      {deleting ? "..." : "Deletar"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* ===== LIST VIEW ===== */}
      {view === "list" && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
              <Input
                placeholder="Buscar entries..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <select
              value={selectedMood}
              onChange={(e) => setSelectedMood(e.target.value)}
              className="h-10 rounded-xl border bg-[var(--input)] px-3 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
            >
              <option value="">Todos os sentimentos</option>
              {MOODS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.emoji} {m.label}
                </option>
              ))}
            </select>
            {tags.length > 0 && (
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="h-10 rounded-xl border bg-[var(--input)] px-3 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
              >
                <option value="">Todas as tags</option>
                {tags.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            )}
            {(search || selectedMood || selectedTag) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearch("");
                  setSelectedMood("");
                  setSelectedTag("");
                }}
              >
                <X className="w-4 h-4" /> Limpar
              </Button>
            )}
          </div>

          {/* Grouped list */}
          {groupedByDay.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-16 text-center">
                <BookOpen className="w-12 h-12 text-[var(--muted-foreground)] mx-auto mb-3 opacity-40" />
                <p className="text-[var(--muted-foreground)]">
                  Nenhum entry encontrado.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-8">
              {groupedByDay.map(({ dateKey, date, entries: dayEntries }) => (
                <div key={dateKey}>
                  {/* Day separator */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-px flex-1 bg-[var(--border)]" />
                    <span className="text-sm font-medium text-[var(--muted-foreground)] capitalize px-2 shrink-0">
                      {format(date, "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </span>
                    <div className="h-px flex-1 bg-[var(--border)]" />
                  </div>

                  <div className="space-y-2">
                    {dayEntries.map((entry) => {
                      const mood = getMood(entry.mood);
                      return (
                        <button
                          key={entry.id}
                          onClick={() => jumpToEntry(entry.id)}
                          className="w-full text-left"
                        >
                          <Card className="hover:shadow-md transition-all hover:border-[var(--accent)] cursor-pointer">
                            <CardContent className="py-4 px-5">
                              <div className="flex items-start gap-3">
                                {mood && (
                                  <span className="text-2xl mt-0.5 shrink-0">
                                    {mood.emoji}
                                  </span>
                                )}
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-semibold text-[var(--foreground)] text-lg truncate">
                                    {entry.title}
                                  </h3>
                                  <p className="text-sm text-[var(--muted-foreground)] line-clamp-2 mt-0.5">
                                    {entry.content
                                      .replace(/<[^>]*>/g, "")
                                      .slice(0, 180)}
                                  </p>
                                  {entry.tags.length > 0 && (
                                    <div className="flex gap-1.5 mt-2 flex-wrap">
                                      {entry.tags.map(({ tag }) => (
                                        <Badge
                                          key={tag.id}
                                          style={{
                                            backgroundColor: tag.color + "33",
                                            color: tag.color,
                                          }}
                                          className="text-xs"
                                        >
                                          {tag.name}
                                        </Badge>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
