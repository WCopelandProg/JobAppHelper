import Anthropic from "@anthropic-ai/sdk";
import { CoverLetterGenerationMethod, Job, Profile, Resume, User } from "@prisma/client";
import { env } from "../config/env";

interface GenerateInput {
  user: User;
  profile: Profile | null;
  job: Job;
  resume: Resume | null;
  tone?: string;
}

interface GenerateResult {
  content: string;
  method: CoverLetterGenerationMethod;
}

let anthropicClient: Anthropic | null = null;
function getClient(): Anthropic | null {
  if (!env.ANTHROPIC_API_KEY) return null;
  if (!anthropicClient) anthropicClient = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
  return anthropicClient;
}

export async function generateCoverLetter(input: GenerateInput): Promise<GenerateResult> {
  const client = getClient();
  if (client) {
    try {
      const content = await generateWithAI(client, input);
      return { content, method: CoverLetterGenerationMethod.AI };
    } catch (err) {
      console.error("AI cover letter generation failed, falling back to template:", err);
    }
  }
  return { content: generateFromTemplate(input), method: CoverLetterGenerationMethod.TEMPLATE };
}

async function generateWithAI(client: Anthropic, input: GenerateInput): Promise<string> {
  const { user, profile, job, resume, tone } = input;

  const prompt = `Write a concise, compelling cover letter (250-400 words) for the following applicant and job.
Do not invent facts not present in the provided details — if information is missing, keep language general rather than fabricating specifics.
Use a ${tone ?? "professional"} tone. Return only the letter body text, no subject line or markdown.

APPLICANT
Name: ${user.fullName}
School: ${user.school ?? "N/A"}
Headline: ${profile?.headline ?? "N/A"}
Skills: ${(profile?.skills ?? []).join(", ") || "N/A"}
Years of experience: ${profile?.yearsExperience ?? 0}
Bio: ${profile?.bio ?? "N/A"}
Resume excerpt: ${(resume?.parsedText ?? "").slice(0, 3000) || "N/A"}

JOB
Title: ${job.title}
Company: ${job.company}
Location: ${job.location ?? "N/A"}
Description: ${job.descriptionText.slice(0, 3000)}`;

  const message = await client.messages.create({
    model: "claude-sonnet-5",
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });

  const textBlock = message.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") throw new Error("AI response contained no text");
  return textBlock.text.trim();
}

// Deterministic, template-based generator used when no AI key is configured
// (or the AI call fails) so the feature always works out of the box.
function generateFromTemplate(input: GenerateInput): string {
  const { user, profile, job, resume } = input;
  const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  const skills = uniqueTop(
    [...(profile?.skills ?? []), ...(resume?.parsedSkills ?? [])],
    5,
  );
  const skillsSentence =
    skills.length > 0
      ? `My relevant skills include ${skills.join(", ")}, which align directly with the requirements of this role.`
      : "I bring a strong foundation in analytical and technical problem solving that aligns with this role.";

  const headline = profile?.headline ? `as a ${profile.headline}` : "in this field";
  const school = user.school ? ` at ${user.school}` : "";

  return `${today}

Dear ${job.company} Hiring Team,

I am writing to express my interest in the ${job.title} position at ${job.company}. As a student${school} pursuing opportunities ${headline}, I was excited to see this opening and believe my background makes me a strong candidate.

${skillsSentence} I am particularly drawn to ${job.company} because of the opportunity to apply my skills to real-world, high-impact problems, and to grow alongside a team that values data-driven decision making.

${profile?.bio ? profile.bio + " " : ""}I am confident that my analytical mindset, attention to detail, and eagerness to learn would allow me to contribute meaningfully to your team from day one.

Thank you for considering my application. I would welcome the opportunity to discuss how my background aligns with the needs of your team.

Sincerely,
${user.fullName}`;
}

function uniqueTop(values: string[], n: number): string[] {
  return Array.from(new Set(values)).slice(0, n);
}
