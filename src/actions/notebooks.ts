"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// ── Notebooks ──────────────────────────────────────────────────────────────

export async function getNotebooks() {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized", notebooks: [] };

  const notebooks = await prisma.notebook.findMany({
    where: { userId: session.user.id },
    include: { _count: { select: { notes: true } } },
    orderBy: { createdAt: "asc" },
  });

  return { notebooks };
}

export async function createNotebook(data: { name: string; color?: string }) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const schema = z.object({
    name: z.string().min(1).max(100),
    color: z.string().optional(),
  });
  const parsed = schema.safeParse(data);
  if (!parsed.success) return { error: "Invalid fields" };

  const existing = await prisma.notebook.findUnique({
    where: { userId_name: { userId: session.user.id, name: parsed.data.name } },
  });
  if (existing) return { error: "name_exists" };

  const notebook = await prisma.notebook.create({
    data: {
      userId: session.user.id,
      name: parsed.data.name,
      color: parsed.data.color ?? "#F8C8DC",
    },
  });

  revalidatePath("/notebooks");
  return { success: true, notebook };
}

export async function updateNotebook(id: string, data: { name?: string; color?: string }) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const existing = await prisma.notebook.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!existing) return { error: "Not found" };

  const notebook = await prisma.notebook.update({
    where: { id },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.color && { color: data.color }),
    },
  });

  revalidatePath("/notebooks");
  revalidatePath(`/notebooks/${id}`);
  return { success: true, notebook };
}

export async function deleteNotebook(id: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  await prisma.notebook.delete({ where: { id, userId: session.user.id } });

  revalidatePath("/notebooks");
  return { success: true };
}

// ── Notes ──────────────────────────────────────────────────────────────────

export async function getNotes(notebookId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized", notes: [] };

  const notes = await prisma.note.findMany({
    where: { notebookId, userId: session.user.id },
    orderBy: { updatedAt: "desc" },
  });

  return { notes };
}

export async function getNote(id: string) {
  const session = await auth();
  if (!session?.user?.id) return null;

  return prisma.note.findFirst({
    where: { id, userId: session.user.id },
  });
}

export async function createNote(data: { notebookId: string; title?: string; content?: string }) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const schema = z.object({
    notebookId: z.string().min(1),
    title: z.string().max(200).optional(),
    content: z.string().optional(),
  });
  const parsed = schema.safeParse(data);
  if (!parsed.success) return { error: "Invalid fields" };

  const notebook = await prisma.notebook.findFirst({
    where: { id: parsed.data.notebookId, userId: session.user.id },
  });
  if (!notebook) return { error: "Not found" };

  const note = await prisma.note.create({
    data: {
      notebookId: parsed.data.notebookId,
      userId: session.user.id,
      title: parsed.data.title ?? "",
      content: parsed.data.content ?? "",
    },
  });

  revalidatePath(`/notebooks/${parsed.data.notebookId}`);
  return { success: true, note };
}

export async function updateNote(id: string, data: { title?: string; content?: string }) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const existing = await prisma.note.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!existing) return { error: "Not found" };

  const note = await prisma.note.update({
    where: { id },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.content !== undefined && { content: data.content }),
    },
  });

  revalidatePath(`/notebooks/${existing.notebookId}`);
  return { success: true, note };
}

export async function deleteNote(id: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const note = await prisma.note.findFirst({ where: { id, userId: session.user.id } });
  if (!note) return { error: "Not found" };

  await prisma.note.delete({ where: { id } });

  revalidatePath(`/notebooks/${note.notebookId}`);
  return { success: true };
}
