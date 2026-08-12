import { cva } from "class-variance-authority";

export const tagVariants = cva(
  "inline-flex items-center gap-1 rounded-md px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      selected: {
        true: "bg-primary text-primary-foreground",
        false: "bg-accent text-accent-foreground",
      },
    },
    defaultVariants: {
      selected: false,
    },
  },
);
