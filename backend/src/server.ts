import { createApp } from "./app";
import { env } from "./config/env";
import { startJobSyncScheduler } from "./services/jobSyncScheduler";

const app = createApp();

app.listen(env.PORT, () => {
  console.log(`JobAppHelper API listening on port ${env.PORT} (${env.NODE_ENV})`);
  startJobSyncScheduler();
});
