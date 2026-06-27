import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/session";

/**
 * Guard for protected API routes. Returns a 401 if the request does NOT carry a
 * valid signed admin session, or null if authenticated. Previously this only
 * checked the cookie existed, so any forged cookie granted access.
 */
export async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  const session = await verifySessionToken(token);

  if (!session) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  return null;
}