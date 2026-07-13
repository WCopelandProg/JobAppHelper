import { apiClient } from "./client";
import { NetworkingLead, NetworkingSuggestion } from "../types";

export async function getSuggestedSearches(company: string): Promise<NetworkingSuggestion[]> {
  const res = await apiClient.get("/networking/suggestions", { params: { company } });
  return res.data.searches;
}

export async function listLeads(): Promise<NetworkingLead[]> {
  const res = await apiClient.get("/networking/leads");
  return res.data.leads;
}

export async function createLead(input: Partial<NetworkingLead> & { company: string }): Promise<NetworkingLead> {
  const res = await apiClient.post("/networking/leads", input);
  return res.data.lead;
}

export async function updateLead(id: string, input: Partial<NetworkingLead>): Promise<NetworkingLead> {
  const res = await apiClient.patch(`/networking/leads/${id}`, input);
  return res.data.lead;
}

export async function deleteLead(id: string): Promise<void> {
  await apiClient.delete(`/networking/leads/${id}`);
}
