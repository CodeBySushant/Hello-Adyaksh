/**
 * Signed admin session tokens. Uses Web Crypto (crypto.subtle), available in
 * BOTH Node (API routes) and Edge (middleware). Set ADMIN_SECRET in .env.
 */
const encoder = new TextEncoder();
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function getSecret(): string {
  return process.env.ADMIN_SECRET || "hello-mayor-INSECURE-default-change-me";
}

function bufToHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function hmac(data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  return bufToHex(sig);
}

// Constant-time comparison to avoid timing attacks.
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

export interface SessionPayload {
  u: string; // username
  iat: number; // issued-at (ms)
}

export async function createSessionToken(username: string): Promise<string> {
  const payload: SessionPayload = { u: username, iat: Date.now() };
  const data = btoa(JSON.stringify(payload));
  const sig = await hmac(data);
  return `${data}.${sig}`;
}

export async function verifySessionToken(
  token: string | null | undefined,
): Promise<SessionPayload | null> {
  if (!token) return null;

  const [data, sig] = token.split(".");
  if (!data || !sig) return null;

  const expected = await hmac(data);
  if (!safeEqual(sig, expected)) return null;

  try {
    const payload = JSON.parse(atob(data)) as SessionPayload;
    if (typeof payload.iat !== "number") return null;
    if (Date.now() - payload.iat > MAX_AGE_MS) return null; // expired
    return payload;
  } catch {
    return null;
  }
}

export const SESSION_COOKIE = "admin-auth";
export const SESSION_MAX_AGE_SECONDS = MAX_AGE_MS / 1000;