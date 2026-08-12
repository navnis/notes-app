import express from "express";
import cors from "cors";
import notesRouter from "./routes/notes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ message: "Notes App API" });
});

app.use("/api/notes", notesRouter);

export default app;
