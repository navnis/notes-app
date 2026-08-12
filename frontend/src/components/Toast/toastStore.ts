export type ToastVariant = "success" | "error";

export interface ToastItem {
  id: string;
  message: string;
  variant: ToastVariant;
}

const DURATION_MS = 4000;

let toasts: ToastItem[] = [];
let listeners: Array<() => void> = [];
let idCounter = 0;

function notify() {
  listeners.forEach((listener) => listener());
}

/** Used by Toaster (via useSyncExternalStore) to know when to re-render. */
export function subscribe(listener: () => void) {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

export function getToasts() {
  return toasts;
}

export function removeToast(id: string) {
  toasts = toasts.filter((t) => t.id !== id);
  notify();
}

function addToast(message: string, variant: ToastVariant) {
  idCounter += 1;
  const id = `toast-${idCounter}`;
  toasts = [...toasts, { id, message, variant }];
  notify();
  setTimeout(() => removeToast(id), DURATION_MS);
  return id;
}

/** Call from anywhere in the app — no context or component tree required. */
export const toast = {
  success: (message: string) => addToast(message, "success"),
  error: (message: string) => addToast(message, "error"),
};

/** Test-only escape hatch — the store is a module-level singleton, so tests need a way to reset it between runs. */
export function __resetToastStoreForTests() {
  toasts = [];
  listeners = [];
  idCounter = 0;
}
