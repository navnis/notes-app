import { useEffect, useId, useRef, type MouseEvent, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/Button";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  /** Custom body content. Takes over the default Cancel/Confirm footer entirely when given. */
  children?: ReactNode;
  className?: string;
  /** Renders a default Cancel/Confirm footer when set (and no children override it). Cancel always calls onClose. */
  onConfirm?: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: "primary" | "danger";
  /** Shows a spinner on the Confirm button and disables both footer buttons. */
  confirmLoading?: boolean;
}

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  className,
  onConfirm,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  confirmVariant = "primary",
  confirmLoading = false,
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  // Keep the native <dialog>'s open/closed state in sync with the `open` prop.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  // The dialog can also close itself natively (Escape key fires "cancel" then
  // "close") — tell the parent so its `open` state stays in sync either way.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    dialog.addEventListener("close", onClose);
    return () => dialog.removeEventListener("close", onClose);
  }, [onClose]);

  const handleBackdropClick = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === dialogRef.current) {
      onClose();
    }
  };

  const footer = children ?? (onConfirm && (
    <div className="flex justify-end gap-2">
      <Button variant="ghost" onClick={onClose} disabled={confirmLoading}>
        {cancelLabel}
      </Button>
      <Button variant={confirmVariant} onClick={onConfirm} loading={confirmLoading}>
        {confirmLabel}
      </Button>
    </div>
  ));

  return (
    // Backdrop-click-to-dismiss — Escape already closes the dialog natively, no keyboard equivalent needed.
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
    <dialog
      ref={dialogRef}
      onClick={handleBackdropClick}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      className={cn(
        "m-auto w-full max-w-md rounded-lg border border-border bg-card p-6 text-card-foreground shadow-lg backdrop:bg-black/50",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <h2 id={titleId} className="text-lg font-semibold">
          {title}
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="cursor-pointer text-muted-foreground hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      </div>
      {description && (
        <p id={descriptionId} className="mt-2 text-sm text-muted-foreground">
          {description}
        </p>
      )}
      {footer && <div className="mt-4">{footer}</div>}
    </dialog>
  );
}
