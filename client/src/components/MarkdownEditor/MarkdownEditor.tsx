import {
  forwardRef,
  memo,
  useCallback,
  useId,
  useMemo,
  useRef,
  type TextareaHTMLAttributes,
} from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import {
  MARKDOWN_COMPONENTS,
  TOOLBAR_BUTTON_CLASSNAME,
  TOOLBAR_ITEMS,
  type ToolbarCommand,
} from "./MarkdownEditor.constants";

export interface MarkdownEditorProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Visible label rendered above the field. */
  label?: string;
  /** Validation error message. Shows a red border and this text below the field. */
  error?: string;
  /** Renders the markdown preview instead of the editable textarea + toolbar; toggling is owned by the parent. */
  preview?: boolean;
}

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
function moveToNewLine(textarea: HTMLTextAreaElement) {
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
function wrapSelection(
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
function prefixLines(textarea: HTMLTextAreaElement, prefix: string) {
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

export const MarkdownEditor = memo(
  forwardRef<HTMLTextAreaElement, MarkdownEditorProps>(
    ({ className, label, error, id, value, rows = 8, preview, ...props }, ref) => {
      const generatedId = useId();
      const fieldId = id ?? generatedId;
      const internalRef = useRef<HTMLTextAreaElement | null>(null);

      const setTextareaRef = useCallback(
        (node: HTMLTextAreaElement | null) => {
          internalRef.current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) ref.current = node;
        },
        [ref],
      );

      const text = typeof value === "string" ? value : "";
      const wordCount = useMemo(
        () => (text.trim() ? text.trim().split(/\s+/).length : 0),
        [text],
      );

      const runCommand = useCallback((command: ToolbarCommand) => {
        const textarea = internalRef.current;
        if (!textarea) return;
        if (textarea.selectionStart === textarea.selectionEnd) {
          moveToNewLine(textarea);
        }
        switch (command) {
          case "bold":
            return wrapSelection(textarea, "**", "**", "bold text");
          case "italic":
            return wrapSelection(textarea, "_", "_", "italic text");
          case "code":
            return wrapSelection(textarea, "`", "`", "code");
          case "heading":
            return prefixLines(textarea, "# ");
          case "quote":
            return prefixLines(textarea, "> ");
          case "list":
            return prefixLines(textarea, "- ");
          case "task":
            return prefixLines(textarea, "- [ ] ");
        }
      }, []);

      return (
        <div className="flex flex-col gap-1">
          {label && (
            <label htmlFor={fieldId} className="text-sm font-medium text-foreground">
              {label}
            </label>
          )}

          {preview ? (
            <div
              className={cn(
                "min-h-40 w-full rounded-lg border bg-secondary px-3 py-2 text-sm text-foreground",
                error ? "border-destructive" : "border-input",
                className,
              )}
            >
              {text ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={MARKDOWN_COMPONENTS}>
                  {text}
                </ReactMarkdown>
              ) : (
                <p className="text-muted-foreground">Nothing to preview yet.</p>
              )}
            </div>
          ) : (
            <div
              className={cn(
                "w-full rounded-lg border bg-secondary transition-colors focus-within:ring-2 focus-within:ring-ring",
                error ? "border-destructive" : "border-input",
                className,
              )}
            >
              <div className="flex items-center justify-between gap-2 border-b border-border px-2 py-1.5">
                <div className="flex items-center gap-0.5">
                  {TOOLBAR_ITEMS.map((item) => (
                    <button
                      key={item.command}
                      type="button"
                      aria-label={item.ariaLabel}
                      onClick={() => runCommand(item.command)}
                      className={cn(TOOLBAR_BUTTON_CLASSNAME, item.className)}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
                <span className="whitespace-nowrap text-xs text-muted-foreground">
                  {wordCount} {wordCount === 1 ? "word" : "words"} • {text.length} chars
                </span>
              </div>
              <textarea
                ref={setTextareaRef}
                id={fieldId}
                value={value}
                rows={rows}
                className="w-full resize-y bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                aria-invalid={error ? true : undefined}
                {...props}
              />
            </div>
          )}

          {error && (
            <p className="text-xs text-destructive" role="alert">
              {error}
            </p>
          )}
        </div>
      );
    },
  ),
);

MarkdownEditor.displayName = "MarkdownEditor";
