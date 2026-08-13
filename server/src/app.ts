import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import notesRouter from "./routes/notes.js";
import authRouter from "./routes/auth.js";
import tagsRouter from "./routes/tags.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL ?? "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get("/", (_req, res) => {
  res.json({ message: "Notes App API" });
});

app.use("/api/auth", authRouter);
app.use("/api/notes", notesRouter);
app.use("/api/tags", tagsRouter);

app.use(errorHandler);

export default app;
