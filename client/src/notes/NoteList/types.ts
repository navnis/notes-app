export interface NoteListItem {
  id: string;
  emoji?: string;
  title: string;
  preview?: string;
  tags: string[];
  updatedAt: string | Date;
  createdAt?: string | Date;
}
