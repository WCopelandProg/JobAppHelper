import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Briefcase, FileText, Sparkles, TrendingUp } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { getRecommendedJobs, saveJob, unsaveJob, listSavedJobs } from "../api/jobs";
import { getApplicationStats } from "../api/applications";
import { JobCard } from "../components/jobs/JobCard";
import { Spinner } from "../components/common/Spinner";
import { ErrorState } from "../components/common/ErrorState";
import { EmptyState } from "../components/common/EmptyState";
import { extractErrorMessage } from "../api/client";

export function DashboardPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const savedQuery = useQuery({ queryKey: ["savedJobs"], queryFn: listSavedJobs });
  const savedJobIds = new Set((savedQuery.data ?? []).map((s) => s.jobId));

  const recommendedQuery = useQuery({
    queryKey: ["recommendedJobs"],
    queryFn: getRecommendedJobs,
  });

  const statsQuery = useQuery({ queryKey: ["applicationStats"], queryFn: getApplicationStats });

  const hasProfile = !!user?.profile && (user.profile.targetCategories?.length ?? 0) > 0;

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

  const totalApplications = Object.values(statsQuery.data ?? {}).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Welcome back, {user?.fullName?.split(" ")[0]}</h1>
        <p className="mt-1 text-sm text-slate-500">Here&apos;s what&apos;s happening with your job search.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard icon={FileText} label="Applications tracked" value={totalApplications} to="/applications" />
        <StatCard icon={Briefcase} label="Saved jobs" value={savedQuery.data?.length ?? 0} to="/saved" />
        <StatCard
          icon={TrendingUp}
          label="Interviews / Offers"
          value={(statsQuery.data?.INTERVIEWING ?? 0) + (statsQuery.data?.OFFER ?? 0)}
          to="/applications"
        />
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            <Sparkles className="h-5 w-5 text-brand-500" />
            Recommended for you
          </h2>
          <Link to="/jobs" className="text-sm font-medium text-brand-600 hover:text-brand-700">
            Browse all jobs
          </Link>
        </div>

        {!hasProfile && (
          <div className="mb-4 rounded-lg border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-800">
            Complete your <Link to="/profile" className="font-semibold underline">profile</Link> with target roles and skills to get personalized recommendations.
          </div>
        )}

        {recommendedQuery.isLoading && <Spinner label="Finding jobs that match your profile..." />}
        {recommendedQuery.isError && <ErrorState message={extractErrorMessage(recommendedQuery.error)} onRetry={() => recommendedQuery.refetch()} />}
        {recommendedQuery.data && recommendedQuery.data.length === 0 && (
          <EmptyState
            icon={Briefcase}
            title="No recommendations yet"
            description="Add target roles, skills, and interests to your profile so we can match you with relevant listings."
            action={
              <Link to="/profile" className="btn-primary">
                Update profile
              </Link>
            }
          />
        )}
        {recommendedQuery.data && recommendedQuery.data.length > 0 && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recommendedQuery.data.map(({ job, matchScore }) => (
              <JobCard
                key={job.id}
                job={job}
                matchScore={matchScore}
                isSaved={savedJobIds.has(job.id)}
                onToggleSave={() => handleToggleSave(job.id)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, to }: { icon: typeof Briefcase; label: string; value: number; to: string }) {
  return (
    <Link to={to} className="card flex items-center gap-4 p-4 transition-shadow hover:shadow-md">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-2xl font-semibold text-slate-900">{value}</p>
        <p className="text-sm text-slate-500">{label}</p>
      </div>
    </Link>
  );
}
