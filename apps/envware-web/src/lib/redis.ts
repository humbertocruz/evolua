import { createClient } from 'redis';

const redisUrl = process.env.REDIS_URL || process.env.KV_URL;

const globalForRedis = global as unknown as { redis: ReturnType<typeof createClient> };

export const redis =
  globalForRedis.redis ||
  createClient({
    url: redisUrl,
  });

if (process.env.NODE_ENV !== 'production') globalForRedis.redis = redis;

if (!redis.isOpen && redisUrl && typeof window === 'undefined' && process.env.NEXT_PHASE !== 'phase-production-build') {
  redis.connect().catch(err => {
    console.warn('⚠️  Redis connection failed (optional):', err.message);
  });
}
