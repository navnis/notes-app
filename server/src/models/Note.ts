import { Schema, model, Types } from "mongoose";

export interface Note {
  userId: Types.ObjectId;
  title: string;
  content: string;
  tags: string[];
  isFavorite: boolean;
  isPinned: boolean;
  // Set when isPinned flips true, cleared to null when unpinned — lets pinned notes sort by
  // pin order specifically, since updatedAt also changes on unrelated title/content/tag edits.
  pinnedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const noteSchema = new Schema<Note>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true },
    content: { type: String, default: "" },
    tags: { type: [String], default: [] },
    // Indexed so GET /api/notes?view=favorites/pinned's countDocuments() is an index scan, not a collection scan.
    isFavorite: { type: Boolean, default: false, index: true },
    isPinned: { type: Boolean, default: false, index: true },
    pinnedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export const NoteModel = model<Note>("Note", noteSchema);
