import { ApplicationStatus, JobCategory, NetworkingLeadType, PrismaClient, RemotePreference } from "@prisma/client";
import bcrypt from "bcryptjs";
import { seedProvider } from "../src/services/providers/seedProvider";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // --- Jobs (curated sample provider; live providers are synced separately at boot/via cron/API) ---
  const jobs = await seedProvider.fetchJobs();
  const createdJobs = [];
  for (const job of jobs) {
    const { sourceProvider, sourceJobId, ...rest } = job;
    const created = await prisma.job.upsert({
      where: { sourceProvider_sourceJobId: { sourceProvider, sourceJobId } },
      create: { sourceProvider, sourceJobId, ...rest },
      update: { ...rest },
    });
    createdJobs.push(created);
  }
  console.log(`Seeded ${createdJobs.length} sample jobs.`);

  // --- Demo user ---
  const demoPassword = await bcrypt.hash("Password123!", 12);
  const demoUser = await prisma.user.upsert({
    where: { email: "demo@jobapphelper.dev" },
    create: {
      email: "demo@jobapphelper.dev",
      passwordHash: demoPassword,
      fullName: "Jordan Rivera",
      school: "State University",
      gradYear: 2027,
      profile: {
        create: {
          headline: "Data Science & ML student seeking internships",
          location: "Remote / California",
          remotePref: RemotePreference.ANY,
          yearsExperience: 0,
          targetRoles: ["Data Analyst", "Data Scientist", "Machine Learning Engineer"],
          targetCategories: [
            JobCategory.DATA_SCIENCE,
            JobCategory.DATA_ANALYTICS,
            JobCategory.MACHINE_LEARNING,
          ],
          skills: ["Python", "SQL", "pandas", "Machine Learning", "Tableau"],
          interests: ["analytics", "experimentation", "recommendation systems"],
          bio: "Junior studying Statistics & Computer Science, passionate about turning data into decisions.",
        },
      },
    },
    update: {},
    include: { profile: true },
  });
  console.log(`Seeded demo user: ${demoUser.email} (password: Password123!)`);

  // --- Saved jobs ---
  const jobsToSave = createdJobs.slice(0, 4);
  for (const job of jobsToSave) {
    await prisma.savedJob.upsert({
      where: { userId_jobId: { userId: demoUser.id, jobId: job.id } },
      create: { userId: demoUser.id, jobId: job.id },
      update: {},
    });
  }
  console.log(`Saved ${jobsToSave.length} jobs for demo user.`);

  // --- Applications across the pipeline ---
  const statuses: ApplicationStatus[] = [
    ApplicationStatus.WISHLIST,
    ApplicationStatus.APPLIED,
    ApplicationStatus.OA_ASSESSMENT,
    ApplicationStatus.INTERVIEWING,
    ApplicationStatus.OFFER,
  ];
  for (let i = 0; i < Math.min(statuses.length, createdJobs.length); i++) {
    const status = statuses[i];
    await prisma.application.upsert({
      where: { userId_jobId: { userId: demoUser.id, jobId: createdJobs[i].id } },
      create: {
        userId: demoUser.id,
        jobId: createdJobs[i].id,
        status,
        appliedAt: status === ApplicationStatus.WISHLIST ? null : new Date(),
        statusHistory: { create: { status } },
      },
      update: {},
    });
  }
  console.log("Seeded sample applications across the tracking pipeline.");

  // --- Networking leads ---
  await prisma.networkingLead.createMany({
    data: [
      {
        userId: demoUser.id,
        company: "Meta",
        type: NetworkingLeadType.ALUMNI,
        notes: "Search LinkedIn for State University alumni working at Meta.",
        searchUrl: "https://www.linkedin.com/search/results/people/?keywords=Meta%20State%20University",
      },
      {
        userId: demoUser.id,
        company: "Spotify",
        type: NetworkingLeadType.RECRUITER,
        notes: "Reach out to university recruiting team ahead of applying.",
        searchUrl: "https://www.linkedin.com/search/results/people/?keywords=Spotify%20recruiter",
      },
    ],
    skipDuplicates: true,
  });
  console.log("Seeded sample networking leads.");

  console.log("Seeding complete.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
