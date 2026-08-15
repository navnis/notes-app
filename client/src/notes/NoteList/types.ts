export interface NoteListItem {
  id: string;
  emoji?: string;
  title: string;
  preview?: string;
  tags: string[];
  isFavorite?: boolean;
  isPinned?: boolean;
  updatedAt: string | Date;
  createdAt?: string | Date;
}
