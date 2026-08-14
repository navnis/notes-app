export function formatDateTime(date: Date): string {
  return date.toLocaleString();
}

// Hashtag-style: unicode letters, numbers, and underscore only — mirrors the server's tagsSchema regex.
const TAG_PATTERN = /^[\p{L}\p{N}_]+$/u;

export function isValidTag(name: string): boolean {
  return TAG_PATTERN.test(name);
}
