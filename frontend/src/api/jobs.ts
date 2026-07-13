import { apiClient } from "./client";
import { Job, JobCategory, JobSearchResult, PaginationInfo, RemotePreference, SavedJob, SeniorityLevel } from "../types";

export interface JobSearchParams {
  q?: string;
  category?: JobCategory;
  seniority?: SeniorityLevel;
  remoteType?: RemotePreference;
  location?: string;
  page?: number;
  pageSize?: number;
  sort?: "recent" | "match";
}

export async function searchJobs(params: JobSearchParams): Promise<{ results: JobSearchResult[]; pagination: PaginationInfo }> {
  const res = await apiClient.get("/jobs", { params });
  return res.data;
}

export async function getJob(id: string): Promise<{ job: Job; matchScore: number | null }> {
  const res = await apiClient.get(`/jobs/${id}`);
  return res.data;
}

export async function getRecommendedJobs(): Promise<JobSearchResult[]> {
  const res = await apiClient.get("/jobs/recommended");
  return res.data.recommendations;
}

export async function saveJob(jobId: string, notes?: string): Promise<void> {
  await apiClient.post(`/jobs/${jobId}/save`, { notes });
}

export async function unsaveJob(jobId: string): Promise<void> {
  await apiClient.delete(`/jobs/${jobId}/save`);
}

export async function listSavedJobs(): Promise<SavedJob[]> {
  const res = await apiClient.get("/jobs/saved");
  return res.data.savedJobs;
}

export async function syncJobs(): Promise<{ results: Array<{ provider: string; fetched: number; upserted: number; error?: string }> }> {
  const res = await apiClient.post("/jobs/sync");
  return res.data;
}
