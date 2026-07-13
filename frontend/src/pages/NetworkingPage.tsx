import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ExternalLink, Plus, Trash2, Users } from "lucide-react";
import toast from "react-hot-toast";
import { createLead, deleteLead, getSuggestedSearches, listLeads, updateLead } from "../api/networking";
import { Spinner } from "../components/common/Spinner";
import { ErrorState } from "../components/common/ErrorState";
import { EmptyState } from "../components/common/EmptyState";
import { extractErrorMessage } from "../api/client";
import { Badge } from "../components/common/Badge";

export function NetworkingPage() {
  const [searchParams] = useSearchParams();
  const [company, setCompany] = useState(searchParams.get("company") ?? "");
  const [searchCompany, setSearchCompany] = useState(searchParams.get("company") ?? "");
  const queryClient = useQueryClient();

  const suggestionsQuery = useQuery({
    queryKey: ["networkingSuggestions", searchCompany],
    queryFn: () => getSuggestedSearches(searchCompany),
    enabled: !!searchCompany,
  });

  const leadsQuery = useQuery({ queryKey: ["networkingLeads"], queryFn: listLeads });

  const addLeadMutation = useMutation({
    mutationFn: (input: { company: string; type: "ALUMNI" | "RECRUITER" | "EMPLOYEE" | "OTHER"; searchUrl?: string; notes?: string }) => createLead(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["networkingLeads"] });
      toast.success("Added to your contact tracker");
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });

  const toggleContactedMutation = useMutation({
    mutationFn: ({ id, contacted }: { id: string; contacted: boolean }) => updateLead(id, { contacted }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["networkingLeads"] }),
    onError: (err) => toast.error(extractErrorMessage(err)),
  });

  const deleteLeadMutation = useMutation({
    mutationFn: (id: string) => deleteLead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["networkingLeads"] }),
    onError: (err) => toast.error(extractErrorMessage(err)),
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Networking</h1>
        <p className="mt-1 text-sm text-slate-500">
          Find alumni, employees, and recruiters at companies you&apos;re targeting, and keep track of who you&apos;ve reached out to.
        </p>
      </div>

      <div className="card p-4">
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            setSearchCompany(company.trim());
          }}
        >
          <input className="input" placeholder="Company name (e.g. Google)" value={company} onChange={(e) => setCompany(e.target.value)} />
          <button type="submit" className="btn-primary shrink-0">
            Find connections
          </button>
        </form>

        {suggestionsQuery.isLoading && <Spinner label="Building search suggestions..." />}
        {suggestionsQuery.isError && <ErrorState message={extractErrorMessage(suggestionsQuery.error)} />}

        {suggestionsQuery.data && (
          <div className="mt-4 space-y-2">
            {suggestionsQuery.data.map((s) => (
              <div key={s.url} className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
                <div>
                  <p className="text-sm font-medium text-slate-800">{s.label}</p>
                  <Badge variant="neutral">{s.type}</Badge>
                </div>
                <div className="flex gap-2">
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="btn-secondary !px-3 !py-1.5">
                    <ExternalLink className="h-4 w-4" />
                    Open search
                  </a>
                  <button
                    className="btn-ghost !px-3 !py-1.5"
                    onClick={() => addLeadMutation.mutate({ company: searchCompany, type: s.type, searchUrl: s.url })}
                  >
                    <Plus className="h-4 w-4" />
                    Track
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Your contact tracker</h2>

        {leadsQuery.isLoading && <Spinner label="Loading contacts..." />}
        {leadsQuery.isError && <ErrorState message={extractErrorMessage(leadsQuery.error)} onRetry={() => leadsQuery.refetch()} />}

        {leadsQuery.data && leadsQuery.data.length === 0 && (
          <EmptyState icon={Users} title="No contacts tracked yet" description="Search for a company above and add leads to start building your network." />
        )}

        {leadsQuery.data && leadsQuery.data.length > 0 && (
          <div className="space-y-2">
            {leadsQuery.data.map((lead) => (
              <div key={lead.id} className="card flex items-center justify-between p-3">
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {lead.name || lead.company} {lead.role && <span className="font-normal text-slate-500">· {lead.role}</span>}
                  </p>
                  <p className="text-xs text-slate-500">
                    {lead.company} · <Badge variant="neutral">{lead.type}</Badge>
                  </p>
                  {lead.notes && <p className="mt-1 text-xs text-slate-500">{lead.notes}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1.5 text-xs text-slate-500">
                    <input
                      type="checkbox"
                      checked={lead.contacted}
                      onChange={(e) => toggleContactedMutation.mutate({ id: lead.id, contacted: e.target.checked })}
                    />
                    Contacted
                  </label>
                  {lead.searchUrl && (
                    <a href={lead.searchUrl} target="_blank" rel="noopener noreferrer" className="btn-ghost !px-2 !py-1.5">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                  <button className="btn-ghost !px-2 !py-1.5 hover:!text-red-600" onClick={() => deleteLeadMutation.mutate(lead.id)}>
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
