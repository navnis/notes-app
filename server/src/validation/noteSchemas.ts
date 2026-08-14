import { z } from "zod";

// Hashtag-style: unicode letters, numbers, and underscore only — no spaces or other punctuation.
// Empty string is allowed through here too, since a whitespace-only tag trims to "" and is dropped below.
const TAG_PATTERN = /^[\p{L}\p{N}_]*$/u;

// Trims each tag, drops empties, and dedupes case-insensitively (keeping first-seen casing).
const tagsSchema = z
  .array(
    z
      .string()
      .trim()
      .regex(TAG_PATTERN, "Tags can only contain letters, numbers, and underscores — no spaces."),
  )
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
