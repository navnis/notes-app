import { Router } from "express";
import { Types } from "mongoose";
import { NoteModel } from "../models/Note.js";
import { requireAuth, type AuthedRequest } from "../middleware/requireAuth.js";
import { handleRouteError } from "../utils/handleRouteError.js";

const router = Router();


// sorted most-used first (ties broken alphabetically).
router.get("/", requireAuth, async (req, res) => {
  try {
    
    const userId = new Types.ObjectId((req as AuthedRequest).userId);
    const tags = await NoteModel.aggregate<{ name: string; count: number }>([
      { $match: { userId } },
      { $unwind: "$tags" },
      { $group: { _id: "$tags", count: { $sum: 1 } } },
      { $sort: { count: -1, _id: 1 } },
      { $project: { _id: 0, name: "$_id", count: 1 } },
    ]);
    res.json(tags);
  } catch (error) {
    handleRouteError(error, res, "List tags");
  }
});

export default router;
