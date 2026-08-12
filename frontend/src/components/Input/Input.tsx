import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Icon shown at the start of the input. */
  icon?: ReactNode;
  /** Content shown at the end of the input (clear button, kbd hint, etc.). */
  trailing?: ReactNode;
  /** Validation error message. Shows a red border and this text below the input. */
  error?: string;
  /** Visible label rendered above the input. Omit to rely on aria-label alone. */
  label?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, icon, trailing, error, label, id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-foreground">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {icon && (
            <span className="pointer-events-none absolute left-3 flex items-center text-muted-foreground">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "h-9 w-full rounded-lg border bg-secondary px-3 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
              error ? "border-destructive" : "border-input",
              icon && "pl-9",
              trailing && "pr-9",
              className,
            )}
            aria-invalid={error ? true : undefined}
            {...props}
          />
          {trailing && (
            <span className="absolute right-3 flex items-center">{trailing}</span>
          )}
        </div>
        {error && (
          <p className="text-xs text-destructive" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
