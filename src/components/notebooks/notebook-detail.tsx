"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { createNote, updateNote, deleteNote } from "@/actions/notebooks";
import { useLang } from "@/providers/language-provider";
import type { Note, Notebook } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RichTextEditor } from "@/components/editor/rich-text-editor";
import { ArrowLeft, Plus, Trash2, FileText, PanelRight, X } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { ptBR, enUS } from "date-fns/locale";

// ── NotePane ────────────────────────────────────────────────────────────────

function NotePane({
  note,
  saving,
  onUpdateTitle,
  onUpdateContent,
  onDelete,
  onClose,
  placeholder,
  savingLabel,
  closeable,
}: {
  note: Note;
  saving: boolean;
  onUpdateTitle: (id: string, title: string) => void;
  onUpdateContent: (id: string, content: string) => void;
  onDelete: (id: string) => void;
  onClose?: () => void;
  placeholder: string;
  savingLabel: string;
  closeable?: boolean;
}) {
  return (
    <div className="flex flex-col gap-3 min-w-0 flex-1 overflow-hidden">
      {/* Pane header */}
      <div className="flex items-center gap-2 shrink-0">
        <Input
          key={note.id}
          defaultValue={note.title}
          placeholder="Sem título"
          className="font-semibold text-base border-0 border-b rounded-none px-0 focus-visible:ring-0 focus-visible:border-b-2"
          onBlur={(e) => onUpdateTitle(note.id, e.target.value)}
        />
        <span className="text-xs text-[var(--muted-foreground)] shrink-0 min-w-[60px] text-right">
          {saving ? savingLabel : ""}
        </span>
        <button
          onClick={() => onDelete(note.id)}
          className="p-1.5 rounded-lg hover:bg-red-50 hover:text-red-500 text-[var(--muted-foreground)] transition-colors shrink-0"
          title="Delete note"
        >
          <Trash2 className="w-4 h-4" />
        </button>
        {closeable && onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[var(--muted)] text-[var(--muted-foreground)] transition-colors shrink-0"
            title="Close pane"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <RichTextEditor
          key={note.id}
          content={note.content}
          onChange={(content) => onUpdateContent(note.id, content)}
          placeholder={placeholder}
        />
      </div>
    </div>
  );
}

// ── NotebookDetail ───────────────────────────────────────────────────────────

export function NotebookDetail({
  notebook,
  initialNotes,
}: {
  notebook: Notebook;
  initialNotes: Note[];
}) {
  const router = useRouter();
  const { t, lang } = useLang();
  const locale = lang === "pt" ? ptBR : enUS;

  const [notes, setNotes] = useState(initialNotes);
  const [primaryId, setPrimaryId] = useState<string | null>(initialNotes[0]?.id ?? null);
  const [secondaryId, setSecondaryId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [mobileView, setMobileView] = useState<"list" | "editor">(
    initialNotes[0] ? "editor" : "list"
  );
  const [newTitle, setNewTitle] = useState("");
  // Map of noteId → save timer, so primary and secondary save independently
  const saveTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set());

  // Returns display label for a note: title if set, else first 100 chars of plain content
  const noteLabel = (note: Note) => {
    if (note.title.trim()) return note.title;
    const plain = note.content.replace(/<[^>]*>/g, "").trim();
    return plain.slice(0, 100) || (lang === "pt" ? "Sem título" : "Untitled");
  };

  const primaryNote = notes.find((n) => n.id === primaryId) ?? null;
  const secondaryNote = notes.find((n) => n.id === secondaryId) ?? null;
  const splitActive = primaryNote !== null && secondaryNote !== null;

  // ── Helpers ──────────────────────────────────────────────────────────────

  const setSaving = (id: string, saving: boolean) =>
    setSavingIds((prev) => {
      const next = new Set(prev);
      saving ? next.add(id) : next.delete(id);
      return next;
    });

  const handleCreateNote = async () => {
    setCreating(true);
    const result = await createNote({
      notebookId: notebook.id,
      title: newTitle.trim() || "",
      content: "",
    });
    if (result.success && result.note) {
      setNotes((prev) => [result.note!, ...prev]);
      setPrimaryId(result.note!.id);
      setMobileView("editor");
      setNewTitle("");
      router.refresh();
    }
    setCreating(false);
  };

  const handleUpdateContent = useCallback((id: string, content: string) => {
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, content } : n)));
    const existing = saveTimers.current.get(id);
    if (existing) clearTimeout(existing);
    setSaving(id, true);
    const timer = setTimeout(async () => {
      await updateNote(id, { content });
      setSaving(id, false);
    }, 1200);
    saveTimers.current.set(id, timer);
  }, []);

  const handleUpdateTitle = async (id: string, title: string) => {
    await updateNote(id, { title });
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, title } : n)));
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t.notebooks.confirmDeleteNote)) return;
    await deleteNote(id);
    const remaining = notes.filter((n) => n.id !== id);
    setNotes(remaining);
    if (primaryId === id) setPrimaryId(remaining.find((n) => n.id !== secondaryId)?.id ?? null);
    if (secondaryId === id) setSecondaryId(null);
    router.refresh();
  };

  // Select a note as primary (clicking in the list)
  const selectPrimary = (id: string) => {
    // If it's the secondary, swap
    if (id === secondaryId) {
      setSecondaryId(primaryId);
      setPrimaryId(id);
    } else {
      setPrimaryId(id);
    }
    setMobileView("editor");
  };

  // Open note alongside (split button)
  const openSplit = (id: string) => {
    if (id === primaryId) return; // can't split same note
    setSecondaryId(id);
  };

  const closeSecondary = () => setSecondaryId(null);

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 shrink-0">
        <Button asChild variant="ghost" size="sm">
          <Link href="/notebooks">
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">{t.notebooks.back}</span>
          </Link>
        </Button>
        <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: notebook.color }} />
        <h1 className="text-xl font-bold truncate">{notebook.name}</h1>
        <span className="text-sm text-[var(--muted-foreground)] ml-auto shrink-0">
          {notes.length} {notes.length === 1 ? t.notebooks.note : t.notebooks.notes}
        </span>
      </div>

      <div className="flex gap-4 flex-1 min-h-0 overflow-hidden">
        {/* ── Sidebar ── */}
        <aside className={`w-full md:w-52 shrink-0 flex-col gap-1.5 overflow-y-auto ${mobileView === "list" ? "flex" : "hidden md:flex"}`}>
          {/* New note */}
          <div className="flex gap-1.5 mb-1">
            <Input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder={t.notebooks.newNotePlaceholder}
              className="text-sm h-8"
              onKeyDown={(e) => e.key === "Enter" && handleCreateNote()}
            />
            <Button
              size="sm"
              className="h-8 px-2 shrink-0"
              onClick={handleCreateNote}
              disabled={creating}
            >
              <Plus className="w-3.5 h-3.5" />
            </Button>
          </div>

          {notes.length === 0 ? (
            <div className="text-center py-8 text-[var(--muted-foreground)] text-sm">
              <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
              {t.notebooks.emptyNotes}
            </div>
          ) : (
            notes.map((note) => {
              const isPrimary = note.id === primaryId;
              const isSecondary = note.id === secondaryId;
              const label = noteLabel(note);
              const hasRealTitle = note.title.trim().length > 0;

              return (
                <div key={note.id} className="relative group/item">
                  {/* Main clickable area */}
                  <button
                    onClick={() => selectPrimary(note.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all ${
                      isPrimary
                        ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                        : isSecondary
                        ? "bg-[var(--primary)]/10 border border-[var(--primary)]/40 text-[var(--foreground)]"
                        : "hover:bg-[var(--muted)] text-[var(--foreground)]"
                    }`}
                  >
                    {/* Title row with badge inline */}
                    <div className="flex items-center gap-1.5 min-w-0">
                      {(isPrimary || isSecondary) && (
                        <span className={`shrink-0 text-[10px] font-bold w-4 h-4 rounded flex items-center justify-center ${
                          isPrimary ? "bg-white/20 text-white" : "bg-[var(--primary)]/20 text-[var(--primary)]"
                        }`}>
                          {isPrimary ? "1" : "2"}
                        </span>
                      )}
                      <p className={`font-medium truncate min-w-0 ${!hasRealTitle ? "italic opacity-60" : ""}`}>
                        {label}
                      </p>
                    </div>
                    <p className={`text-xs mt-0.5 ${isPrimary ? "opacity-70" : "text-[var(--muted-foreground)]"}`}>
                      {format(new Date(note.updatedAt), "dd MMM", { locale })}
                    </p>
                  </button>

                  {/* Split button (hover) */}
                  {!isPrimary && !isSecondary && (
                    <button
                      onClick={(e) => { e.stopPropagation(); openSplit(note.id); }}
                      title={t.notebooks.openSplit}
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 opacity-0 group-hover/item:opacity-100 transition-opacity p-1 rounded-lg hover:bg-[var(--muted)] text-[var(--muted-foreground)]"
                    >
                      <PanelRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {/* Close secondary */}
                  {isSecondary && (
                    <button
                      onClick={(e) => { e.stopPropagation(); closeSecondary(); }}
                      title={t.notebooks.closeSplit}
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-[var(--muted)] text-[var(--muted-foreground)] opacity-0 group-hover/item:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            })
          )}
        </aside>

        {/* ── Editor area ── */}
        <div className={`flex-1 min-w-0 overflow-hidden ${splitActive ? "flex gap-4" : "flex flex-col gap-3"} ${mobileView === "editor" ? "flex" : "hidden md:flex"}`}>
          {primaryNote ? (
            <>
              {/* Mobile back button */}
              <button
                onClick={() => setMobileView("list")}
                className="md:hidden flex items-center gap-1.5 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] mb-1 shrink-0"
              >
                <ArrowLeft className="w-4 h-4" />
                {t.notebooks.notes}
              </button>

              {/* Primary pane */}
              <div className={`flex flex-col gap-3 min-w-0 overflow-hidden ${splitActive ? "flex-1 border-r border-[var(--border)] pr-4" : "flex-1"}`}>
                <NotePane
                  note={primaryNote}
                  saving={savingIds.has(primaryNote.id)}
                  onUpdateTitle={handleUpdateTitle}
                  onUpdateContent={handleUpdateContent}
                  onDelete={handleDelete}
                  placeholder={t.notebooks.notePlaceholder}
                  savingLabel={t.notebooks.saving}
                />
              </div>

              {/* Secondary pane */}
              {splitActive && secondaryNote && (
                <div className="flex-1 flex flex-col gap-3 min-w-0 overflow-hidden">
                  <NotePane
                    note={secondaryNote}
                    saving={savingIds.has(secondaryNote.id)}
                    onUpdateTitle={handleUpdateTitle}
                    onUpdateContent={handleUpdateContent}
                    onDelete={handleDelete}
                    onClose={closeSecondary}
                    closeable
                    placeholder={t.notebooks.notePlaceholder}
                    savingLabel={t.notebooks.saving}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-[var(--muted-foreground)]">
              <div className="text-center">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>{t.notebooks.selectNote}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
