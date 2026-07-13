import { Search } from "lucide-react";
import { JOB_CATEGORY_LABELS, JobCategory, RemotePreference, SENIORITY_LABELS, SeniorityLevel } from "../../types";
import { JobSearchParams } from "../../api/jobs";

interface JobFiltersProps {
  filters: JobSearchParams;
  onChange: (filters: JobSearchParams) => void;
}

export function JobFilters({ filters, onChange }: JobFiltersProps) {
  return (
    <div className="card space-y-4 p-4">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          className="input pl-9"
          placeholder="Search title, company, or skill..."
          value={filters.q ?? ""}
          onChange={(e) => onChange({ ...filters, q: e.target.value, page: 1 })}
        />
      </div>

      <div>
        <label className="label">Category</label>
        <select
          className="input"
          value={filters.category ?? ""}
          onChange={(e) => onChange({ ...filters, category: (e.target.value || undefined) as JobCategory | undefined, page: 1 })}
        >
          <option value="">All categories</option>
          {Object.entries(JOB_CATEGORY_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="label">Seniority</label>
        <select
          className="input"
          value={filters.seniority ?? ""}
          onChange={(e) => onChange({ ...filters, seniority: (e.target.value || undefined) as SeniorityLevel | undefined, page: 1 })}
        >
          <option value="">Any level</option>
          {Object.entries(SENIORITY_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="label">Work type</label>
        <select
          className="input"
          value={filters.remoteType ?? ""}
          onChange={(e) => onChange({ ...filters, remoteType: (e.target.value || undefined) as RemotePreference | undefined, page: 1 })}
        >
          <option value="">Any</option>
          <option value="REMOTE">Remote</option>
          <option value="HYBRID">Hybrid</option>
          <option value="ONSITE">Onsite</option>
        </select>
      </div>

      <div>
        <label className="label">Location</label>
        <input
          className="input"
          placeholder="e.g. New York"
          value={filters.location ?? ""}
          onChange={(e) => onChange({ ...filters, location: e.target.value, page: 1 })}
        />
      </div>

      <div>
        <label className="label">Sort by</label>
        <select
          className="input"
          value={filters.sort ?? "recent"}
          onChange={(e) => onChange({ ...filters, sort: e.target.value as "recent" | "match", page: 1 })}
        >
          <option value="recent">Most recent</option>
          <option value="match">Best match</option>
        </select>
      </div>

      <button
        className="btn-ghost w-full justify-center"
        onClick={() => onChange({ page: 1, pageSize: filters.pageSize, sort: "recent" })}
      >
        Clear filters
      </button>
    </div>
  );
}
