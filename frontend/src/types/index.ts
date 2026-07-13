export type RemotePreference = "REMOTE" | "HYBRID" | "ONSITE" | "ANY";

export type JobCategory =
  | "DATA_ANALYTICS"
  | "DATA_SCIENCE"
  | "MACHINE_LEARNING"
  | "BUSINESS_INTELLIGENCE"
  | "SOFTWARE_ENGINEERING"
  | "DATA_ENGINEERING"
  | "PRODUCT_ANALYTICS"
  | "QUANTITATIVE_ANALYST"
  | "OTHER";

export type SeniorityLevel = "INTERNSHIP" | "NEW_GRAD" | "JUNIOR" | "MID" | "SENIOR" | "UNKNOWN";

export type ApplicationStatus =
  | "WISHLIST"
  | "APPLIED"
  | "OA_ASSESSMENT"
  | "INTERVIEWING"
  | "OFFER"
  | "REJECTED"
  | "WITHDRAWN";

export type NetworkingLeadType = "ALUMNI" | "RECRUITER" | "EMPLOYEE" | "OTHER";
export type CoverLetterGenerationMethod = "AI" | "TEMPLATE";

export interface User {
  id: string;
  email: string;
  fullName: string;
  school?: string | null;
  gradYear?: number | null;
  createdAt: string;
  profile?: Profile | null;
}

export interface Profile {
  id: string;
  userId: string;
  headline?: string | null;
  location?: string | null;
  remotePref: RemotePreference;
  yearsExperience?: number | null;
  targetRoles: string[];
  targetCategories: JobCategory[];
  skills: string[];
  interests: string[];
  linkedinUrl?: string | null;
  githubUrl?: string | null;
  portfolioUrl?: string | null;
  phone?: string | null;
  bio?: string | null;
}

export interface Job {
  id: string;
  sourceProvider: string;
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
  postedAt?: string | null;
  isActive: boolean;
}

export interface JobSearchResult {
  job: Job;
  matchScore: number | null;
}

export interface PaginationInfo {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface Resume {
  id: string;
  fileName: string;
  mimeType: string;
  fileSizeBytes: number;
  parsedSkills: string[];
  isPrimary: boolean;
  createdAt: string;
}

export interface Application {
  id: string;
  jobId: string;
  job: Job;
  resumeId?: string | null;
  resume?: { id: string; fileName: string } | null;
  status: ApplicationStatus;
  appliedAt?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SavedJob {
  id: string;
  jobId: string;
  job: Job;
  notes?: string | null;
  createdAt: string;
}

export interface CoverLetter {
  id: string;
  jobId: string;
  job: Job;
  resumeId?: string | null;
  content: string;
  method: CoverLetterGenerationMethod;
  tone?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NetworkingLead {
  id: string;
  company: string;
  name?: string | null;
  role?: string | null;
  type: NetworkingLeadType;
  linkedinUrl?: string | null;
  email?: string | null;
  notes?: string | null;
  contacted: boolean;
  searchUrl?: string | null;
  createdAt: string;
}

export interface NetworkingSuggestion {
  label: string;
  url: string;
  type: NetworkingLeadType;
}

export const JOB_CATEGORY_LABELS: Record<JobCategory, string> = {
  DATA_ANALYTICS: "Data Analytics",
  DATA_SCIENCE: "Data Science",
  MACHINE_LEARNING: "Machine Learning",
  BUSINESS_INTELLIGENCE: "Business Intelligence",
  SOFTWARE_ENGINEERING: "Software Engineering",
  DATA_ENGINEERING: "Data Engineering",
  PRODUCT_ANALYTICS: "Product Analytics",
  QUANTITATIVE_ANALYST: "Quantitative Analyst",
  OTHER: "Other",
};

export const SENIORITY_LABELS: Record<SeniorityLevel, string> = {
  INTERNSHIP: "Internship",
  NEW_GRAD: "New Grad",
  JUNIOR: "Junior",
  MID: "Mid-level",
  SENIOR: "Senior",
  UNKNOWN: "Not specified",
};

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  WISHLIST: "Wishlist",
  APPLIED: "Applied",
  OA_ASSESSMENT: "OA / Assessment",
  INTERVIEWING: "Interviewing",
  OFFER: "Offer",
  REJECTED: "Rejected",
  WITHDRAWN: "Withdrawn",
};

export const APPLICATION_STATUS_ORDER: ApplicationStatus[] = [
  "WISHLIST",
  "APPLIED",
  "OA_ASSESSMENT",
  "INTERVIEWING",
  "OFFER",
  "REJECTED",
  "WITHDRAWN",
];
