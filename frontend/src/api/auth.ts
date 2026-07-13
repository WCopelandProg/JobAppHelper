import { apiClient } from "./client";
import { User } from "../types";

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export async function registerRequest(input: {
  email: string;
  password: string;
  fullName: string;
  school?: string;
  gradYear?: number;
}): Promise<AuthResponse> {
  const res = await apiClient.post("/auth/register", input);
  return res.data;
}

export async function loginRequest(input: { email: string; password: string }): Promise<AuthResponse> {
  const res = await apiClient.post("/auth/login", input);
  return res.data;
}

export async function logoutRequest(refreshToken: string): Promise<void> {
  await apiClient.post("/auth/logout", { refreshToken });
}

export async function fetchMe(): Promise<User> {
  const res = await apiClient.get("/auth/me");
  return res.data.user;
}
