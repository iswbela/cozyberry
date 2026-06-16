"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { encrypt, decrypt } from "@/lib/encrypt";
import type { JournalEntry, Tag } from "@prisma/client";

type EntryWithTags = JournalEntry & { tags: { tag: Tag }[] };

function decryptEntry<T extends EntryWithTags>(entry: T): T {
  return { ...entry, title: decrypt(entry.title), content: decrypt(entry.content) };
}

const EntrySchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  mood: z.string().optional(),
  entryDate: z.string(),
  tagIds: z.array(z.string()).optional(),
});

export async function createEntry(data: {
  title: string;
  content: string;
  mood?: string;
  entryDate: string;
  tagIds?: string[];
}) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const parsed = EntrySchema.safeParse(data);
  if (!parsed.success) return { error: "Invalid fields" };

  const [y, mo, d] = parsed.data.entryDate.split("-").map(Number);
  const date = new Date(y, mo - 1, d, 12, 0, 0);
  const dayStart = new Date(y, mo - 1, d, 0, 0, 0, 0);
  const dayEnd = new Date(y, mo - 1, d, 23, 59, 59, 999);

  const existing = await prisma.journalEntry.findFirst({
    where: { userId: session.user.id, entryDate: { gte: dayStart, lte: dayEnd } },
  });
  if (existing) return { error: "day_exists", existingId: existing.id };

  const entry = await prisma.journalEntry.create({
    data: {
      userId: session.user.id,
      title: encrypt(parsed.data.title),
      content: encrypt(parsed.data.content),
      mood: parsed.data.mood,
      entryDate: date,
      tags: parsed.data.tagIds?.length
        ? { create: parsed.data.tagIds.map((tagId) => ({ tagId })) }
        : undefined,
    },
    include: { tags: { include: { tag: true } } },
  });

  revalidatePath("/dashboard");
  revalidatePath("/journal");
  revalidatePath("/calendar");
  return { success: true, entry: decryptEntry(entry) };
}

export async function updateEntry(
  id: string,
  data: { title?: string; content?: string; mood?: string; entryDate?: string; tagIds?: string[] }
) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const existing = await prisma.journalEntry.findFirst({ where: { id, userId: session.user.id } });
  if (!existing) return { error: "Not found" };

  if (data.tagIds !== undefined) {
    await prisma.journalEntryTag.deleteMany({ where: { journalEntryId: id } });
  }

  const entry = await prisma.journalEntry.update({
    where: { id },
    data: {
      ...(data.title && { title: encrypt(data.title) }),
      ...(data.content && { content: encrypt(data.content) }),
      ...(data.mood !== undefined && { mood: data.mood }),
      ...(data.entryDate && (() => {
        const [ey, em, ed] = data.entryDate!.split("-").map(Number);
        return { entryDate: new Date(ey, em - 1, ed, 12, 0, 0) };
      })()),
      ...(data.tagIds?.length && {
        tags: { create: data.tagIds.map((tagId) => ({ tagId })) },
      }),
    },
    include: { tags: { include: { tag: true } } },
  });

  revalidatePath("/dashboard");
  revalidatePath("/journal");
  revalidatePath(`/journal/${id}`);
  return { success: true, entry: decryptEntry(entry) };
}

export async function deleteEntry(id: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  await prisma.journalEntry.delete({ where: { id, userId: session.user.id } });

  revalidatePath("/dashboard");
  revalidatePath("/journal");
  revalidatePath("/calendar");
  return { success: true };
}

export async function getEntries(params?: {
  search?: string;
  tagId?: string;
  mood?: string;
  limit?: number;
  offset?: number;
}) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized", entries: [] };

  const raw = await prisma.journalEntry.findMany({
    where: {
      userId: session.user.id,
      ...(params?.tagId && { tags: { some: { tagId: params.tagId } } }),
      ...(params?.mood && { mood: params.mood }),
    },
    include: { tags: { include: { tag: true } } },
    orderBy: { entryDate: "desc" },
  });

  let entries = raw.map(decryptEntry);

  if (params?.search) {
    const q = params.search.toLowerCase();
    entries = entries.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.content.replace(/<[^>]*>/g, "").toLowerCase().includes(q)
    );
  }

  const offset = params?.offset ?? 0;
  const limit = params?.limit ?? 50;
  entries = entries.slice(offset, offset + limit);

  return { entries };
}

export async function getEntry(id: string) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const entry = await prisma.journalEntry.findFirst({
    where: { id, userId: session.user.id },
    include: { tags: { include: { tag: true } } },
  });

  return entry ? decryptEntry(entry) : null;
}
