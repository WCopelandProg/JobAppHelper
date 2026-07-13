import { ApplicationStatus } from "../types";

export function formatSalary(min?: number | null, max?: number | null, currency?: string | null): string | null {
  if (!min && !max) return null;
  const fmt = (n: number) => (n >= 1000 ? `$${Math.round(n / 1000)}k` : `$${n}`);
  const symbol = currency === "USD" || !currency ? "" : ` ${currency}`;
  if (min && max && min !== max) return `${fmt(min)}–${fmt(max)}${symbol}`;
  return `${fmt(min ?? max ?? 0)}${symbol}`;
}

export function formatRelativeDate(dateStr?: string | null): string {
  if (!dateStr) return "Recently";
  const date = new Date(dateStr);
  const diffMs = Date.now() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "1 day ago";
  if (diffDays < 30) return `${diffDays} days ago`;
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) return `${diffMonths} mo ago`;
  return date.toLocaleDateString();
}

export const STATUS_VARIANT: Record<ApplicationStatus, "neutral" | "brand" | "green" | "amber" | "red" | "blue" | "purple"> = {
  WISHLIST: "neutral",
  APPLIED: "blue",
  OA_ASSESSMENT: "purple",
  INTERVIEWING: "amber",
  OFFER: "green",
  REJECTED: "red",
  WITHDRAWN: "neutral",
};
