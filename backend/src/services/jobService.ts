import { Job, JobCategory, Prisma, Profile, RemotePreference, SeniorityLevel } from "@prisma/client";
import { prisma } from "../utils/prisma";
import { jobProviders } from "./providers";
import { NormalizedJob } from "../types/job";

export interface SyncResult {
  provider: string;
  fetched: number;
  upserted: number;
  error?: string;
}

// Pulls fresh listings from every registered provider and upserts them by
// (sourceProvider, sourceJobId) so re-syncing never creates duplicates.
export async function syncAllProviders(): Promise<SyncResult[]> {
  const results: SyncResult[] = [];

  for (const provider of jobProviders) {
    try {
      const jobs = await provider.fetchJobs();
      let upserted = 0;
      for (const job of jobs) {
        await upsertJob(job);
        upserted += 1;
      }
      results.push({ provider: provider.displayName, fetched: jobs.length, upserted });
    } catch (err) {
      results.push({
        provider: provider.displayName,
        fetched: 0,
        upserted: 0,
        error: err instanceof Error ? err.message : "Unknown error",
      });
    }
  }

  return results;
}

async function upsertJob(job: NormalizedJob) {
  const { sourceProvider, sourceJobId, ...rest } = job;
  await prisma.job.upsert({
    where: { sourceProvider_sourceJobId: { sourceProvider, sourceJobId } },
    create: { sourceProvider, sourceJobId, ...rest },
    update: { ...rest, isActive: true, fetchedAt: new Date() },
  });
}

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

export async function searchJobs(params: JobSearchParams, profile?: Profile | null) {
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(50, Math.max(1, params.pageSize ?? 20));

  const where: Prisma.JobWhereInput = {
    isActive: true,
    ...(params.category ? { category: params.category } : {}),
    ...(params.seniority ? { seniority: params.seniority } : {}),
    ...(params.remoteType ? { remoteType: params.remoteType } : {}),
    ...(params.location
      ? { location: { contains: params.location, mode: "insensitive" as const } }
      : {}),
    ...(params.q
      ? {
          OR: [
            { title: { contains: params.q, mode: "insensitive" as const } },
            { company: { contains: params.q, mode: "insensitive" as const } },
            { tags: { has: params.q } },
          ],
        }
      : {}),
  };

  const [total, jobs] = await Promise.all([
    prisma.job.count({ where }),
    prisma.job.findMany({
      where,
      orderBy: { postedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  let scored = jobs.map((job) => ({ job, matchScore: profile ? scoreJobForProfile(job, profile) : null }));

  if (params.sort === "match" && profile) {
    scored = scored.sort((a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0));
  }

  return {
    results: scored,
    pagination: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) },
  };
}

export async function getJobById(jobId: string): Promise<Job | null> {
  return prisma.job.findUnique({ where: { id: jobId } });
}

// Recommended jobs for a user's dashboard: highest-scoring active jobs
// against their profile, most recent first as a tiebreaker.
export async function getRecommendedJobs(profile: Profile, limit = 10) {
  const candidates = await prisma.job.findMany({
    where: { isActive: true },
    orderBy: { postedAt: "desc" },
    take: 200,
  });

  return candidates
    .map((job) => ({ job, matchScore: scoreJobForProfile(job, profile) }))
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit);
}

// Simple, explainable 0-100 relevance score: category/role alignment,
// skill/tag overlap, interest keyword hits, and remote preference match.
export function scoreJobForProfile(job: Job, profile: Profile): number {
  let score = 0;
  const haystack = `${job.title} ${job.descriptionText}`.toLowerCase();

  if (profile.targetCategories?.includes(job.category)) score += 30;

  const roleHit = (profile.targetRoles ?? []).some((role) =>
    job.title.toLowerCase().includes(role.toLowerCase()),
  );
  if (roleHit) score += 20;

  const skillMatches = (profile.skills ?? []).filter(
    (skill) =>
      job.tags.some((tag) => tag.toLowerCase() === skill.toLowerCase()) ||
      haystack.includes(skill.toLowerCase()),
  );
  score += Math.min(30, skillMatches.length * 6);

  const interestMatches = (profile.interests ?? []).filter((interest) =>
    haystack.includes(interest.toLowerCase()),
  );
  score += Math.min(10, interestMatches.length * 5);

  if (profile.remotePref === RemotePreference.ANY || job.remoteType === profile.remotePref) {
    score += 10;
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}
