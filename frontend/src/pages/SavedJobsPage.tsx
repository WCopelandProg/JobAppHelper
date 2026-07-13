import { useQuery, useQueryClient } from "@tanstack/react-query";
import { BookmarkX } from "lucide-react";
import toast from "react-hot-toast";
import { listSavedJobs, unsaveJob } from "../api/jobs";
import { JobCard } from "../components/jobs/JobCard";
import { Spinner } from "../components/common/Spinner";
import { ErrorState } from "../components/common/ErrorState";
import { EmptyState } from "../components/common/EmptyState";
import { extractErrorMessage } from "../api/client";
import { Link } from "react-router-dom";

export function SavedJobsPage() {
  const queryClient = useQueryClient();
  const savedQuery = useQuery({ queryKey: ["savedJobs"], queryFn: listSavedJobs });

  const handleUnsave = async (jobId: string) => {
    try {
      await unsaveJob(jobId);
      queryClient.invalidateQueries({ queryKey: ["savedJobs"] });
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold text-slate-900">Saved Jobs</h1>

      {savedQuery.isLoading && <Spinner label="Loading saved jobs..." />}
      {savedQuery.isError && <ErrorState message={extractErrorMessage(savedQuery.error)} onRetry={() => savedQuery.refetch()} />}

      {savedQuery.data && savedQuery.data.length === 0 && (
        <EmptyState
          icon={BookmarkX}
          title="No saved jobs yet"
          description="Bookmark jobs you're interested in so you can compare them later."
          action={
            <Link to="/jobs" className="btn-primary">
              Browse jobs
            </Link>
          }
        />
      )}

      {savedQuery.data && savedQuery.data.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {savedQuery.data.map(({ job }) => (
            <JobCard key={job.id} job={job} isSaved onToggleSave={() => handleUnsave(job.id)} />
          ))}
        </div>
      )}
    </div>
  );
}
