import { useId } from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SelectOption } from "./types";

export interface SelectProps {
  options: SelectOption[];
  label?: string;
  error?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  "aria-label"?: string;
}

export function Select({
  options,
  label,
  error,
  placeholder,
  className,
  disabled,
  value,
  defaultValue,
  onChange,
  ...props
}: SelectProps) {
  const generatedId = useId();

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={generatedId} className="text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      <SelectPrimitive.Root
        value={value}
        defaultValue={defaultValue}
        onValueChange={onChange}
        disabled={disabled}
      >
        <SelectPrimitive.Trigger
          id={generatedId}
          aria-label={props["aria-label"]}
          aria-invalid={error ? true : undefined}
          className={cn(
            "flex h-9 w-full cursor-pointer items-center justify-between gap-2 rounded-lg border bg-secondary px-3 text-sm text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[placeholder]:text-muted-foreground",
            error ? "border-destructive" : "border-input",
            className,
          )}
        >
          <span className="min-w-0 flex-1 truncate text-left">
            <SelectPrimitive.Value placeholder={placeholder} />
          </span>
          <SelectPrimitive.Icon className="shrink-0">
            <ChevronDown className="size-4 text-muted-foreground" />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>
        <SelectPrimitive.Portal>
          <SelectPrimitive.Content
            position="popper"
            sideOffset={4}
            className="z-50 overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-lg"
          >
            <SelectPrimitive.Viewport className="p-1">
              {options.map((option) => (
                <SelectPrimitive.Item
                  key={option.value}
                  value={option.value}
                  className="relative flex cursor-pointer select-none items-center rounded-md py-1.5 pl-8 pr-3 text-sm outline-none data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground"
                >
                  <span className="absolute left-2 flex size-4 items-center justify-center">
                    <SelectPrimitive.ItemIndicator>
                      <Check className="size-4" />
                    </SelectPrimitive.ItemIndicator>
                  </span>
                  <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
                </SelectPrimitive.Item>
              ))}
            </SelectPrimitive.Viewport>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
      {error && (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
