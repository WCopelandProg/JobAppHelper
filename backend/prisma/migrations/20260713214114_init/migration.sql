-- CreateEnum
CREATE TYPE "RemotePreference" AS ENUM ('REMOTE', 'HYBRID', 'ONSITE', 'ANY');

-- CreateEnum
CREATE TYPE "JobSourceProvider" AS ENUM ('REMOTIVE', 'ARBEITNOW', 'ADZUNA', 'SEED');

-- CreateEnum
CREATE TYPE "JobCategory" AS ENUM ('DATA_ANALYTICS', 'DATA_SCIENCE', 'MACHINE_LEARNING', 'BUSINESS_INTELLIGENCE', 'SOFTWARE_ENGINEERING', 'DATA_ENGINEERING', 'PRODUCT_ANALYTICS', 'QUANTITATIVE_ANALYST', 'OTHER');

-- CreateEnum
CREATE TYPE "SeniorityLevel" AS ENUM ('INTERNSHIP', 'NEW_GRAD', 'JUNIOR', 'MID', 'SENIOR', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('WISHLIST', 'APPLIED', 'OA_ASSESSMENT', 'INTERVIEWING', 'OFFER', 'REJECTED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "CoverLetterGenerationMethod" AS ENUM ('AI', 'TEMPLATE');

-- CreateEnum
CREATE TYPE "NetworkingLeadType" AS ENUM ('ALUMNI', 'RECRUITER', 'EMPLOYEE', 'OTHER');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "school" TEXT,
    "gradYear" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revoked" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "headline" TEXT,
    "location" TEXT,
    "remotePref" "RemotePreference" NOT NULL DEFAULT 'ANY',
    "yearsExperience" INTEGER DEFAULT 0,
    "targetRoles" TEXT[],
    "targetCategories" "JobCategory"[],
    "skills" TEXT[],
    "interests" TEXT[],
    "linkedinUrl" TEXT,
    "githubUrl" TEXT,
    "portfolioUrl" TEXT,
    "phone" TEXT,
    "bio" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Resume" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "storagePath" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileSizeBytes" INTEGER NOT NULL,
    "parsedText" TEXT,
    "parsedSkills" TEXT[],
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Resume_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Job" (
    "id" TEXT NOT NULL,
    "sourceProvider" "JobSourceProvider" NOT NULL,
    "sourceJobId" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "companyLogoUrl" TEXT,
    "location" TEXT,
    "remoteType" "RemotePreference" NOT NULL DEFAULT 'ANY',
    "category" "JobCategory" NOT NULL DEFAULT 'OTHER',
    "seniority" "SeniorityLevel" NOT NULL DEFAULT 'UNKNOWN',
    "descriptionHtml" TEXT NOT NULL,
    "descriptionText" TEXT NOT NULL,
    "tags" TEXT[],
    "salaryMin" INTEGER,
    "salaryMax" INTEGER,
    "salaryCurrency" TEXT,
    "postedAt" TIMESTAMP(3),
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavedJob" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Application" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "resumeId" TEXT,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'WISHLIST',
    "appliedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApplicationStatusEvent" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "status" "ApplicationStatus" NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApplicationStatusEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoverLetter" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "resumeId" TEXT,
    "applicationId" TEXT,
    "content" TEXT NOT NULL,
    "method" "CoverLetterGenerationMethod" NOT NULL DEFAULT 'TEMPLATE',
    "tone" TEXT DEFAULT 'professional',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CoverLetter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NetworkingLead" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "name" TEXT,
    "role" TEXT,
    "type" "NetworkingLeadType" NOT NULL DEFAULT 'OTHER',
    "linkedinUrl" TEXT,
    "email" TEXT,
    "notes" TEXT,
    "contacted" BOOLEAN NOT NULL DEFAULT false,
    "searchUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NetworkingLead_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_token_key" ON "RefreshToken"("token");

-- CreateIndex
CREATE INDEX "RefreshToken_userId_idx" ON "RefreshToken"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");

-- CreateIndex
CREATE INDEX "Resume_userId_idx" ON "Resume"("userId");

-- CreateIndex
CREATE INDEX "Job_category_idx" ON "Job"("category");

-- CreateIndex
CREATE INDEX "Job_company_idx" ON "Job"("company");

-- CreateIndex
CREATE INDEX "Job_postedAt_idx" ON "Job"("postedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Job_sourceProvider_sourceJobId_key" ON "Job"("sourceProvider", "sourceJobId");

-- CreateIndex
CREATE INDEX "SavedJob_userId_idx" ON "SavedJob"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SavedJob_userId_jobId_key" ON "SavedJob"("userId", "jobId");

-- CreateIndex
CREATE INDEX "Application_userId_status_idx" ON "Application"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Application_userId_jobId_key" ON "Application"("userId", "jobId");

-- CreateIndex
CREATE INDEX "ApplicationStatusEvent_applicationId_idx" ON "ApplicationStatusEvent"("applicationId");

-- CreateIndex
CREATE INDEX "CoverLetter_userId_idx" ON "CoverLetter"("userId");

-- CreateIndex
CREATE INDEX "CoverLetter_jobId_idx" ON "CoverLetter"("jobId");

-- CreateIndex
CREATE INDEX "NetworkingLead_userId_company_idx" ON "NetworkingLead"("userId", "company");

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resume" ADD CONSTRAINT "Resume_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedJob" ADD CONSTRAINT "SavedJob_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedJob" ADD CONSTRAINT "SavedJob_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicationStatusEvent" ADD CONSTRAINT "ApplicationStatusEvent_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoverLetter" ADD CONSTRAINT "CoverLetter_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoverLetter" ADD CONSTRAINT "CoverLetter_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoverLetter" ADD CONSTRAINT "CoverLetter_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoverLetter" ADD CONSTRAINT "CoverLetter_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NetworkingLead" ADD CONSTRAINT "NetworkingLead_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
