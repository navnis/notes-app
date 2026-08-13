import { Schema, model, Types } from "mongoose";

export interface Note {
  userId: Types.ObjectId;
  title: string;
  content: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const noteSchema = new Schema<Note>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true },
    content: { type: String, default: "" },
    tags: { type: [String], default: [] },
  },
  { timestamps: true }
);

export const NoteModel = model<Note>("Note", noteSchema);
