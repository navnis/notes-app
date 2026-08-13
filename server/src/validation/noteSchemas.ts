import { z } from "zod";

// Trims each tag, drops empties, and dedupes case-insensitively (keeping the
// first-seen casing) — mirrors the check the editor's own tag input already
// does client-side, re-applied here since client validation can't be trusted.
const tagsSchema = z
  .array(z.string().trim())
  .transform((tags) => {
    const seen = new Set<string>();
    return tags.filter((tag) => {
      if (!tag) return false;
      const key = tag.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  })
  .optional();

export const createNoteSchema = z.object({
  title: z.string().trim().min(1, "Title is required."),
  content: z.string().optional(),
  tags: tagsSchema,
});

export type CreateNoteInput = z.infer<typeof createNoteSchema>;

export const updateNoteSchema = z.object({
  title: z.string().trim().min(1, "Title is required.").optional(),
  content: z.string().optional(),
  tags: tagsSchema,
});

export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;
