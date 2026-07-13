import fs from "fs/promises";

// A pragmatic dictionary of skills/tools relevant to the app's target
// roles (data/ML/analytics/SWE). Extraction is a simple case-insensitive
// scan of parsed resume text against this list — good enough to seed a
// user's profile and cover letters without requiring manual entry.
const SKILL_DICTIONARY = [
  "Python", "R", "SQL", "Java", "C++", "C#", "JavaScript", "TypeScript", "Go", "Scala", "Julia",
  "pandas", "NumPy", "scikit-learn", "TensorFlow", "PyTorch", "Keras", "XGBoost",
  "Tableau", "Power BI", "Looker", "Excel", "Google Sheets",
  "Spark", "Hadoop", "Airflow", "dbt", "Kafka", "Snowflake", "BigQuery", "Redshift",
  "AWS", "Azure", "GCP", "Docker", "Kubernetes", "Git", "Linux",
  "React", "Node.js", "Django", "Flask", "REST API", "GraphQL",
  "A/B Testing", "Statistics", "Machine Learning", "Deep Learning", "NLP", "Computer Vision",
  "Data Visualization", "ETL", "Data Warehousing", "Regression", "Hypothesis Testing",
  "Jupyter", "MATLAB", "SAS", "PostgreSQL", "MySQL", "MongoDB",
];

export async function parseResumeFile(filePath: string, mimeType: string): Promise<string> {
  if (mimeType === "application/pdf") {
    // Lazy-required so the (fairly heavy) pdf-parse module only loads when needed.
    const pdfParse = (await import("pdf-parse")).default;
    const buffer = await fs.readFile(filePath);
    const data = await pdfParse(buffer);
    return data.text;
  }

  // .doc/.docx: we don't ship a dependency for full parsing here. The file
  // is still stored and downloadable; the user can edit extracted skills manually.
  return "";
}

export function extractSkillsFromText(text: string): string[] {
  if (!text) return [];
  const found = new Set<string>();
  const lower = text.toLowerCase();
  for (const skill of SKILL_DICTIONARY) {
    const pattern = new RegExp(`(^|[^a-z0-9+#.])${escapeRegex(skill.toLowerCase())}($|[^a-z0-9+#.])`, "i");
    if (pattern.test(` ${lower} `)) found.add(skill);
  }
  return Array.from(found);
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
