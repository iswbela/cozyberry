import { getTags } from "@/actions/tags";
import { TagsManager } from "@/components/tags/tags-manager";

export default async function TagsPage() {
  const tags = await getTags();
  return <TagsManager initialTags={tags} />;
}
