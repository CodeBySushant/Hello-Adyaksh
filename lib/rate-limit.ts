/**
 * Lightweight in-memory rate limiter (fixed-window).
 *
 * Scope & limitations:
 *  - State lives in this process's memory. It is perfect for a single-server
 *    (single VPS) deployment, which is how this app is intended to run.
 *  - It does NOT share state across multiple instances or serverless
 *    functions. If you scale horizontally or deploy to a serverless platform,
 *    replace the store with Redis / Upstash / a DB table (same function
 *    signatures, different backing store).
 *  - Counters reset on server restart.
 *
 * Use only from Node-runtime API routes (not Edge middleware).
 */

import type { NextRequest } from "next/server";

interface Bucket {
  count: number;
  resetAt: number; // epoch ms when the window expires
}

// Survive Next.js dev hot-reloads (which re-evaluate modules) by stashing the
// store on globalThis, the same trick lib/db.ts uses for the MySQL pool.
const globalForRL = globalThis as unknown as {
  _rateLimitStore?: Map<string, Bucket>;
  _rateLimitLastSweep?: number;
};

const store: Map<string, Bucket> =
  globalForRL._rateLimitStore ?? new Map<string, Bucket>();
globalForRL._rateLimitStore = store;

const SWEEP_INTERVAL_MS = 60_000;

/** Drop expired buckets occasionally so the Map can't grow without bound. */
function maybeSweep(now: number) {
  const last = globalForRL._rateLimitLastSweep ?? 0;
  if (now - last < SWEEP_INTERVAL_MS) return;
  globalForRL._rateLimitLastSweep = now;
  for (const [key, bucket] of store) {
    if (bucket.resetAt <= now) store.delete(key);
  }
}

/**
 * Check whether a key is currently over its limit, WITHOUT recording a hit.
 * Returns how many seconds until the window resets (for Retry-After).
 */
export function isRateLimited(
  key: string,
  limit: number,
): { limited: boolean; retryAfterSec: number } {
  const now = Date.now();
  maybeSweep(now);

  const bucket = store.get(key);
  if (!bucket || bucket.resetAt <= now) {
    return { limited: false, retryAfterSec: 0 };
  }
  return {
    limited: bucket.count >= limit,
    retryAfterSec: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
  };
}

/** Record one hit against a key, starting a fresh window if needed. */
export function recordHit(key: string, windowMs: number): void {
  const now = Date.now();
  let bucket = store.get(key);
  if (!bucket || bucket.resetAt <= now) {
    bucket = { count: 0, resetAt: now + windowMs };
    store.set(key, bucket);
  }
  bucket.count += 1;
}

/** Clear a key entirely (e.g. after a successful login). */
export function resetRateLimit(key: string): void {
  store.delete(key);
}

/**
 * Best-effort client IP from proxy headers. Behind Nginx/Cloudflare/Vercel
 * the real IP arrives in x-forwarded-for (comma-separated; first entry is the
 * original client) or x-real-ip. Falls back to "unknown" so the limiter still
 * functions (all unknown clients share one bucket) rather than throwing.
 */
export function getClientIp(request: NextRequest | Request): string {
  const h = request.headers;
  const xff = h.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  return h.get("x-real-ip") || h.get("cf-connecting-ip") || "unknown";
}