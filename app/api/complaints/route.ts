import { NextRequest, NextResponse } from "next/server";
import { logError } from "@/lib/logger";
import { db } from "../../../lib/db";
import { requireAdmin } from "@/lib/auth";
import { isRateLimited, recordHit, getClientIp } from "@/lib/rate-limit";

// Public submissions: at most 5 per IP per 10 minutes.
const SUBMIT_MAX = 5;
const SUBMIT_WINDOW_MS = 10 * 60 * 1000;

async function generateTrackingId(): Promise<string> {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const dateStr = `${yyyy}-${mm}-${dd}`;

  const [rows]: any = await db.query(
    `SELECT COUNT(*) as count FROM complaints 
     WHERE DATE(created_at) = CURDATE()`,
  );

  const todayCount = Number(rows[0].count) + 1;
  const number = String(todayCount).padStart(3, "0");

  return `${dateStr}-${number}`;
}

// =======================
// GET
//  - Public when looking up a single complaint by ?trackingId=...
//  - The full list / status filter is admin-only.
// =======================
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const trackingId = searchParams.get("trackingId");

    // Public path: citizen tracking a single complaint they submitted.
    if (trackingId) {
      const [complaints]: any = await db.query(
        `SELECT * FROM complaints WHERE tracking_id = ?`,
        [trackingId],
      );
      return NextResponse.json({ success: true, data: complaints });
    }

    // Everything else is an admin listing — protect it.
    const authError = await requireAdmin();
    if (authError) return authError;

    let complaints: any[];

    if (status && status !== "all") {
      [complaints] = (await db.query(
        `SELECT * FROM complaints WHERE status = ? ORDER BY created_at DESC`,
        [status],
      )) as any;
    } else {
      [complaints] = (await db.query(
        `SELECT * FROM complaints ORDER BY created_at DESC`,
      )) as any;
    }

    return NextResponse.json({ success: true, data: complaints });
  } catch (error) {
    logError("Error fetching complaints:", error, { scope: "complaints" });
    return NextResponse.json(
      { success: false, error: "Failed to fetch complaints" },
      { status: 500 },
    );
  }
}

// =======================
// POST (PUBLIC - citizen submits a complaint, rate-limited)
// =======================
export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const rlKey = `complaint:${ip}`;

  const { limited, retryAfterSec } = isRateLimited(rlKey, SUBMIT_MAX);
  if (limited) {
    const minutes = Math.ceil(retryAfterSec / 60);
    return NextResponse.json(
      {
        success: false,
        error: `Too many submissions. Please try again in about ${minutes} minute${
          minutes === 1 ? "" : "s"
        }.`,
      },
      { status: 429, headers: { "Retry-After": String(retryAfterSec) } },
    );
  }

  try {
    const body = await request.json();
    const {
      name,
      email,
      phone,
      address,
      category,
      subject,
      description,
      priority,
    } = body;

    if (!name || !phone || !category || !subject || !description) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Count this submission against the IP only once it passes validation.
    recordHit(rlKey, SUBMIT_WINDOW_MS);

    const trackingId = await generateTrackingId();

    const [result]: any = await db.query(
      `INSERT INTO complaints (tracking_id, name, email, phone, address, category, subject, description, priority)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        trackingId,
        name,
        email ?? null,
        phone,
        address ?? null,
        category,
        subject,
        description,
        priority ?? "medium",
      ],
    );

    const [newComplaint]: any = await db.query(
      `SELECT * FROM complaints WHERE id = ?`,
      [result.insertId],
    );

    return NextResponse.json({
      success: true,
      data: newComplaint[0],
      trackingId,
    });
  } catch (error) {
    logError("Error creating complaint:", error, { scope: "complaints" });
    return NextResponse.json(
      { success: false, error: "Failed to create complaint" },
      { status: 500 },
    );
  }
}

// =======================
// PATCH (PROTECTED - admin updates status / notes / assignment)
// =======================
export async function PATCH(request: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const body = await request.json();
    const { id, status, admin_notes, assigned_to } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Complaint ID is required" },
        { status: 400 },
      );
    }

    await db.query(
      `UPDATE complaints 
       SET 
         status = COALESCE(?, status),
         admin_notes = COALESCE(?, admin_notes),
         assigned_to = COALESCE(?, assigned_to),
         updated_at = NOW(),
         resolved_at = CASE WHEN ? = 'resolved' THEN NOW() ELSE resolved_at END
       WHERE id = ?`,
      [
        status ?? null,
        admin_notes ?? null,
        assigned_to ?? null,
        status ?? null,
        id,
      ],
    );

    const [updated]: any = await db.query(
      `SELECT * FROM complaints WHERE id = ?`,
      [id],
    );

    return NextResponse.json({ success: true, data: updated[0] });
  } catch (error) {
    logError("Error updating complaint:", error, { scope: "complaints" });
    return NextResponse.json(
      { success: false, error: "Failed to update complaint" },
      { status: 500 },
    );
  }
}