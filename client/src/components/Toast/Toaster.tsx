import { useSyncExternalStore } from "react";
import { Toast } from "./Toast";
import { getToasts, removeToast, subscribe } from "./toastStore";

/** Mount once near the app root. toast.success()/toast.error() work from anywhere once this is mounted. */
export function Toaster() {
  const toasts = useSyncExternalStore(subscribe, getToasts);

  return (
    <div className="fixed top-6 right-6 z-50 flex flex-col items-end gap-2">
      {toasts.map((item) => (
        <Toast key={item.id} toast={item} onDismiss={removeToast} />
      ))}
    </div>
  );
}
