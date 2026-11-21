import { Redis } from 'ioredis';

interface MemoryEntry {
  value: string;
  expiresAt: number | null; // null = never expires
}

const memoryStore = new Map<string, MemoryEntry>();
let redisClient: Redis | null = null;
let redisReady = false;

function initRedisIfConfigured(): Redis | null {
  if (redisClient) return redisClient;
  const url = process.env.REDIS_URL?.trim();
  if (!url) return null;

  try {
    redisClient = new Redis(url, {
      maxRetriesPerRequest: 1,
      enableReadyCheck: true,
      lazyConnect: true,
    });
    redisClient.on('ready', () => {
      redisReady = true;
    });
    redisClient.on('error', () => {
      redisReady = false;
    });
    redisClient.connect().catch(() => {
      redisReady = false;
    });
    return redisClient;
  } catch {
    return null;
  }
}

initRedisIfConfigured();

export function getRedisClient(): Redis | null {
  return redisReady ? redisClient : null;
}

export async function cacheGet<T = unknown>(key: string): Promise<T | null> {
  const client = getRedisClient();
  if (client) {
    try {
      const raw = await client.get(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      // fallback to memory
    }
  }

  const entry = memoryStore.get(key);
  if (!entry) return null;
  if (entry.expiresAt !== null && Date.now() > entry.expiresAt) {
    memoryStore.delete(key);
    return null;
  }
  try {
    return JSON.parse(entry.value) as T;
  } catch {
    return null;
  }
}

export async function cacheSet(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
  const serialized = JSON.stringify(value);
  const client = getRedisClient();
  if (client) {
    try {
      if (ttlSeconds && ttlSeconds > 0) {
        await client.set(key, serialized, 'EX', ttlSeconds);
      } else {
        await client.set(key, serialized);
      }
      return;
    } catch {
      // fallback to memory
    }
  }

  // 控制單機記憶體快取上限防止 OOM
  if (memoryStore.size > 5000) {
    const firstKey = memoryStore.keys().next().value;
    if (firstKey) memoryStore.delete(firstKey);
  }
  memoryStore.set(key, {
    value: serialized,
    expiresAt: ttlSeconds && ttlSeconds > 0 ? Date.now() + ttlSeconds * 1000 : null,
  });
}

export async function incrementCounter(key: string, windowSeconds: number): Promise<number> {
  const client = getRedisClient();
  if (client) {
    try {
      const count = await client.incr(key);
      if (count === 1) {
        await client.expire(key, windowSeconds);
      }
      return count;
    } catch {
      // fallback to memory
    }
  }

  const now = Date.now();
  const existing = memoryStore.get(key);
  if (!existing || (existing.expiresAt !== null && now > existing.expiresAt)) {
    memoryStore.set(key, { value: '1', expiresAt: now + windowSeconds * 1000 });
    return 1;
  }
  const next = Number(existing.value || '0') + 1;
  existing.value = String(next);
  return next;
}
