import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Create a Redis instance (uses env variables automatically)
// UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
});

// Rate limiter for API routes - 10 requests per 60 seconds
export const apiRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "60 s"),
  analytics: true,
  prefix: "@parapixel/api",
});

// Rate limiter for expensive operations (PDF export) - 5 per minute
export const pdfExportLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "60 s"),
  analytics: true,
  prefix: "@parapixel/pdf",
});
