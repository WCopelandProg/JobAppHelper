import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Copy, Mail, Sparkles, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { deleteCoverLetter, listCoverLetters, updateCoverLetter } from "../api/coverLetters";
import { Spinner } from "../components/common/Spinner";
import { ErrorState } from "../components/common/ErrorState";
import { EmptyState } from "../components/common/EmptyState";
import { extractErrorMessage } from "../api/client";
import { Badge } from "../components/common/Badge";
import { Link } from "react-router-dom";
import { CoverLetter } from "../types";

export function CoverLettersPage() {
  const queryClient = useQueryClient();
  const lettersQuery = useQuery({ queryKey: ["coverLetters"], queryFn: listCoverLetters });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  const letters = lettersQuery.data ?? [];
  const selected = letters.find((l) => l.id === selectedId) ?? letters[0] ?? null;

  useEffect(() => {
    if (selected) {
      setSelectedId(selected.id);
      setContent(selected.content);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected?.id]);

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await updateCoverLetter(selected.id, content);
      queryClient.invalidateQueries({ queryKey: ["coverLetters"] });
      toast.success("Cover letter saved");
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (letter: CoverLetter) => {
    try {
      await deleteCoverLetter(letter.id);
      queryClient.invalidateQueries({ queryKey: ["coverLetters"] });
      if (selectedId === letter.id) setSelectedId(null);
      toast.success("Cover letter deleted");
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    toast.success("Copied to clipboard");
  };

  if (lettersQuery.isLoading) return <Spinner label="Loading cover letters..." />;
  if (lettersQuery.isError) return <ErrorState message={extractErrorMessage(lettersQuery.error)} onRetry={() => lettersQuery.refetch()} />;

  if (letters.length === 0) {
    return (
      <EmptyState
        icon={Mail}
        title="No cover letters yet"
        description="Open any job and click “Generate cover letter” to create one tailored to that role."
        action={
          <Link to="/jobs" className="btn-primary">
            Browse jobs
          </Link>
        }
      />
    );
  }

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold text-slate-900">Cover Letters</h1>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
        <div className="space-y-2">
          {letters.map((letter) => (
            <button
              key={letter.id}
              onClick={() => setSelectedId(letter.id)}
              className={`card block w-full p-3 text-left transition-colors ${selected?.id === letter.id ? "border-brand-400 ring-1 ring-brand-400" : ""}`}
            >
              <p className="truncate text-sm font-medium text-slate-900">{letter.job.title}</p>
              <p className="truncate text-xs text-slate-500">{letter.job.company}</p>
              <div className="mt-1.5 flex items-center gap-1.5">
                <Badge variant={letter.method === "AI" ? "brand" : "neutral"}>
                  {letter.method === "AI" ? (
                    <>
                      <Sparkles className="mr-1 h-3 w-3" />
                      AI
                    </>
                  ) : (
                    "Template"
                  )}
                </Badge>
              </div>
            </button>
          ))}
        </div>

        {selected && (
          <div className="card p-4">
            <div className="mb-3 flex items-start justify-between">
              <div>
                <h2 className="font-semibold text-slate-900">{selected.job.title}</h2>
                <p className="text-sm text-slate-500">{selected.job.company}</p>
              </div>
              <div className="flex gap-2">
                <button className="btn-ghost !px-2 !py-1.5" onClick={handleCopy} title="Copy">
                  <Copy className="h-4 w-4" />
                </button>
                <button className="btn-ghost !px-2 !py-1.5 hover:!text-red-600" onClick={() => handleDelete(selected)} title="Delete">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <textarea
              className="input min-h-[400px] font-sans text-sm leading-relaxed"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <div className="mt-3 flex justify-end">
              <button className="btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save changes"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
