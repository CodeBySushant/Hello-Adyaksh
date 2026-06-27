import { NextRequest, NextResponse } from "next/server";
import { logError } from "@/lib/logger";
import { unlink } from "fs/promises";
import path from "path";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

// =======================
// PUT - Update report metadata
// =======================
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const { id: rawId } = await params;
    const id = parseInt(rawId);
    if (isNaN(id)) {
      return NextResponse.json({ success: false, error: "Invalid ID" }, { status: 400 });
    }

    const body = await request.json();
    const {
      title_en, title_np, description_en, description_np,
      report_type, fiscal_year, is_published,
    } = body;

    if (!title_en || !report_type || !fiscal_year) {
      return NextResponse.json(
        { success: false, error: "Title, type and fiscal year are required" },
        { status: 400 }
      );
    }

    await db.query(
      `UPDATE reports SET
        title_en = ?, title_np = ?,
        description_en = ?, description_np = ?,
        report_type = ?, fiscal_year = ?,
        is_published = ?,
        published_at = CASE WHEN ? = true AND is_published = false THEN NOW() ELSE published_at END
      WHERE id = ?`,
      [
        title_en, title_np ?? null,
        description_en ?? null, description_np ?? null,
        report_type, fiscal_year,
        is_published ?? false,
        is_published ?? false,
        id,
      ]
    );

    const [updated]: any = await db.query(`SELECT * FROM reports WHERE id = ?`, [id]);
    if (!updated || updated.length === 0) {
      return NextResponse.json({ success: false, error: "Report not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated[0] });
  } catch (error) {
    logError("Report update error:", error, { scope: "reports.id" });
    return NextResponse.json({ success: false, error: "Failed to update report" }, { status: 500 });
  }
}

// =======================
// DELETE - Remove report + file from disk
// =======================
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const { id: rawId } = await params;
    const id = parseInt(rawId);
    if (isNaN(id)) {
      return NextResponse.json({ success: false, error: "Invalid ID" }, { status: 400 });
    }

    const [rows]: any = await db.query(
      `SELECT file_url FROM reports WHERE id = ?`, [id]
    );
    if (!rows || rows.length === 0) {
      return NextResponse.json({ success: false, error: "Report not found" }, { status: 404 });
    }

    await db.query(`DELETE FROM reports WHERE id = ?`, [id]);

    // Delete file from disk if it's a local upload
    const fileUrl: string = rows[0].file_url;
    if (fileUrl && fileUrl.startsWith("/uploads/")) {
      try {
        await unlink(path.join(process.cwd(), "public", fileUrl));
      } catch { /* file may not exist, that's fine */ }
    }

    return NextResponse.json({ success: true, message: "Deleted successfully" });
  } catch (error) {
    logError("Report delete error:", error, { scope: "reports.id" });
    return NextResponse.json({ success: false, error: "Failed to delete report" }, { status: 500 });
  }
}

// =======================
// PATCH - Increment download count (public)
// =======================
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await params;
    const id = parseInt(rawId);
    if (isNaN(id)) {
      return NextResponse.json({ success: false, error: "Invalid ID" }, { status: 400 });
    }
    await db.query(`UPDATE reports SET download_count = download_count + 1 WHERE id = ?`, [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to update count" }, { status: 500 });
  }
}