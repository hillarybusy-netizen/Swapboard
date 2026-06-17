/**
 * A lightweight, in-memory sliding window rate limiter.
 * Note: In a serverless environment (like Vercel), memory is not shared 
 * across invocations or edge nodes. This will provide basic protection
 * against sudden bursts from a single IP on the same instance, but is not
 * a true distributed rate limiter (like Redis/Upstash).
 */

interface RateLimitTracker {
  count: number;
  resetAt: number;
}

const rateLimits = new Map<string, RateLimitTracker>();

export function checkRateLimit(ip: string, limit: number, windowMs: number): { success: boolean; error?: string } {
  const now = Date.now();
  const record = rateLimits.get(ip);

  // Clean up expired records occasionally to prevent memory leaks in long-running instances
  if (Math.random() < 0.01) {
    for (const [key, val] of rateLimits.entries()) {
      if (now > val.resetAt) rateLimits.delete(key);
    }
  }

  if (!record || now > record.resetAt) {
    rateLimits.set(ip, { count: 1, resetAt: now + windowMs });
    return { success: true };
  }

  if (record.count >= limit) {
    return { success: false, error: "Too many requests. Please try again later." };
  }

  record.count++;
  return { success: true };
}
