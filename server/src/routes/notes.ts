import { Router } from "express";
import { NoteModel } from "../models/Note.js";

const router = Router();

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

router.post("/", async (req, res) => {
  const { title, content } = req.body;
  const note = await NoteModel.create({ title, content });
  res.status(201).json(note);
});

router.put("/:id", async (req, res) => {
  const { title, content } = req.body;
  const note = await NoteModel.findByIdAndUpdate(
    req.params.id,
    { title, content },
    { new: true, runValidators: true }
  );
  if (!note) {
    res.status(404).json({ message: "Note not found" });
    return;
  }
  res.json(note);
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
