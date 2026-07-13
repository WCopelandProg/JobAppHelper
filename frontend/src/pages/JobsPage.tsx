import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Briefcase, ChevronLeft, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";
import { searchJobs, JobSearchParams, saveJob, unsaveJob, listSavedJobs } from "../api/jobs";
import { JobCard } from "../components/jobs/JobCard";
import { JobFilters } from "../components/jobs/JobFilters";
import { Spinner } from "../components/common/Spinner";
import { ErrorState } from "../components/common/ErrorState";
import { EmptyState } from "../components/common/EmptyState";
import { extractErrorMessage } from "../api/client";

export function JobsPage() {
  const [filters, setFilters] = useState<JobSearchParams>({ page: 1, pageSize: 12, sort: "recent" });
  const queryClient = useQueryClient();

  const jobsQuery = useQuery({
    queryKey: ["jobs", filters],
    queryFn: () => searchJobs(filters),
    placeholderData: (prev) => prev,
  });

  const savedQuery = useQuery({ queryKey: ["savedJobs"], queryFn: listSavedJobs });
  const savedJobIds = new Set((savedQuery.data ?? []).map((s) => s.jobId));

  const handleToggleSave = async (jobId: string) => {
    try {
      if (savedJobIds.has(jobId)) {
        await unsaveJob(jobId);
      } else {
        await saveJob(jobId);
      }
      queryClient.invalidateQueries({ queryKey: ["savedJobs"] });
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[240px_1fr]">
      <JobFilters filters={filters} onChange={setFilters} />

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-slate-900">Find Jobs</h1>
          {jobsQuery.data && <p className="text-sm text-slate-500">{jobsQuery.data.pagination.total} results</p>}
        </div>

        {jobsQuery.isLoading && <Spinner label="Searching jobs..." />}
        {jobsQuery.isError && <ErrorState message={extractErrorMessage(jobsQuery.error)} onRetry={() => jobsQuery.refetch()} />}

        {jobsQuery.data && jobsQuery.data.results.length === 0 && (
          <EmptyState
            icon={Briefcase}
            title="No jobs match your filters"
            description="Try broadening your search or clearing some filters."
            action={
              <button className="btn-secondary" onClick={() => setFilters({ page: 1, pageSize: 12, sort: "recent" })}>
                Clear filters
              </button>
            }
          />
        )}

        {jobsQuery.data && jobsQuery.data.results.length > 0 && (
          <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {jobsQuery.data.results.map(({ job, matchScore }) => (
                <JobCard
                  key={job.id}
                  job={job}
                  matchScore={matchScore}
                  isSaved={savedJobIds.has(job.id)}
                  onToggleSave={() => handleToggleSave(job.id)}
                />
              ))}
            </div>

            <div className="mt-6 flex items-center justify-center gap-4">
              <button
                className="btn-secondary"
                disabled={jobsQuery.data.pagination.page <= 1}
                onClick={() => setFilters((f) => ({ ...f, page: (f.page ?? 1) - 1 }))}
              >
                <ChevronLeft className="h-4 w-4" /> Prev
              </button>
              <span className="text-sm text-slate-500">
                Page {jobsQuery.data.pagination.page} of {jobsQuery.data.pagination.totalPages}
              </span>
              <button
                className="btn-secondary"
                disabled={jobsQuery.data.pagination.page >= jobsQuery.data.pagination.totalPages}
                onClick={() => setFilters((f) => ({ ...f, page: (f.page ?? 1) + 1 }))}
              >
                Next <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
