import { apiClient } from "./client";
import { Application, ApplicationStatus } from "../types";

export async function listApplications(): Promise<Application[]> {
  const res = await apiClient.get("/applications");
  return res.data.applications;
}

export async function getApplicationStats(): Promise<Record<string, number>> {
  const res = await apiClient.get("/applications/stats");
  return res.data.stats;
}

export async function createApplication(input: { jobId: string; resumeId?: string; status?: ApplicationStatus; notes?: string }): Promise<Application> {
  const res = await apiClient.post("/applications", input);
  return res.data.application;
}

export async function updateApplication(
  id: string,
  input: Partial<{ status: ApplicationStatus; resumeId: string | null; notes: string }>,
): Promise<Application> {
  const res = await apiClient.patch(`/applications/${id}`, input);
  return res.data.application;
}

export async function deleteApplication(id: string): Promise<void> {
  await apiClient.delete(`/applications/${id}`);
}
