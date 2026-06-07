"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createTag, updateTag, deleteTag } from "@/actions/tags";
import type { Tag } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit2, Trash2, Plus, Tag as TagIcon } from "lucide-react";

const PRESET_COLORS = [
  "#F8C8DC", "#E8A7C0", "#E8DFF5", "#A8C5E0", "#6BCB77",
  "#FFD93D", "#E8A87C", "#E87C7C", "#85A5C8", "#C8A8E8",
];

export function TagsManager({ initialTags }: { initialTags: Tag[] }) {
  const router = useRouter();
  const [tags, setTags] = useState(initialTags);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState("#F8C8DC");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setLoading(true);
    const result = await createTag(newName.trim(), newColor);
    if (result.error) { setError(result.error); }
    else {
      setTags((prev) => [...prev, result.tag!]);
      setNewName("");
    }
    setLoading(false);
  };

  const startEdit = (tag: Tag) => {
    setEditingId(tag.id);
    setEditName(tag.name);
    setEditColor(tag.color);
  };

  const handleUpdate = async (id: string) => {
    setLoading(true);
    const result = await updateTag(id, editName.trim(), editColor);
    if (result.success) {
      setTags((prev) => prev.map((t) => (t.id === id ? result.tag! : t)));
      setEditingId(null);
    }
    setLoading(false);
    router.refresh();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this tag?")) return;
    await deleteTag(id);
    setTags((prev) => prev.filter((t) => t.id !== id));
    router.refresh();
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold">Tags</h1>

      {/* Create Tag */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Create New Tag</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">{error}</div>
          )}
          <div className="flex gap-3 items-end">
            <div className="flex-1 space-y-2">
              <Label>Tag Name</Label>
              <Input
                placeholder="e.g. Gratitude, Travel, Work..."
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              />
            </div>
            <div className="space-y-2">
              <Label>Color</Label>
              <input
                type="color"
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
                className="h-10 w-16 rounded-xl border border-[var(--border)] cursor-pointer"
              />
            </div>
            <Button onClick={handleCreate} disabled={loading || !newName.trim()}>
              <Plus className="w-4 h-4" /> Add
            </Button>
          </div>
          {/* Preset Colors */}
          <div className="flex gap-2 flex-wrap">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setNewColor(c)}
                className="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110"
                style={{ backgroundColor: c, borderColor: newColor === c ? "var(--foreground)" : "transparent" }}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tags List */}
      {tags.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <TagIcon className="w-10 h-10 text-[var(--muted-foreground)] mx-auto mb-3 opacity-40" />
            <p className="text-[var(--muted-foreground)]">No tags yet. Create one above!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {tags.map((tag) => (
            <Card key={tag.id}>
              <CardContent className="py-3 px-4">
                {editingId === tag.id ? (
                  <div className="flex gap-3 items-center">
                    <input
                      type="color"
                      value={editColor}
                      onChange={(e) => setEditColor(e.target.value)}
                      className="h-8 w-12 rounded-lg border border-[var(--border)] cursor-pointer"
                    />
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1"
                      onKeyDown={(e) => e.key === "Enter" && handleUpdate(tag.id)}
                    />
                    <Button size="sm" onClick={() => handleUpdate(tag.id)} disabled={loading}>
                      Save
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full shrink-0"
                        style={{ backgroundColor: tag.color }}
                      />
                      <span
                        className="px-3 py-1 rounded-full text-sm font-medium"
                        style={{ backgroundColor: tag.color + "33", color: tag.color }}
                      >
                        {tag.name}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => startEdit(tag)} className="h-8 w-8">
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(tag.id)} className="h-8 w-8 hover:text-red-500">
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
