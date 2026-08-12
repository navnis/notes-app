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
import { moveToNewLine, prefixLines, wrapSelection } from "./MarkdownEditor.utils";

export interface MarkdownEditorProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Visible label rendered above the field. */
  label?: string;
  /** Validation error message. Shows a red border and this text below the field. */
  error?: string;
  /** Renders the markdown preview instead of the editable textarea + toolbar; toggling is owned by the parent. */
  preview?: boolean;
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
