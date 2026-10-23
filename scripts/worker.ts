import { createGenerationWorker } from "../src/server/queue";
import { generateAndSaveOutline, generateAndSaveSlides } from "../src/server/services/lecture";
import type { Job } from "bullmq";
import type { QueueJobPayload } from "../src/server/queue";

async function processJob(job: Job<QueueJobPayload>) {
  const { lectureId, userId, type } = job.data;

  switch (type) {
    case "outline.generate":
      await generateAndSaveOutline(lectureId, userId);
      break;
    case "slides.generate":
      await generateAndSaveSlides(lectureId, userId);
      break;
    default:
      console.warn(`Unknown job type: ${type}`);
  }
}

const worker = createGenerationWorker(processJob);

if (worker) {
  console.log("ProfDeck generation worker started");
  worker.on("completed", (job) => console.log(`Job ${job.id} completed`));
  worker.on("failed", (job, err) => console.error(`Job ${job?.id} failed`, err));
} else {
  console.log(
    "Worker not started: set USE_JOB_QUEUE=true and REDIS_URL, or jobs run synchronously in API",
  );
  process.exit(0);
}
