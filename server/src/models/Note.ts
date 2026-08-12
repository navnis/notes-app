import { Schema, model } from "mongoose";

export interface Note {
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const noteSchema = new Schema<Note>(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, default: "" },
  },
  { timestamps: true }
);

export const NoteModel = model<Note>("Note", noteSchema);
