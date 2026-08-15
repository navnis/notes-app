import { Router } from "express";
import type { HydratedDocument } from "mongoose";
import { NoteModel, type Note } from "../models/Note.js";
import { requireAuth, type AuthedRequest } from "../middleware/requireAuth.js";
import { createNoteSchema, updateNoteSchema } from "../validation/noteSchemas.js";
import { handleRouteError } from "../utils/handleRouteError.js";
import { AppError } from "../utils/AppError.js";
import { parseListNotesQuery } from "./notes.utils.js";

const router = Router();

// Shapes a Mongoose note doc into the shared `Note` response type (`id`,
// no `userId`/`__v` exposed to the client).
function toNoteResponse(note: HydratedDocument<Note>) {
  return {
    id: note.id,
    title: note.title,
    content: note.content,
    tags: note.tags,
    isFavorite: note.isFavorite,
    isPinned: note.isPinned,
    pinnedAt: note.pinnedAt,
    createdAt: note.createdAt,
    updatedAt: note.updatedAt,
  };
}

router.get("/", requireAuth, async (req, res) => {
  try {
    const userId = (req as AuthedRequest).userId;
    const { page, limit, sortField, filter } = parseListNotesQuery(userId, req.query);

    // allNotesCount/favoritesCount/pinnedCount are always scoped to just the user (not the
    // active search/tag/view filter) — the sidebar's counts shouldn't shrink when you're viewing a filtered list.
    const [notes, total, allNotesCount, favoritesCount, pinnedCount] = await Promise.all([
      // Pinned notes always float to the top, most-recently-pinned first; everything else
      // (and pinned notes relative to each other beyond pin order) follows the normal sort.
      NoteModel.find(filter)
        .sort({ isPinned: -1, pinnedAt: -1, [sortField]: sortField === "title" ? 1 : -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      NoteModel.countDocuments(filter),
      NoteModel.countDocuments({ userId }),
      NoteModel.countDocuments({ userId, isFavorite: true }),
      NoteModel.countDocuments({ userId, isPinned: true }),
    ]);

    res.json({
      notes: notes.map(toNoteResponse),
      page,
      limit,
      total,
      hasMore: page * limit < total,
      allNotesCount,
      favoritesCount,
      pinnedCount,
    });
  } catch (error) {
    handleRouteError(error, res, "List notes");
  }
});

router.get("/:id", requireAuth, async (req, res) => {
  try {
    const note = await NoteModel.findOne({
      _id: req.params.id,
      userId: (req as AuthedRequest).userId,
    });
    if (!note) {
      throw new AppError(404, "Note not found");
    }
    res.json(toNoteResponse(note));
  } catch (error) {
    handleRouteError(error, res, "Get note");
  }
});

router.post("/", requireAuth, async (req, res) => {
  try {
    const { title, content, tags } = createNoteSchema.parse(req.body);
    const note = await NoteModel.create({ userId: (req as AuthedRequest).userId, title, content, tags });
    res.status(201).json(toNoteResponse(note));
  } catch (error) {
    handleRouteError(error, res, "Create note");
  }
});

router.patch("/:id", requireAuth, async (req, res) => {
  try {
    const { title, content, tags, isFavorite, isPinned } = updateNoteSchema.parse(req.body);
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
    if (tags !== undefined) note.tags = tags;
    if (isFavorite !== undefined) note.isFavorite = isFavorite;
    if (isPinned !== undefined) {
      note.isPinned = isPinned;
      note.pinnedAt = isPinned ? new Date() : null;
    }

    // Pin/favorite are metadata, not edits — they shouldn't bump updatedAt the way
    // title/content/tags changes do (Mongoose's timestamps:true bumps it on every save() by default).
    const isRealEdit = title !== undefined || content !== undefined || tags !== undefined;
    await note.save({ timestamps: isRealEdit });

    res.json(toNoteResponse(note));
  } catch (error) {
    handleRouteError(error, res, "Update note");
  }
});

router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const note = await NoteModel.findOneAndDelete({
      _id: req.params.id,
      userId: (req as AuthedRequest).userId,
    });
    if (!note) {
      throw new AppError(404, "Note not found");
    }
    res.json({ message: "Note deleted" });
  } catch (error) {
    handleRouteError(error, res, "Delete note");
  }
});

export default router;
