import cron from "node-cron";
import { env } from "../config/env";
import { syncAllProviders } from "./jobService";

export function startJobSyncScheduler() {
  if (!cron.validate(env.JOB_SYNC_CRON)) {
    console.warn(`Invalid JOB_SYNC_CRON "${env.JOB_SYNC_CRON}", skipping scheduled sync`);
    return;
  }

  cron.schedule(env.JOB_SYNC_CRON, async () => {
    console.log("[jobSync] running scheduled provider sync...");
    const results = await syncAllProviders();
    console.log("[jobSync] complete:", results);
  });

  if (env.JOB_SYNC_ON_BOOT) {
    syncAllProviders()
      .then((results) => console.log("[jobSync] boot sync complete:", results))
      .catch((err) => console.error("[jobSync] boot sync failed:", err));
  }
}
