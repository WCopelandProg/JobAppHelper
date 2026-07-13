import { JobCategory, RemotePreference, SeniorityLevel } from "@prisma/client";

// Lightweight keyword-based classifier so heterogeneous provider feeds
// map onto the fixed set of categories/seniority levels the rest of the
// app filters and matches on. Order matters: more specific categories
// are checked before generic ones.
const CATEGORY_RULES: Array<{ category: JobCategory; keywords: RegExp }> = [
  { category: JobCategory.MACHINE_LEARNING, keywords: /machine learning|\bml\b|deep learning|nlp|computer vision|ai engineer|artificial intelligence/i },
  { category: JobCategory.DATA_SCIENCE, keywords: /data scientist|data science/i },
  { category: JobCategory.DATA_ENGINEERING, keywords: /data engineer|etl|data pipeline|analytics engineer/i },
  { category: JobCategory.BUSINESS_INTELLIGENCE, keywords: /business intelligence|\bbi\b developer|tableau|power ?bi|looker/i },
  { category: JobCategory.PRODUCT_ANALYTICS, keywords: /product analyst|product analytics|growth analyst/i },
  { category: JobCategory.QUANTITATIVE_ANALYST, keywords: /quant(itative)? (analyst|researcher|developer)|quant trading/i },
  { category: JobCategory.DATA_ANALYTICS, keywords: /data analyst|analytics/i },
  { category: JobCategory.DATA_ENGINEERING, keywords: /\bsql\b.*engineer|database engineer/i },
  { category: JobCategory.SOFTWARE_ENGINEERING, keywords: /software engineer|backend|frontend|full[ -]?stack|developer|programmer/i },
];

export function classifyCategory(title: string, description: string): JobCategory {
  const haystack = `${title} ${description}`;
  for (const rule of CATEGORY_RULES) {
    if (rule.keywords.test(haystack)) return rule.category;
  }
  return JobCategory.OTHER;
}

export function classifySeniority(title: string): SeniorityLevel {
  const t = title.toLowerCase();
  if (/\bintern(ship)?\b/.test(t)) return SeniorityLevel.INTERNSHIP;
  if (/new grad|entry[ -]level|graduate program|early career/.test(t)) return SeniorityLevel.NEW_GRAD;
  if (/senior|staff|principal|lead\b|\bsr\.?\b/.test(t)) return SeniorityLevel.SENIOR;
  if (/junior|\bjr\.?\b|associate/.test(t)) return SeniorityLevel.JUNIOR;
  if (/\bmid\b|ii\b|iii\b/.test(t)) return SeniorityLevel.MID;
  return SeniorityLevel.UNKNOWN;
}

export function classifyRemote(title: string, location: string | null | undefined, remoteFlag?: boolean): RemotePreference {
  const haystack = `${title} ${location ?? ""}`.toLowerCase();
  if (remoteFlag) return RemotePreference.REMOTE;
  if (/remote/.test(haystack)) return RemotePreference.REMOTE;
  if (/hybrid/.test(haystack)) return RemotePreference.HYBRID;
  if (location) return RemotePreference.ONSITE;
  return RemotePreference.ANY;
}

// Is this job relevant to the app's target audience (data/ML/SWE/analytics roles)?
export function isRelevantRole(title: string, description: string): boolean {
  const category = classifyCategory(title, description);
  return category !== JobCategory.OTHER;
}

export function stripHtml(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}
