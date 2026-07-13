import { KeyboardEvent, useState } from "react";
import { X } from "lucide-react";

interface TagInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
}

export function TagInput({ value, onChange, placeholder }: TagInputProps) {
  const [draft, setDraft] = useState("");

  const addTag = () => {
    const tag = draft.trim();
    if (tag && !value.includes(tag)) {
      onChange([...value, tag]);
    }
    setDraft("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    } else if (e.key === "Backspace" && !draft && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  return (
    <div className="input flex flex-wrap items-center gap-1.5" onClick={() => document.getElementById(`tag-input-${placeholder}`)?.focus()}>
      {value.map((tag) => (
        <span key={tag} className="badge bg-brand-100 text-brand-700">
          {tag}
          <button
            type="button"
            className="ml-1"
            onClick={(e) => {
              e.stopPropagation();
              onChange(value.filter((t) => t !== tag));
            }}
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <input
        id={`tag-input-${placeholder}`}
        className="min-w-[100px] flex-1 border-none p-0 text-sm outline-none focus:ring-0"
        value={draft}
        placeholder={value.length === 0 ? placeholder : ""}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={addTag}
      />
    </div>
  );
}
