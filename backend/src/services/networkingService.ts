import { NetworkingLeadType } from "@prisma/client";
import { prisma } from "../utils/prisma";
import { AppError } from "../utils/AppError";

// We don't have a LinkedIn/alumni-directory API integration, so instead of
// fabricating fake people (which would be misleading), we generate
// pre-built LinkedIn people-search URLs scoped to "this company + my
// school" and "this company + alumni". The user opens the search and adds
// real contacts they find as leads to track.
export function buildSuggestedSearches(company: string, school?: string | null) {
  const searches: Array<{ label: string; url: string; type: NetworkingLeadType }> = [];

  const companyQuery = encodeURIComponent(company);
  searches.push({
    label: `People who work at ${company}`,
    url: `https://www.linkedin.com/search/results/people/?keywords=${companyQuery}`,
    type: NetworkingLeadType.EMPLOYEE,
  });

  if (school) {
    const combinedQuery = encodeURIComponent(`${company} ${school}`);
    searches.push({
      label: `${school} alumni at ${company}`,
      url: `https://www.linkedin.com/search/results/people/?keywords=${combinedQuery}`,
      type: NetworkingLeadType.ALUMNI,
    });
  }

  searches.push({
    label: `Recruiters at ${company}`,
    url: `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(`${company} recruiter`)}`,
    type: NetworkingLeadType.RECRUITER,
  });

  return searches;
}

export async function listLeads(userId: string) {
  return prisma.networkingLead.findMany({ where: { userId }, orderBy: { createdAt: "desc" } });
}

export async function createLead(
  userId: string,
  input: {
    company: string;
    name?: string;
    role?: string;
    type?: NetworkingLeadType;
    linkedinUrl?: string;
    email?: string;
    notes?: string;
    searchUrl?: string;
  },
) {
  return prisma.networkingLead.create({ data: { userId, ...input } });
}

export async function updateLead(
  userId: string,
  leadId: string,
  input: Partial<{
    name: string;
    role: string;
    type: NetworkingLeadType;
    linkedinUrl: string;
    email: string;
    notes: string;
    contacted: boolean;
  }>,
) {
  const existing = await prisma.networkingLead.findUnique({ where: { id: leadId } });
  if (!existing || existing.userId !== userId) throw AppError.notFound("Networking lead not found");
  return prisma.networkingLead.update({ where: { id: leadId }, data: input });
}

export async function deleteLead(userId: string, leadId: string) {
  const existing = await prisma.networkingLead.findUnique({ where: { id: leadId } });
  if (!existing || existing.userId !== userId) throw AppError.notFound("Networking lead not found");
  await prisma.networkingLead.delete({ where: { id: leadId } });
}
