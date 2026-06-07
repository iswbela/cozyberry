"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getLetters() {
  const session = await auth();
  if (!session?.user?.id) return [];
  return prisma.futureLetter.findMany({
    where: { userId: session.user.id },
    orderBy: { unlockDate: "asc" },
  });
}

export async function createLetter(data: {
  title: string;
  content: string;
  unlockDate: string;
}) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const letter = await prisma.futureLetter.create({
    data: {
      userId: session.user.id,
      title: data.title,
      content: data.content,
      unlockDate: new Date(data.unlockDate),
    },
  });
  revalidatePath("/letters");
  return { success: true, letter };
}

export async function openLetter(id: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const letter = await prisma.futureLetter.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!letter) return { error: "Not found" };
  if (new Date(letter.unlockDate) > new Date()) return { error: "Not yet unlocked" };

  await prisma.futureLetter.update({ where: { id }, data: { opened: true } });
  revalidatePath("/letters");
  return { success: true };
}

export async function deleteLetter(id: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  await prisma.futureLetter.delete({ where: { id, userId: session.user.id } });
  revalidatePath("/letters");
  return { success: true };
}
