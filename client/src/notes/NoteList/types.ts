import type { Tag as TagData } from "@notes/shared";

export interface NoteListItem {
  id: string;
  emoji?: string;
  title: string;
  preview?: string;
  tags: Pick<TagData, "id" | "name">[];
  updatedAt: string | Date;
  createdAt?: string | Date;
}
