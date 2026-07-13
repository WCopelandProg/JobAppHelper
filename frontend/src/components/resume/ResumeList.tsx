import { Download, FileText, Star, Trash2 } from "lucide-react";
import { Resume } from "../../types";

interface ResumeListProps {
  resumes: Resume[];
  onDelete: (id: string) => void;
  onSetPrimary: (id: string) => void;
  onDownload: (resume: Resume) => void;
}

export function ResumeList({ resumes, onDelete, onSetPrimary, onDownload }: ResumeListProps) {
  return (
    <div className="space-y-2">
      {resumes.map((resume) => (
        <div key={resume.id} className="card flex items-center justify-between p-3">
          <div className="flex min-w-0 items-center gap-3">
            <FileText className="h-5 w-5 shrink-0 text-slate-400" />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-800">{resume.fileName}</p>
              <p className="text-xs text-slate-500">
                {resume.isPrimary && <span className="mr-1.5 font-medium text-brand-600">Primary ·</span>}
                {(resume.fileSizeBytes / 1024).toFixed(0)} KB
                {resume.parsedSkills.length > 0 && ` · ${resume.parsedSkills.length} skills detected`}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 gap-1.5">
            {!resume.isPrimary && (
              <button className="btn-ghost !px-2 !py-1.5" title="Set as primary" onClick={() => onSetPrimary(resume.id)}>
                <Star className="h-4 w-4" />
              </button>
            )}
            <button className="btn-ghost !px-2 !py-1.5" title="Download" onClick={() => onDownload(resume)}>
              <Download className="h-4 w-4" />
            </button>
            <button className="btn-ghost !px-2 !py-1.5 hover:!text-red-600" title="Delete" onClick={() => onDelete(resume.id)}>
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
