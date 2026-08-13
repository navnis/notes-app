const PREVIEW_MAX_LENGTH = 140;

// Strips the most common Markdown syntax down to plain text for the note
// list's preview line — doesn't need to be exhaustive, just readable.
export function toPreviewText(content: string): string {
  const plainText = content
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[.*?\]\(.*?\)/g, " ")
    .replace(/\[(.*?)\]\(.*?\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/[*_~`>#-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return plainText.length > PREVIEW_MAX_LENGTH
    ? `${plainText.slice(0, PREVIEW_MAX_LENGTH).trimEnd()}…`
    : plainText;
}
