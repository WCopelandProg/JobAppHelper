import { apiClient } from "./client";
import { Resume } from "../types";

export async function listResumes(): Promise<Resume[]> {
  const res = await apiClient.get("/resumes");
  return res.data.resumes;
}

export async function uploadResume(file: File): Promise<Resume> {
  const formData = new FormData();
  formData.append("resume", file);
  const res = await apiClient.post("/resumes", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.resume;
}

export async function deleteResume(id: string): Promise<void> {
  await apiClient.delete(`/resumes/${id}`);
}

export async function setPrimaryResume(id: string): Promise<void> {
  await apiClient.post(`/resumes/${id}/primary`);
}

export async function downloadResume(id: string, fileName: string): Promise<void> {
  const res = await apiClient.get(`/resumes/${id}/download`, { responseType: "blob" });
  const url = window.URL.createObjectURL(new Blob([res.data]));
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
