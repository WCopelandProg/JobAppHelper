import { Link } from "react-router-dom";
import { Bookmark, BookmarkCheck, MapPin, Sparkles } from "lucide-react";
import clsx from "clsx";
import { Job } from "../../types";
import { Badge } from "../common/Badge";
import { JOB_CATEGORY_LABELS, SENIORITY_LABELS } from "../../types";
import { formatRelativeDate, formatSalary } from "../../utils/format";

interface JobCardProps {
  job: Job;
  matchScore?: number | null;
  isSaved?: boolean;
  onToggleSave?: () => void;
  saving?: boolean;
}

export function JobCard({ job, matchScore, isSaved, onToggleSave, saving }: JobCardProps) {
  const salary = formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency);

  return (
    <div className="card flex flex-col gap-3 p-4 transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <Link to={`/jobs/${job.id}`} className="line-clamp-2 font-semibold text-slate-900 hover:text-brand-700">
            {job.title}
          </Link>
          <p className="text-sm text-slate-600">{job.company}</p>
        </div>
        {onToggleSave && (
          <button
            onClick={onToggleSave}
            disabled={saving}
            title={isSaved ? "Remove from saved" : "Save job"}
            className={clsx("shrink-0 rounded-lg p-1.5 transition-colors", isSaved ? "text-brand-600 hover:bg-brand-50" : "text-slate-400 hover:bg-slate-100")}
          >
            {isSaved ? <BookmarkCheck className="h-5 w-5" /> : <Bookmark className="h-5 w-5" />}
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
        {job.location && (
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" /> {job.location}
          </span>
        )}
        <span>{formatRelativeDate(job.postedAt)}</span>
        {salary && <span className="font-medium text-slate-700">{salary}</span>}
      </div>

      <div className="flex flex-wrap gap-1.5">
        <Badge variant="brand">{JOB_CATEGORY_LABELS[job.category]}</Badge>
        <Badge variant="neutral">{SENIORITY_LABELS[job.seniority]}</Badge>
        <Badge variant="neutral">{job.remoteType === "REMOTE" ? "Remote" : job.remoteType === "HYBRID" ? "Hybrid" : job.remoteType === "ONSITE" ? "Onsite" : "Flexible"}</Badge>
        {typeof matchScore === "number" && (
          <Badge variant={matchScore >= 60 ? "green" : matchScore >= 30 ? "amber" : "neutral"}>
            <Sparkles className="mr-1 h-3 w-3" />
            {matchScore}% match
          </Badge>
        )}
      </div>

      <p className="line-clamp-2 text-sm text-slate-500">{job.descriptionText}</p>

      <div className="mt-auto flex items-center justify-between pt-1">
        <Link to={`/jobs/${job.id}`} className="text-sm font-medium text-brand-600 hover:text-brand-700">
          View details
        </Link>
      </div>
    </div>
  );
}
