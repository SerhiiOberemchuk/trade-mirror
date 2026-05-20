import { revalidatePath, updateTag } from "next/cache";

export function invalidateAfterMutation({
  paths,
  tags,
}: {
  paths: string[];
  tags: string[];
}) {
  for (const tag of tags) {
    updateTag(tag);
  }

  for (const path of paths) {
    revalidatePath(path);
  }
}
