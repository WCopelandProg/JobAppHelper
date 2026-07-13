import { JobCategory, JobSourceProvider, RemotePreference, SeniorityLevel } from "@prisma/client";

// The shape every JobProvider must normalize its raw API response into,
// so the rest of the app (matching, storage, UI) never has to know about
// provider-specific formats.
export interface NormalizedJob {
  sourceProvider: JobSourceProvider;
  sourceJobId: string;
  sourceUrl: string;
  title: string;
  company: string;
  companyLogoUrl?: string | null;
  location?: string | null;
  remoteType: RemotePreference;
  category: JobCategory;
  seniority: SeniorityLevel;
  descriptionHtml: string;
  descriptionText: string;
  tags: string[];
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryCurrency?: string | null;
  postedAt?: Date | null;
}

export interface JobProvider {
  readonly key: JobSourceProvider;
  readonly displayName: string;
  fetchJobs(): Promise<NormalizedJob[]>;
}
