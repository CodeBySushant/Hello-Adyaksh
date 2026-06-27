import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/session";
import { logAudit } from "@/lib/logger";

export async function POST() {
  // Best-effort: capture who is logging out for the audit log.
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;
    const session = await verifySessionToken(token);
    logAudit("admin.logout", { username: session?.u ?? "unknown" });
  } catch {
    // Never let logging block a logout.
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    expires: new Date(0),
    path: "/",
  });
  return response;
}