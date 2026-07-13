import { apiClient } from "./client";
import { CoverLetter } from "../types";

export async function listCoverLetters(): Promise<CoverLetter[]> {
  const res = await apiClient.get("/cover-letters");
  return res.data.coverLetters;
}

export async function generateCoverLetter(input: {
  jobId: string;
  resumeId?: string;
  applicationId?: string;
  tone?: string;
}): Promise<CoverLetter> {
  const res = await apiClient.post("/cover-letters/generate", input);
  return res.data.coverLetter;
}

export async function updateCoverLetter(id: string, content: string): Promise<CoverLetter> {
  const res = await apiClient.put(`/cover-letters/${id}`, { content });
  return res.data.coverLetter;
}

export async function deleteCoverLetter(id: string): Promise<void> {
  await apiClient.delete(`/cover-letters/${id}`);
}
