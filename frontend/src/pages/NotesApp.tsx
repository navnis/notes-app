import { Select } from "@/components";

const sortOptions = [
  { value: "updatedAt", label: "Recently updated" },
  { value: "createdAt", label: "Date created" },
  { value: "title", label: "Title" },
];

// Temporary showcase for reviewing components as they're built.
// Gets replaced with the real notes app shell.
export function NotesApp() {
  return (
    <div className="p-8 flex flex-col gap-2 w-56">
      <Select
        label="Sort by"
        options={sortOptions}
        placeholder="Choose a sort order"
        onChange={(value) => console.log("sort changed:", value)}
      />
    </div>
  );
}
