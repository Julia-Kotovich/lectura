import Redis from "ioredis";

const memoryStore = new Map<string, { value: string; expiresAt: number }>();

let redis: Redis | null = null;

function getRedis(): Redis | null {
  if (redis) return redis;
  const url = process.env.REDIS_URL;
  if (!url) return null;
  try {
    redis = new Redis(url, { maxRetriesPerRequest: 1, lazyConnect: true });
    redis.on("error", () => {
      redis = null;
    });
    return redis;
  } catch {
    return null;
  }
}

export async function cacheGet(key: string): Promise<string | null> {
  const client = getRedis();
  if (client) {
    try {
      return await client.get(`profdeck:${key}`);
    } catch {
      /* fallback */
    }
  }
  const entry = memoryStore.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    memoryStore.delete(key);
    return null;
  }
  return entry.value;
}

export async function cacheSet(
  key: string,
  value: string,
  ttlSeconds = 86400,
): Promise<void> {
  const client = getRedis();
  if (client) {
    try {
      await client.set(`profdeck:${key}`, value, "EX", ttlSeconds);
      return;
    } catch {
      /* fallback */
    }
  }
  memoryStore.set(key, {
    value,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
}

export function hashPrompt(parts: Record<string, unknown>): string {
  const raw = JSON.stringify(parts);
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    hash = (hash << 5) - hash + raw.charCodeAt(i);
    hash |= 0;
  }
  return `p_${Math.abs(hash)}`;
}
