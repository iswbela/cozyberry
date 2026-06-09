import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getNotes } from "@/actions/notebooks";
import { NotebookDetail } from "@/components/notebooks/notebook-detail";

export default async function NotebookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return notFound();

  const notebook = await prisma.notebook.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!notebook) return notFound();

  const { notes } = await getNotes(id);

  return <NotebookDetail notebook={notebook} initialNotes={notes ?? []} />;
}
