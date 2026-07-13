import { JobProvider } from "../../types/job";
import { remotiveProvider } from "./remotiveProvider";
import { arbeitnowProvider } from "./arbeitnowProvider";
import { seedProvider } from "./seedProvider";

// Every job source the app knows about. Adding a new source (e.g. Adzuna,
// GitHub Jobs, a company ATS) means writing one file that implements
// JobProvider and registering it here — nothing else in the app changes.
export const jobProviders: JobProvider[] = [remotiveProvider, arbeitnowProvider, seedProvider];
