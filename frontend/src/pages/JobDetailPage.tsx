import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bookmark, BookmarkCheck, ExternalLink, MapPin, Sparkles, Users } from "lucide-react";
import toast from "react-hot-toast";
import { getJob, saveJob, unsaveJob, listSavedJobs } from "../api/jobs";
import { createApplication } from "../api/applications";
import { generateCoverLetter } from "../api/coverLetters";
import { listResumes } from "../api/resumes";
import { Spinner } from "../components/common/Spinner";
import { ErrorState } from "../components/common/ErrorState";
import { Badge } from "../components/common/Badge";
import { extractErrorMessage } from "../api/client";
import { JOB_CATEGORY_LABELS, SENIORITY_LABELS } from "../types";
import { formatRelativeDate, formatSalary } from "../utils/format";

export function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [generatingLetter, setGeneratingLetter] = useState(false);

  const jobQuery = useQuery({ queryKey: ["job", id], queryFn: () => getJob(id!), enabled: !!id });
  const savedQuery = useQuery({ queryKey: ["savedJobs"], queryFn: listSavedJobs });
  const resumesQuery = useQuery({ queryKey: ["resumes"], queryFn: listResumes });

  const isSaved = (savedQuery.data ?? []).some((s) => s.jobId === id);

  const toggleSaveMutation = useMutation({
    mutationFn: async () => (isSaved ? unsaveJob(id!) : saveJob(id!)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["savedJobs"] }),
    onError: (err) => toast.error(extractErrorMessage(err)),
  });

  const applyMutation = useMutation({
    mutationFn: async () => {
      const primaryResume = (resumesQuery.data ?? []).find((r) => r.isPrimary);
      await createApplication({ jobId: id!, status: "APPLIED", resumeId: primaryResume?.id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      queryClient.invalidateQueries({ queryKey: ["applicationStats"] });
      toast.success("Marked as applied. Track its progress on the Applications board.");
      window.open(jobQuery.data?.job.sourceUrl, "_blank", "noopener,noreferrer");
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });

  const handleGenerateCoverLetter = async () => {
    if (!id) return;
    setGeneratingLetter(true);
    try {
      const primaryResume = (resumesQuery.data ?? []).find((r) => r.isPrimary);
      await generateCoverLetter({ jobId: id, resumeId: primaryResume?.id });
      toast.success("Cover letter generated!");
      navigate("/cover-letters");
    } catch (err) {
      toast.error(extractErrorMessage(err, "Couldn't generate a cover letter."));
    } finally {
      setGeneratingLetter(false);
    }
  };

  if (jobQuery.isLoading) return <Spinner label="Loading job..." />;
  if (jobQuery.isError || !jobQuery.data) return <ErrorState message={extractErrorMessage(jobQuery.error, "Job not found.")} onRetry={() => jobQuery.refetch()} />;

  const { job, matchScore } = jobQuery.data;
  const salary = formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="card p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">{job.title}</h1>
            <p className="mt-1 text-slate-600">{job.company}</p>
          </div>
          <button
            onClick={() => toggleSaveMutation.mutate()}
            disabled={toggleSaveMutation.isPending}
            className={isSaved ? "btn-secondary !text-brand-700" : "btn-secondary"}
          >
            {isSaved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
            {isSaved ? "Saved" : "Save"}
          </button>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-500">
          {job.location && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-4 w-4" /> {job.location}
            </span>
          )}
          <span>Posted {formatRelativeDate(job.postedAt)}</span>
          {salary && <span className="font-medium text-slate-700">{salary}</span>}
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5">
          <Badge variant="brand">{JOB_CATEGORY_LABELS[job.category]}</Badge>
          <Badge variant="neutral">{SENIORITY_LABELS[job.seniority]}</Badge>
          <Badge variant="neutral">{job.remoteType}</Badge>
          {typeof matchScore === "number" && (
            <Badge variant={matchScore >= 60 ? "green" : matchScore >= 30 ? "amber" : "neutral"}>
              <Sparkles className="mr-1 h-3 w-3" />
              {matchScore}% match
            </Badge>
          )}
        </div>

        {job.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {job.tags.map((tag) => (
              <span key={tag} className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          <button className="btn-primary" onClick={() => applyMutation.mutate()} disabled={applyMutation.isPending}>
            <ExternalLink className="h-4 w-4" />
            {applyMutation.isPending ? "Opening..." : "Apply on company site"}
          </button>
          <button className="btn-secondary" onClick={handleGenerateCoverLetter} disabled={generatingLetter}>
            <Sparkles className="h-4 w-4" />
            {generatingLetter ? "Generating..." : "Generate cover letter"}
          </button>
          <button className="btn-ghost" onClick={() => navigate(`/networking?company=${encodeURIComponent(job.company)}`)}>
            <Users className="h-4 w-4" />
            Find connections at {job.company}
          </button>
        </div>

        <hr className="my-6 border-slate-200" />

        <div className="whitespace-pre-line text-sm leading-relaxed text-slate-700">{job.descriptionText}</div>
      </div>
    </div>
  );
}
