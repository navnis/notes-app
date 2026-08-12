import { useState } from "react";
import { Search, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components";

// Temporary showcase for reviewing components as they're built.
// Gets replaced with the real notes app shell.
export function NotesApp() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="p-8 flex flex-col gap-6 items-start">
      <div className="flex flex-col gap-2 w-72">
        <p className="text-xs italic text-muted-foreground">
          demo caption — no `label` prop used, aria-label only
        </p>
        <Input
          aria-label="Search notes"
          placeholder="Search titles, body, or tags..."
          icon={<Search className="size-4" />}
          trailing={
            <kbd className="text-[10px] text-muted-foreground border border-border rounded px-1">
              /
            </kbd>
          }
        />
      </div>

      <div className="flex flex-col gap-2 w-72">
        <p className="text-xs italic text-muted-foreground">
          demo caption — no `label` prop used, aria-label only
        </p>
        <Input aria-label="Add tag" placeholder="+ Add tag (Press Enter)" />
      </div>

      <div className="flex flex-col gap-2 w-72">
        <p className="text-xs italic text-muted-foreground">
          demo caption — "Email" below IS the real `label` prop
        </p>
        <Input label="Email" defaultValue="not-an-email" error="Enter a valid email address" />
      </div>

      <div className="flex flex-col gap-2 w-72">
        <p className="text-xs italic text-muted-foreground">
          demo caption — no `label` prop used, aria-label only
        </p>
        <Input
          aria-label="Password"
          type={showPassword ? "text" : "password"}
          defaultValue="hunter2"
          trailing={
            <button
              type="button"
              className="cursor-pointer text-muted-foreground hover:text-foreground"
              onClick={() => setShowPassword((current) => !current)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          }
        />
      </div>
    </div>
  );
}
