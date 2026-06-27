import { NextRequest, NextResponse } from "next/server";
import { logError } from "@/lib/logger";
import { db } from "../../../lib/db";
import { requireAdmin } from "@/lib/auth";

// =======================
// GET
// =======================
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reportType = searchParams.get("type");
    const fiscalYear = searchParams.get("year");
    const adminView = searchParams.get("admin"); // admin=true → return drafts too

    let conditions: string[] = [];
    const params: any[] = [];

    if (adminView !== "true") {
      conditions.push("is_published = true");
    }

    if (reportType && reportType !== "all") {
      conditions.push(`report_type = ?`);
      params.push(reportType);
    }

    if (fiscalYear && fiscalYear !== "all") {
      conditions.push(`fiscal_year = ?`);
      params.push(fiscalYear);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const query = `
      SELECT id, title_en, title_np, description_en, description_np,
             report_type, fiscal_year, file_url, file_size, download_count,
             is_published, published_at, created_at
      FROM reports
      ${whereClause}
      ORDER BY published_at DESC, created_at DESC
    `;

    const [reports]: any = await db.query(query, params);

    return NextResponse.json({ success: true, data: reports });
  } catch (error) {
    logError("Reports fetch error:", error, { scope: "reports" });
    return NextResponse.json(
      { success: false, error: "Failed to fetch reports" },
      { status: 500 }
    );
  }
}

// =======================
// POST (PROTECTED)
// =======================
export async function POST(request: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const body = await request.json();
    const {
      title_en,
      title_np,
      description_en,
      description_np,
      report_type,
      fiscal_year,
      file_url,
      file_size,
      is_published,
    } = body;

    if (!title_en || !report_type || !fiscal_year || !file_url) {
      return NextResponse.json(
        { success: false, error: "Required fields missing: title_en, report_type, fiscal_year, file_url" },
        { status: 400 }
      );
    }

    const published = is_published === true || is_published === 1;

    const [result]: any = await db.query(
      `INSERT INTO reports (
        title_en, title_np, description_en, description_np,
        report_type, fiscal_year, file_url, file_size,
        is_published, published_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title_en,
        title_np ?? null,
        description_en ?? null,
        description_np ?? null,
        report_type,
        fiscal_year,
        file_url,
        file_size ?? 0,
        published,
        published ? new Date() : null,
      ]
    );

    const [newReport]: any = await db.query(
      `SELECT * FROM reports WHERE id = ?`, [result.insertId]
    );

    return NextResponse.json({ success: true, data: newReport[0] }, { status: 201 });
  } catch (error) {
    logError("Report create error:", error, { scope: "reports" });
    return NextResponse.json(
      { success: false, error: "Failed to create report" },
      { status: 500 }
    );
  }
}

// =======================
// PUT (PROTECTED)
// =======================
export async function PUT(request: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const body = await request.json();
    const {
      id,
      title_en,
      title_np,
      description_en,
      description_np,
      report_type,
      fiscal_year,
      file_url,
      file_size,
      is_published,
    } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Report ID is required" },
        { status: 400 }
      );
    }

    if (!title_en || !report_type || !fiscal_year || !file_url) {
      return NextResponse.json(
        { success: false, error: "Required fields missing" },
        { status: 400 }
      );
    }

    // Fetch current state to decide published_at
    const [existing]: any = await db.query(
      `SELECT is_published, published_at FROM reports WHERE id = ?`,
      [id]
    );

    if (!existing || existing.length === 0) {
      return NextResponse.json(
        { success: false, error: "Report not found" },
        { status: 404 }
      );
    }

    const wasPublished = existing[0].is_published;
    const nowPublished = is_published === true || is_published === 1;

    // Set published_at only when transitioning to published for the first time
    let publishedAt = existing[0].published_at;
    if (nowPublished && !wasPublished) {
      publishedAt = new Date();
    }

    await db.query(
      `UPDATE reports SET
        title_en = ?, title_np = ?, description_en = ?, description_np = ?,
        report_type = ?, fiscal_year = ?, file_url = ?, file_size = ?,
        is_published = ?, published_at = ?
      WHERE id = ?`,
      [
        title_en,
        title_np ?? null,
        description_en ?? null,
        description_np ?? null,
        report_type,
        fiscal_year,
        file_url,
        file_size ?? 0,
        nowPublished,
        publishedAt,
        id,
      ]
    );

    const [updated]: any = await db.query(
      `SELECT * FROM reports WHERE id = ?`,
      [id]
    );

    return NextResponse.json({ success: true, data: updated[0] });
  } catch (error) {
    logError("Report update error:", error, { scope: "reports" });
    return NextResponse.json(
      { success: false, error: "Failed to update report" },
      { status: 500 }
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
        { success: false, error: "Report ID is required" },
        { status: 400 }
      );
    }

    const [existing]: any = await db.query(
      `SELECT id FROM reports WHERE id = ?`,
      [id]
    );

    if (!existing || existing.length === 0) {
      return NextResponse.json(
        { success: false, error: "Report not found" },
        { status: 404 }
      );
    }

    await db.query(`DELETE FROM reports WHERE id = ?`, [id]);

    return NextResponse.json({ success: true, message: "Report deleted successfully" });
  } catch (error) {
    logError("Report delete error:", error, { scope: "reports" });
    return NextResponse.json(
      { success: false, error: "Failed to delete report" },
      { status: 500 }
    );
  }
}