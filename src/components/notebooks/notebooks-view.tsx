"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createNotebook,
  updateNotebook,
  deleteNotebook,
} from "@/actions/notebooks";
import { useLang } from "@/providers/language-provider";
import type { Notebook } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Plus, Trash2, Pencil, Check, X } from "lucide-react";
import Link from "next/link";

type NotebookWithCount = Notebook & { _count: { notes: number } };

const COLORS = [
  "#F8C8DC", "#FFD6A5", "#FDFFB6", "#CAFFBF",
  "#9BF6FF", "#A0C4FF", "#BDB2FF", "#FFC6FF",
];

export function NotebooksView({
  initialNotebooks,
}: {
  initialNotebooks: NotebookWithCount[];
}) {
  const router = useRouter();
  const { t } = useLang();
  const [notebooks, setNotebooks] = useState(initialNotebooks);
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(COLORS[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("");

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setLoading(true);
    setError(null);
    const result = await createNotebook({ name: newName.trim(), color: newColor });
    if (result.error === "name_exists") {
      setError(t.notebooks.nameExists);
    } else if (result.error) {
      setError(result.error);
    } else {
      setNotebooks((prev) => [
        ...prev,
        { ...result.notebook!, _count: { notes: 0 } },
      ]);
      setNewName("");
      setNewColor(COLORS[0]);
      setShowForm(false);
      router.refresh();
    }
    setLoading(false);
  };

  const startEdit = (nb: NotebookWithCount) => {
    setEditingId(nb.id);
    setEditName(nb.name);
    setEditColor(nb.color);
  };

  const handleUpdate = async (id: string) => {
    const result = await updateNotebook(id, { name: editName.trim(), color: editColor });
    if (!result.error) {
      setNotebooks((prev) =>
        prev.map((nb) =>
          nb.id === id ? { ...nb, name: editName.trim(), color: editColor } : nb
        )
      );
      setEditingId(null);
      router.refresh();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t.notebooks.confirmDelete)) return;
    await deleteNotebook(id);
    setNotebooks((prev) => prev.filter((nb) => nb.id !== id));
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t.notebooks.title}</h1>
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          {t.notebooks.newNotebook}
        </Button>
      </div>

      {showForm && (
        <Card className="border-2 border-dashed border-[var(--border)]">
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <Label>{t.notebooks.notebookName}</Label>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder={t.notebooks.notebookNamePlaceholder}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                autoFocus
              />
              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>{t.notebooks.color}</Label>
              <div className="flex gap-2 flex-wrap">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setNewColor(c)}
                    className="w-7 h-7 rounded-full border-2 transition-all"
                    style={{
                      backgroundColor: c,
                      borderColor: newColor === c ? "var(--foreground)" : "transparent",
                      transform: newColor === c ? "scale(1.15)" : "scale(1)",
                    }}
                  />
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreate} disabled={loading || !newName.trim()}>
                {loading ? "..." : t.notebooks.create}
              </Button>
              <Button
                variant="ghost"
                onClick={() => { setShowForm(false); setError(null); setNewName(""); }}
              >
                {t.notebooks.cancel}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {notebooks.length === 0 && !showForm ? (
        <div className="text-center py-20 text-[var(--muted-foreground)]">
          <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium mb-2">{t.notebooks.empty}</p>
          <p className="text-sm">{t.notebooks.emptyDesc}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {notebooks.map((nb) => (
            <div key={nb.id} className="relative group">
              {editingId === nb.id ? (
                <Card className="border-2" style={{ borderColor: editColor }}>
                  <CardContent className="pt-4 space-y-3">
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      autoFocus
                    />
                    <div className="flex gap-1.5 flex-wrap">
                      {COLORS.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setEditColor(c)}
                          className="w-6 h-6 rounded-full border-2 transition-all"
                          style={{
                            backgroundColor: c,
                            borderColor: editColor === c ? "var(--foreground)" : "transparent",
                          }}
                        />
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdate(nb.id)}
                        className="p-1.5 rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)]"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="p-1.5 rounded-lg hover:bg-[var(--muted)]"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Link href={`/notebooks/${nb.id}`}>
                  <Card
                    className="border-2 hover:shadow-md transition-all cursor-pointer"
                    style={{ borderColor: nb.color + "99", backgroundColor: nb.color + "18" }}
                  >
                    <CardContent className="pt-5 pb-4">
                      <div className="flex items-start gap-3">
                        <div
                          className="p-2 rounded-xl shrink-0"
                          style={{ backgroundColor: nb.color + "55" }}
                        >
                          <BookOpen className="w-5 h-5" style={{ color: nb.color === "#FDFFB6" ? "#8a7a00" : "currentColor" }} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold truncate">{nb.name}</p>
                          <p className="text-sm text-[var(--muted-foreground)]">
                            {nb._count.notes}{" "}
                            {nb._count.notes === 1 ? t.notebooks.note : t.notebooks.notes}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )}
              {editingId !== nb.id && (
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <button
                    onClick={(e) => { e.preventDefault(); startEdit(nb); }}
                    className="p-1.5 rounded-lg bg-[var(--background)] border border-[var(--border)] hover:bg-[var(--muted)] shadow-sm"
                  >
                    <Pencil className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => { e.preventDefault(); handleDelete(nb.id); }}
                    className="p-1.5 rounded-lg bg-[var(--background)] border border-[var(--border)] hover:bg-red-50 hover:text-red-500 shadow-sm"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
