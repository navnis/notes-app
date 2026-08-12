import { Router } from "express";
import type { HydratedDocument } from "mongoose";
import { NoteModel, type Note } from "../models/Note.js";
import { requireAuth, type AuthedRequest } from "../middleware/requireAuth.js";
import { createNoteSchema, updateNoteSchema } from "../validation/noteSchemas.js";
import { handleRouteError } from "../utils/handleRouteError.js";
import { AppError } from "../utils/AppError.js";

const router = Router();

// Shapes a Mongoose note doc into the shared `Note` response type (`id`,
// no `userId`/`__v` exposed to the client).
function toNoteResponse(note: HydratedDocument<Note>) {
  return {
    id: note.id,
    title: note.title,
    content: note.content,
    createdAt: note.createdAt,
    updatedAt: note.updatedAt,
  };
}

router.get("/", async (_req, res) => {
  const notes = await NoteModel.find().sort({ updatedAt: -1 });
  res.json(notes);
});

router.get("/:id", async (req, res) => {
  const note = await NoteModel.findById(req.params.id);
  if (!note) {
    res.status(404).json({ message: "Note not found" });
    return;
  }
  res.json(note);
});

router.post("/", requireAuth, async (req, res) => {
  try {
    const { title, content } = createNoteSchema.parse(req.body);
    const note = await NoteModel.create({ userId: (req as AuthedRequest).userId, title, content });
    res.status(201).json(toNoteResponse(note));
  } catch (error) {
    handleRouteError(error, res, "Create note");
  }
});

router.put("/:id", requireAuth, async (req, res) => {
  try {
    const { title, content } = updateNoteSchema.parse(req.body);
    const note = await NoteModel.findOne({
      _id: req.params.id,
      userId: (req as AuthedRequest).userId,
    });
    if (!note) {
      // Same 404 whether the note doesn't exist or belongs to someone else —
      // don't reveal which, to another user.
      throw new AppError(404, "Note not found");
    }

    if (title !== undefined) note.title = title;
    if (content !== undefined) note.content = content;
    await note.save();

    res.json(toNoteResponse(note));
  } catch (error) {
    handleRouteError(error, res, "Update note");
  }
});

router.delete("/:id", async (req, res) => {
  const note = await NoteModel.findByIdAndDelete(req.params.id);
  if (!note) {
    res.status(404).json({ message: "Note not found" });
    return;
  }
  res.json({ message: "Note deleted" });
});

export default router;
