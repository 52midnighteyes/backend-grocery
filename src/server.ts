import app from "./app.js";
import { PORT } from "./config/config.js";
import { startAutoCancelOrderJob } from "./jobs/autoCancelOrder.job.js";
import { startAutoConfirmOrderJob } from "./jobs/autoConfirmOrder.job.js";

app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
  startAutoCancelOrderJob();
  startAutoConfirmOrderJob();
});