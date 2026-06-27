import { NextRequest, NextResponse } from "next/server";
import { logError } from "@/lib/logger";
import { db } from "../../../lib/db";
import { requireAdmin } from "@/lib/auth";
import { isRateLimited, recordHit, getClientIp } from "@/lib/rate-limit";

// Public submissions: at most 5 per IP per 10 minutes.
const SUBMIT_MAX = 5;
const SUBMIT_WINDOW_MS = 10 * 60 * 1000;

// Basic email sanity check (not exhaustive, just rejects obvious garbage).
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// =======================
// GET (PROTECTED - admin only)
// =======================
export async function GET(request: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    let messages: any[];

    if (status && status !== "all") {
      [messages] = (await db.query(
        `SELECT * FROM contact_messages WHERE status = ? ORDER BY created_at DESC`,
        [status],
      )) as any;
    } else {
      [messages] = (await db.query(
        `SELECT * FROM contact_messages ORDER BY created_at DESC`,
      )) as any;
    }

    return NextResponse.json({ success: true, data: messages });
  } catch (error) {
    logError("Error fetching messages:", error, { scope: "contact" });
    return NextResponse.json(
      { success: false, error: "Failed to fetch messages" },
      { status: 500 },
    );
  }
}

// =======================
// POST (PUBLIC - contact form submission, rate-limited)
// =======================
export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const rlKey = `contact:${ip}`;

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
    const { name, email, phone, subject, message } = body;

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: name, email, subject, message",
        },
        { status: 400 },
      );
    }

    if (!EMAIL_RE.test(String(email))) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid email address." },
        { status: 400 },
      );
    }

    // Count this submission against the IP only once it passes validation.
    recordHit(rlKey, SUBMIT_WINDOW_MS);

    const [result]: any = await db.query(
      `INSERT INTO contact_messages (name, email, phone, subject, message)
       VALUES (?, ?, ?, ?, ?)`,
      [name, email, phone ?? null, subject, message],
    );

    const [newMessage]: any = await db.query(
      `SELECT * FROM contact_messages WHERE id = ?`,
      [result.insertId],
    );

    return NextResponse.json(
      { success: true, data: newMessage[0] },
      { status: 201 },
    );
  } catch (error) {
    logError("Error creating message:", error, { scope: "contact" });
    return NextResponse.json(
      { success: false, error: "Failed to send message" },
      { status: 500 },
    );
  }
}

// =======================
// PATCH (PROTECTED - mark read/responded + response text)
// =======================
export async function PATCH(request: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const body = await request.json();
    const { id, status, response_message } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Message ID is required" },
        { status: 400 },
      );
    }

    const [existing]: any = await db.query(
      `SELECT id FROM contact_messages WHERE id = ?`,
      [id],
    );
    if (!existing || existing.length === 0) {
      return NextResponse.json(
        { success: false, error: "Message not found" },
        { status: 404 },
      );
    }

    await db.query(
      `UPDATE contact_messages 
       SET 
         status = COALESCE(?, status),
         response_message = COALESCE(?, response_message),
         responded_at = CASE WHEN ? = 'responded' THEN NOW() ELSE responded_at END
       WHERE id = ?`,
      [status ?? null, response_message ?? null, status ?? null, id],
    );

    const [updated]: any = await db.query(
      `SELECT * FROM contact_messages WHERE id = ?`,
      [id],
    );

    return NextResponse.json({ success: true, data: updated[0] });
  } catch (error) {
    logError("Error updating message:", error, { scope: "contact" });
    return NextResponse.json(
      { success: false, error: "Failed to update message" },
      { status: 500 },
    );
  }
}

// =======================
// DELETE (PROTECTED)
// =======================
export async function DELETE(request: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Message ID is required" },
        { status: 400 },
      );
    }

    const [existing]: any = await db.query(
      `SELECT id FROM contact_messages WHERE id = ?`,
      [id],
    );
    if (!existing || existing.length === 0) {
      return NextResponse.json(
        { success: false, error: "Message not found" },
        { status: 404 },
      );
    }

    await db.query(`DELETE FROM contact_messages WHERE id = ?`, [id]);

    return NextResponse.json({
      success: true,
      message: "Message deleted successfully",
    });
  } catch (error) {
    logError("Error deleting message:", error, { scope: "contact" });
    return NextResponse.json(
      { success: false, error: "Failed to delete message" },
      { status: 500 },
    );
  }
}