import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import {
  createSessionToken,
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
} from "@/lib/session";
import {
  isRateLimited,
  recordHit,
  resetRateLimit,
  getClientIp,
} from "@/lib/rate-limit";
import { logError, logAudit, logWarn } from "@/lib/logger";

// Allow at most 5 failed attempts per IP per 15 minutes.
const LOGIN_MAX_ATTEMPTS = 5;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rlKey = `login:${ip}`;

  // Block if this IP has already burned through its failed attempts.
  const { limited, retryAfterSec } = isRateLimited(rlKey, LOGIN_MAX_ATTEMPTS);
  if (limited) {
    const minutes = Math.ceil(retryAfterSec / 60);
    return NextResponse.json(
      {
        success: false,
        message: `Too many login attempts. Try again in about ${minutes} minute${
          minutes === 1 ? "" : "s"
        }.`,
      },
      { status: 429, headers: { "Retry-After": String(retryAfterSec) } },
    );
  }

  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: "Username and password are required" },
        { status: 400 },
      );
    }

    const [users]: any = await db.query(
      "SELECT * FROM admins WHERE username = ?",
      [username],
    );

    if (users.length === 0) {
      // Count the miss against the IP, then return a generic error.
      recordHit(rlKey, LOGIN_WINDOW_MS);
      logWarn("Failed admin login (unknown username)", {
        scope: "admin.login",
        username,
        ip,
      });
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 },
      );
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      recordHit(rlKey, LOGIN_WINDOW_MS);
      logWarn("Failed admin login (wrong password)", {
        scope: "admin.login",
        username,
        ip,
      });
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 },
      );
    }

    // Success — clear the failure counter so a legitimate admin is never
    // penalised for earlier typos.
    resetRateLimit(rlKey);

    logAudit("admin.login", { username: user.username, ip });

    const token = await createSessionToken(user.username);
    const response = NextResponse.json({ success: true });

    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE_SECONDS,
    });

    return response;
  } catch (error) {
    logError("Login error:", error, { scope: "admin.login" });
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
}