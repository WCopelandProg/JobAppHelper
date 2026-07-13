import { JobSourceProvider } from "@prisma/client";
import { JobProvider, NormalizedJob } from "../../types/job";
import { classifyCategory, classifyRemote, classifySeniority, isRelevantRole, stripHtml } from "./classify";

// Arbeitnow (https://www.arbeitnow.com) exposes a free, unauthenticated
// job board API with real listings (many EU/remote tech roles).
interface ArbeitnowJob {
  slug: string;
  company_name: string;
  title: string;
  description: string;
  remote: boolean;
  url: string;
  tags: string[];
  job_types: string[];
  location: string;
  created_at: number; // unix seconds
}

interface ArbeitnowResponse {
  data: ArbeitnowJob[];
}

const FETCH_TIMEOUT_MS = 10_000;

export const arbeitnowProvider: JobProvider = {
  key: JobSourceProvider.ARBEITNOW,
  displayName: "Arbeitnow",

  async fetchJobs(): Promise<NormalizedJob[]> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    let jobs: ArbeitnowJob[] = [];
    try {
      const res = await fetch("https://www.arbeitnow.com/api/job-board-api", {
        signal: controller.signal,
      });
      if (!res.ok) throw new Error(`Arbeitnow API returned ${res.status}`);
      const data = (await res.json()) as ArbeitnowResponse;
      jobs = data.data ?? [];
    } finally {
      clearTimeout(timeout);
    }

    const normalized: NormalizedJob[] = [];

    for (const job of jobs) {
      const descriptionText = stripHtml(job.description || "");
      if (!isRelevantRole(job.title, descriptionText)) continue;

      normalized.push({
        sourceProvider: JobSourceProvider.ARBEITNOW,
        sourceJobId: job.slug,
        sourceUrl: job.url,
        title: job.title,
        company: job.company_name,
        companyLogoUrl: null,
        location: job.location || null,
        remoteType: classifyRemote(job.title, job.location, job.remote),
        category: classifyCategory(job.title, descriptionText),
        seniority: classifySeniority(job.title),
        descriptionHtml: job.description || "",
        descriptionText,
        tags: [...(job.tags ?? []), ...(job.job_types ?? [])],
        salaryMin: null,
        salaryMax: null,
        salaryCurrency: null,
        postedAt: job.created_at ? new Date(job.created_at * 1000) : null,
      });
    }

    return normalized;
  },
};
