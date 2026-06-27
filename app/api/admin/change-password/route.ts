import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/session";
import { logError, logAudit, logWarn } from "@/lib/logger";

/**
 * POST /api/admin/change-password
 *
 * Body: { currentPassword: string, newPassword: string }
 *
 * Verifies the logged-in admin's current password, then stores a new bcrypt
 * hash. The target admin is taken from the signed session cookie (never from
 * the request body), so one admin can't change another's password.
 */
export async function POST(req: Request) {
  // ── Auth: resolve the admin from the signed session cookie ────────────────
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const session = await verifySessionToken(token);

  if (!session) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, error: "Current and new password are required" },
        { status: 400 },
      );
    }

    if (typeof newPassword !== "string" || newPassword.length < 8) {
      return NextResponse.json(
        { success: false, error: "New password must be at least 8 characters" },
        { status: 400 },
      );
    }

    if (currentPassword === newPassword) {
      return NextResponse.json(
        {
          success: false,
          error: "New password must be different from the current password",
        },
        { status: 400 },
      );
    }

    const [users]: any = await db.query(
      "SELECT id, password FROM admins WHERE username = ?",
      [session.u],
    );

    if (!users || users.length === 0) {
      return NextResponse.json(
        { success: false, error: "Admin account not found" },
        { status: 404 },
      );
    }

    const user = users[0];

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      logWarn("Failed password change (wrong current password)", {
        scope: "admin.change-password",
        username: session.u,
      });
      return NextResponse.json(
        { success: false, error: "Current password is incorrect" },
        { status: 401 },
      );
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await db.query("UPDATE admins SET password = ? WHERE id = ?", [
      hashed,
      user.id,
    ]);

    logAudit("admin.password_changed", { username: session.u });

    return NextResponse.json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    logError("Change password error:", error, { scope: "admin.change-password" });
    return NextResponse.json(
      { success: false, error: "Failed to change password" },
      { status: 500 },
    );
  }
}