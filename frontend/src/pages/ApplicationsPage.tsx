import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FileText, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { deleteApplication, listApplications, updateApplication } from "../api/applications";
import { Spinner } from "../components/common/Spinner";
import { ErrorState } from "../components/common/ErrorState";
import { EmptyState } from "../components/common/EmptyState";
import { extractErrorMessage } from "../api/client";
import { APPLICATION_STATUS_LABELS, APPLICATION_STATUS_ORDER, Application, ApplicationStatus } from "../types";
import { STATUS_VARIANT } from "../utils/format";
import { Badge } from "../components/common/Badge";
import { Link } from "react-router-dom";

export function ApplicationsPage() {
  const queryClient = useQueryClient();
  const applicationsQuery = useQuery({ queryKey: ["applications"], queryFn: listApplications });

  const handleStatusChange = async (application: Application, status: ApplicationStatus) => {
    try {
      await updateApplication(application.id, { status });
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      queryClient.invalidateQueries({ queryKey: ["applicationStats"] });
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteApplication(id);
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      queryClient.invalidateQueries({ queryKey: ["applicationStats"] });
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  if (applicationsQuery.isLoading) return <Spinner label="Loading your applications..." />;
  if (applicationsQuery.isError) return <ErrorState message={extractErrorMessage(applicationsQuery.error)} onRetry={() => applicationsQuery.refetch()} />;

  const applications = applicationsQuery.data ?? [];

  if (applications.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="No applications tracked yet"
        description="Apply to a job or add one to your wishlist to start tracking it here."
        action={
          <Link to="/jobs" className="btn-primary">
            Browse jobs
          </Link>
        }
      />
    );
  }

  const grouped = APPLICATION_STATUS_ORDER.map((status) => ({
    status,
    items: applications.filter((a) => a.status === status),
  })).filter((g) => g.items.length > 0 || ["WISHLIST", "APPLIED", "INTERVIEWING"].includes(g.status));

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold text-slate-900">Applications</h1>
      <div className="grid grid-cols-1 gap-4 overflow-x-auto md:grid-cols-2 xl:grid-cols-4">
        {grouped.map(({ status, items }) => (
          <div key={status} className="min-w-0">
            <div className="mb-2 flex items-center justify-between">
              <Badge variant={STATUS_VARIANT[status]}>{APPLICATION_STATUS_LABELS[status]}</Badge>
              <span className="text-xs text-slate-400">{items.length}</span>
            </div>
            <div className="space-y-3">
              {items.map((application) => (
                <div key={application.id} className="card p-3">
                  <div className="flex items-start justify-between gap-2">
                    <Link to={`/jobs/${application.jobId}`} className="text-sm font-medium text-slate-900 hover:text-brand-700">
                      {application.job.title}
                    </Link>
                    <button onClick={() => handleDelete(application.id)} className="text-slate-300 hover:text-red-500" title="Remove">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-500">{application.job.company}</p>

                  <select
                    className="input mt-2 !py-1 text-xs"
                    value={application.status}
                    onChange={(e) => handleStatusChange(application, e.target.value as ApplicationStatus)}
                  >
                    {APPLICATION_STATUS_ORDER.map((s) => (
                      <option key={s} value={s}>
                        {APPLICATION_STATUS_LABELS[s]}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
              {items.length === 0 && <p className="rounded-lg border border-dashed border-slate-200 p-4 text-center text-xs text-slate-400">Empty</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
