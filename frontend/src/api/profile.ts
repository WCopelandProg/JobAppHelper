import { apiClient } from "./client";
import { Profile } from "../types";

export async function fetchProfile(): Promise<Profile> {
  const res = await apiClient.get("/profile");
  return res.data.profile;
}

export async function updateProfile(input: Partial<Profile>): Promise<Profile> {
  const res = await apiClient.put("/profile", input);
  return res.data.profile;
}
