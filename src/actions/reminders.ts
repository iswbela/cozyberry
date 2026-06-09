"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export async function getReminders(options?: { upcoming?: boolean }) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized", reminders: [] };

  const now = new Date();

  const reminders = await prisma.reminder.findMany({
    where: {
      userId: session.user.id,
      ...(options?.upcoming ? { eventDate: { gte: now } } : {}),
    },
    orderBy: { eventDate: "asc" },
  });

  return { reminders };
}

export async function createReminder(data: {
  title: string;
  description?: string;
  eventDate: string;
  eventTime?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const schema = z.object({
    title: z.string().min(1).max(200),
    description: z.string().optional(),
    eventDate: z.string().min(1),
    eventTime: z.string().optional(),
  });
  const parsed = schema.safeParse(data);
  if (!parsed.success) return { error: "Invalid fields" };

  // Parse as local noon to avoid UTC offset issues
  const [y, mo, d] = parsed.data.eventDate.split("-").map(Number);
  const eventDate = new Date(y, mo - 1, d, 12, 0, 0);

  const reminder = await prisma.reminder.create({
    data: {
      userId: session.user.id,
      title: parsed.data.title,
      description: parsed.data.description,
      eventDate,
      eventTime: parsed.data.eventTime || null,
    },
  });

  revalidatePath("/reminders");
  revalidatePath("/dashboard");
  return { success: true, reminder };
}

export async function updateReminder(
  id: string,
  data: { title?: string; description?: string; eventDate?: string; eventTime?: string | null }
) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const existing = await prisma.reminder.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!existing) return { error: "Not found" };

  const reminder = await prisma.reminder.update({
    where: { id },
    data: {
      ...(data.title && { title: data.title }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.eventDate && (() => {
        const [y, mo, d] = data.eventDate!.split("-").map(Number);
        return { eventDate: new Date(y, mo - 1, d, 12, 0, 0) };
      })()),
      ...("eventTime" in data && { eventTime: data.eventTime ?? null }),
    },
  });

  revalidatePath("/reminders");
  revalidatePath("/dashboard");
  return { success: true, reminder };
}

export async function deleteReminder(id: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  await prisma.reminder.delete({ where: { id, userId: session.user.id } });

  revalidatePath("/reminders");
  revalidatePath("/dashboard");
  return { success: true };
}
