import { JobSourceProvider } from "@prisma/client";
import { JobProvider, NormalizedJob } from "../../types/job";
import { classifyCategory, classifyRemote, classifySeniority, isRelevantRole, stripHtml } from "./classify";

// Remotive (https://remotive.com) exposes a free, unauthenticated JSON API
// of real remote job listings. We query a few categories relevant to this
// app's target audience and normalize the results.
interface RemotiveJob {
  id: number;
  url: string;
  title: string;
  company_name: string;
  company_logo_url?: string;
  category: string;
  tags: string[];
  job_type: string;
  publication_date: string;
  candidate_required_location: string;
  salary?: string;
  description: string;
}

interface RemotiveResponse {
  jobs: RemotiveJob[];
}

const CATEGORIES = ["software-dev", "data"];
const FETCH_TIMEOUT_MS = 10_000;

async function fetchCategory(category: string): Promise<RemotiveJob[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(
      `https://remotive.com/api/remote-jobs?category=${encodeURIComponent(category)}&limit=100`,
      { signal: controller.signal },
    );
    if (!res.ok) throw new Error(`Remotive API returned ${res.status}`);
    const data = (await res.json()) as RemotiveResponse;
    return data.jobs ?? [];
  } finally {
    clearTimeout(timeout);
  }
}

function parseSalary(salary?: string): { min: number | null; max: number | null } {
  if (!salary) return { min: null, max: null };
  const numbers = salary.replace(/,/g, "").match(/\d+/g);
  if (!numbers || numbers.length === 0) return { min: null, max: null };
  const values = numbers.map(Number).filter((n) => n > 1000);
  if (values.length === 0) return { min: null, max: null };
  return { min: Math.min(...values), max: Math.max(...values) };
}

export const remotiveProvider: JobProvider = {
  key: JobSourceProvider.REMOTIVE,
  displayName: "Remotive",

  async fetchJobs(): Promise<NormalizedJob[]> {
    const results = await Promise.allSettled(CATEGORIES.map(fetchCategory));
    const jobs = results.flatMap((r) => (r.status === "fulfilled" ? r.value : []));

    const seen = new Set<number>();
    const normalized: NormalizedJob[] = [];

    for (const job of jobs) {
      if (seen.has(job.id)) continue;
      seen.add(job.id);

      const descriptionText = stripHtml(job.description || "");
      if (!isRelevantRole(job.title, descriptionText)) continue;

      const { min, max } = parseSalary(job.salary);

      normalized.push({
        sourceProvider: JobSourceProvider.REMOTIVE,
        sourceJobId: String(job.id),
        sourceUrl: job.url,
        title: job.title,
        company: job.company_name,
        companyLogoUrl: job.company_logo_url || null,
        location: job.candidate_required_location || null,
        remoteType: classifyRemote(job.title, job.candidate_required_location, true),
        category: classifyCategory(job.title, descriptionText),
        seniority: classifySeniority(job.title),
        descriptionHtml: job.description || "",
        descriptionText,
        tags: job.tags ?? [],
        salaryMin: min,
        salaryMax: max,
        salaryCurrency: min || max ? "USD" : null,
        postedAt: job.publication_date ? new Date(job.publication_date) : null,
      });
    }

    return normalized;
  },
};
