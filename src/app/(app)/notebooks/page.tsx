import { getNotebooks } from "@/actions/notebooks";
import { NotebooksView } from "@/components/notebooks/notebooks-view";

export default async function NotebooksPage() {
  const { notebooks } = await getNotebooks();
  return <NotebooksView initialNotebooks={notebooks ?? []} />;
}
