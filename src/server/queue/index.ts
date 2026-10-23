import { Queue, Worker, type Job } from "bullmq";
import Redis from "ioredis";

export type QueueJobName =
  | "outline.generate"
  | "slides.generate"
  | "image.generate"
  | "evaluation.run"
  | "slide.regenerate";

export interface QueueJobPayload {
  lectureId: string;
  userId: string;
  type: QueueJobName;
  input?: Record<string, unknown>;
}

let connection: Redis | null = null;
let queue: Queue<QueueJobPayload> | null = null;

function getConnection(): Redis | null {
  if (process.env.USE_JOB_QUEUE !== "true") return null;
  if (connection) return connection;
  const url = process.env.REDIS_URL;
  if (!url) return null;
  connection = new Redis(url, { maxRetriesPerRequest: null });
  return connection;
}

export function getGenerationQueue(): Queue<QueueJobPayload> | null {
  const conn = getConnection();
  if (!conn) return null;
  if (!queue) {
    queue = new Queue<QueueJobPayload>("profdeck-generation", { connection: conn });
  }
  return queue;
}

export async function enqueueGenerationJob(
  payload: QueueJobPayload,
): Promise<{ queued: boolean; jobId?: string }> {
  const q = getGenerationQueue();
  if (!q) return { queued: false };
  const job = await q.add(payload.type, payload, {
    removeOnComplete: 100,
    removeOnFail: 50,
  });
  return { queued: true, jobId: job.id };
}

export function createGenerationWorker(
  processor: (job: Job<QueueJobPayload>) => Promise<void>,
): Worker<QueueJobPayload> | null {
  const conn = getConnection();
  if (!conn) return null;
  return new Worker<QueueJobPayload>("profdeck-generation", processor, {
    connection: conn,
  });
}
