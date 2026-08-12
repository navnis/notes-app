import type { ComponentPropsWithoutRef } from "react";
import type { Components } from "react-markdown";
import { cn } from "@/lib/utils";

export type ToolbarCommand = "bold" | "italic" | "heading" | "code" | "quote" | "list" | "task";

export interface ToolbarItem {
  command: ToolbarCommand;
  label: string;
  ariaLabel: string;
  className?: string;
}

export const TOOLBAR_ITEMS: ToolbarItem[] = [
  { command: "bold", label: "B", ariaLabel: "Bold", className: "font-bold" },
  { command: "italic", label: "I", ariaLabel: "Italic", className: "italic" },
  { command: "heading", label: "H1", ariaLabel: "Heading" },
  { command: "code", label: "</>", ariaLabel: "Code" },
  { command: "quote", label: "”", ariaLabel: "Quote" },
  { command: "list", label: "• List", ariaLabel: "Bulleted list" },
  { command: "task", label: "☑ Task", ariaLabel: "Task list" },
];

export const TOOLBAR_BUTTON_CLASSNAME =
  "rounded-md px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

// Tailwind's preflight strips native heading/list/code styling, so the
// rendered preview needs its own component overrides to look like anything.
function codeRenderer({ className, children, ...props }: ComponentPropsWithoutRef<"code">) {
  const isBlock = /language-/.test(className ?? "");
  return (
    <code
      className={cn(
        "font-mono text-[0.85em]",
        isBlock ? className : "rounded bg-accent px-1 py-0.5 text-accent-foreground",
      )}
      {...props}
    >
      {children}
    </code>
  );
}

export const MARKDOWN_COMPONENTS: Components = {
  h1: ({ children, ...props }) => (
    <h1 className="mb-2 mt-4 text-xl font-bold first:mt-0" {...props}>
      {children}
    </h1>
  ),
  h2: ({ children, ...props }) => (
    <h2 className="mb-2 mt-4 text-lg font-bold first:mt-0" {...props}>
      {children}
    </h2>
  ),
  h3: ({ children, ...props }) => (
    <h3 className="mb-1 mt-3 text-base font-semibold first:mt-0" {...props}>
      {children}
    </h3>
  ),
  p: (props) => <p className="mb-2 leading-relaxed last:mb-0" {...props} />,
  ul: (props) => <ul className="mb-2 list-disc space-y-1 pl-5 last:mb-0" {...props} />,
  ol: (props) => <ol className="mb-2 list-decimal space-y-1 pl-5 last:mb-0" {...props} />,
  blockquote: (props) => (
    <blockquote
      className="mb-2 border-l-2 border-border pl-3 text-muted-foreground italic last:mb-0"
      {...props}
    />
  ),
  a: ({ children, ...props }) => (
    <a className="text-primary underline underline-offset-2" {...props}>
      {children}
    </a>
  ),
  code: codeRenderer,
  pre: (props) => (
    <pre
      className="mb-2 overflow-x-auto rounded-md border border-border bg-card p-3 last:mb-0"
      {...props}
    />
  ),
  table: (props) => (
    <table className="mb-2 w-full border-collapse text-left text-sm last:mb-0" {...props} />
  ),
  th: (props) => <th className="border border-border bg-secondary px-2 py-1 font-semibold" {...props} />,
  td: (props) => <td className="border border-border px-2 py-1" {...props} />,
};
