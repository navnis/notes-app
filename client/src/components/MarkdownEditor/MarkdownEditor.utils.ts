// Sets value through the native setter + a real "input" event so the consumer's onChange fires.
function setNativeValue(textarea: HTMLTextAreaElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(
    window.HTMLTextAreaElement.prototype,
    "value",
  )?.set;
  setter?.call(textarea, value);
  textarea.dispatchEvent(new Event("input", { bubbles: true }));
}

// With nothing selected, drops the cursor onto a fresh new line below the
// current one instead of formatting whatever text it happens to sit in.
export function moveToNewLine(textarea: HTMLTextAreaElement) {
  const { selectionStart, value } = textarea;
  const lineEndIndex = value.indexOf("\n", selectionStart);
  const lineEnd = lineEndIndex === -1 ? value.length : lineEndIndex;
  const lineStart = value.lastIndexOf("\n", selectionStart - 1) + 1;
  if (lineStart === lineEnd) return; // already on an empty line

  const newValue = value.slice(0, lineEnd) + "\n" + value.slice(lineEnd);
  setNativeValue(textarea, newValue);
  const cursor = lineEnd + 1;
  textarea.setSelectionRange(cursor, cursor);
}

// Wraps the selection (or a placeholder) with before/after markers — bold/italic/inline code.
export function wrapSelection(
  textarea: HTMLTextAreaElement,
  before: string,
  after: string,
  placeholder: string,
) {
  const { selectionStart, selectionEnd, value } = textarea;
  const selected = value.slice(selectionStart, selectionEnd) || placeholder;
  const newValue =
    value.slice(0, selectionStart) + before + selected + after + value.slice(selectionEnd);
  setNativeValue(textarea, newValue);
  const cursorStart = selectionStart + before.length;
  requestAnimationFrame(() => {
    textarea.focus();
    textarea.setSelectionRange(cursorStart, cursorStart + selected.length);
  });
}

// Prefixes every line touched by the selection — headings/quotes/lists/tasks.
export function prefixLines(textarea: HTMLTextAreaElement, prefix: string) {
  const { selectionStart, selectionEnd, value } = textarea;
  const lineStart = value.lastIndexOf("\n", selectionStart - 1) + 1;
  const lineEndIndex = value.indexOf("\n", selectionEnd);
  const lineEnd = lineEndIndex === -1 ? value.length : lineEndIndex;
  const block = value.slice(lineStart, lineEnd);

  const prefixed = block
    .split("\n")
    .map((line) => (line.startsWith(prefix) ? line : prefix + line))
    .join("\n");
  if (prefixed === block) return;

  const newValue = value.slice(0, lineStart) + prefixed + value.slice(lineEnd);
  setNativeValue(textarea, newValue);
  const delta = prefixed.length - block.length;
  requestAnimationFrame(() => {
    textarea.focus();
    textarea.setSelectionRange(selectionStart + prefix.length, selectionEnd + delta);
  });
}
