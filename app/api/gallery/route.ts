import { NextRequest, NextResponse } from "next/server";
import { logError } from "@/lib/logger";
import { unlink } from "fs/promises";
import path from "path";
import { db } from "../../../lib/db";
import { requireAdmin } from "@/lib/auth";

// =======================
// GET (PUBLIC)
// =======================
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const category = searchParams.get("category");
    const limit = searchParams.get("limit");

    const conditions: string[] = [];
    const params: any[] = [];

    if (category && category !== "all") {
      conditions.push("category = ?");
      params.push(category);
    }

    const where =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    let query = `
      SELECT 
        id,
        title_en,
        title_np,
        description_en,
        description_np,
        media_type,
        media_url,
        thumbnail_url,
        category,
        event_date,
        is_featured,
        sort_order,
        created_at
      FROM gallery_items
      ${where}
      ORDER BY is_featured DESC, sort_order ASC, created_at DESC
    `;

    if (limit) {
      query += ` LIMIT ?`;
      params.push(Number(limit));
    }

    const [items]: any = await db.query(query, params);

    return NextResponse.json(
      {
        success: true,
        data: items,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120",
        },
      },
    );
  } catch (error) {
    logError("Gallery fetch error:", error, { scope: "gallery" });

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch gallery items",
      },
      { status: 500 },
    );
  }
}

// =======================
// POST — Save a gallery item.
//
// The file itself is uploaded separately by the client to
// /api/gallery/upload, which writes it to public/uploads/gallery and
// returns a local URL like "/uploads/gallery/<name>". This route just
// persists the metadata + that URL in the DB.
//
// Accepts EITHER multipart/form-data (what the admin page sends) OR a
// JSON body, so it is robust to both callers.
// =======================
export async function POST(request: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const contentType = request.headers.get("content-type") || "";

    let title_en: string | null = null;
    let title_np: string | null = null;
    let description_en: string | null = null;
    let description_np: string | null = null;
    let media_type = "image";
    let category = "general";
    let event_date: string | null = null;
    let is_featured = false;
    let media_url: string | null = null;

    if (contentType.includes("application/json")) {
      const body = await request.json();
      title_en = body.title_en ?? null;
      title_np = body.title_np ?? null;
      description_en = body.description_en ?? null;
      description_np = body.description_np ?? null;
      media_type = body.media_type || "image";
      category = body.category || "general";
      event_date = body.event_date || null;
      is_featured = body.is_featured === true || body.is_featured === "true";
      media_url = body.media_url ?? null;
    } else {
      const formData = await request.formData();
      title_en = (formData.get("title_en") as string) || null;
      title_np = (formData.get("title_np") as string) || null;
      description_en = (formData.get("description_en") as string) || null;
      description_np = (formData.get("description_np") as string) || null;
      media_type = (formData.get("media_type") as string) || "image";
      category = (formData.get("category") as string) || "general";
      event_date = (formData.get("event_date") as string) || null;
      is_featured = formData.get("is_featured") === "true";
      media_url = (formData.get("media_url") as string) || null;
    }

    if (!title_en) {
      return NextResponse.json(
        { success: false, error: "Title (English) is required" },
        { status: 400 },
      );
    }

    if (!media_url) {
      return NextResponse.json(
        {
          success: false,
          error:
            "media_url is required. Upload the file via /api/gallery/upload first.",
        },
        { status: 400 },
      );
    }

    const [result]: any = await db.query(
      `INSERT INTO gallery_items (
        title_en, title_np, description_en, description_np,
        media_type, media_url, thumbnail_url,
        category, event_date, is_featured
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title_en,
        title_np ?? null,
        description_en ?? null,
        description_np ?? null,
        media_type,
        media_url,
        media_url, // thumbnail = same URL for now
        category,
        event_date || null,
        is_featured ? 1 : 0,
      ],
    );

    const [newItem]: any = await db.query(
      `SELECT * FROM gallery_items WHERE id = ?`,
      [result.insertId],
    );

    return NextResponse.json(
      { success: true, data: newItem[0] },
      { status: 201 },
    );
  } catch (error) {
    logError("Gallery create error:", error, { scope: "gallery" });
    return NextResponse.json(
      { success: false, error: "Failed to create gallery item" },
      { status: 500 },
    );
  }
}

// =======================
// PUT — Full update (metadata only, no file re-upload)
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
      category,
      is_featured,
      event_date,
    } = body;

    if (!id || !title_en) {
      return NextResponse.json(
        { success: false, error: "id and title_en are required" },
        { status: 400 },
      );
    }

    const [existing]: any = await db.query(
      "SELECT id FROM gallery_items WHERE id = ?",
      [id],
    );
    if (!existing?.length) {
      return NextResponse.json(
        { success: false, error: "Item not found" },
        { status: 404 },
      );
    }

    await db.query(
      `UPDATE gallery_items SET
        title_en       = ?,
        title_np       = ?,
        description_en = ?,
        description_np = ?,
        category       = ?,
        is_featured    = ?,
        event_date     = ?
      WHERE id = ?`,
      [
        title_en,
        title_np ?? null,
        description_en ?? null,
        description_np ?? null,
        category ?? "general",
        is_featured ? 1 : 0,
        event_date || null,
        id,
      ],
    );

    const [updated]: any = await db.query(
      "SELECT * FROM gallery_items WHERE id = ?",
      [id],
    );
    return NextResponse.json({ success: true, data: updated[0] });
  } catch (error) {
    logError("Gallery update error:", error, { scope: "gallery" });
    return NextResponse.json(
      { success: false, error: "Failed to update gallery item" },
      { status: 500 },
    );
  }
}

// =======================
// DELETE — removes from DB and local disk.
// Accepts ?id=<n>. (The admin UI uses /api/gallery/[id] DELETE; this is
// kept for API completeness and now also matches the local-disk model.)
// =======================
export async function DELETE(request: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const id = Number(searchParams.get("id"));

    if (!id) {
      return NextResponse.json(
        { success: false, error: "id is required" },
        { status: 400 },
      );
    }

    const [rows]: any = await db.query(
      "SELECT media_url, thumbnail_url FROM gallery_items WHERE id = ?",
      [id],
    );

    if (!rows?.length) {
      return NextResponse.json(
        { success: false, error: "Item not found" },
        { status: 404 },
      );
    }

    const item = rows[0];

    await db.query("DELETE FROM gallery_items WHERE id = ?", [id]);

    // Best-effort delete of the local file(s). Never fatal.
    const tryDeleteFile = async (url: string) => {
      if (url && url.startsWith("/uploads/")) {
        const filePath = path.join(process.cwd(), "public", url);
        try {
          await unlink(filePath);
        } catch {
          // File may not exist (seed data, already removed) — ignore.
        }
      }
    };

    await tryDeleteFile(item.media_url);
    if (item.thumbnail_url && item.thumbnail_url !== item.media_url) {
      await tryDeleteFile(item.thumbnail_url);
    }

    return NextResponse.json({
      success: true,
      message: "Deleted successfully",
    });
  } catch (error) {
    logError("Gallery delete error:", error, { scope: "gallery" });
    return NextResponse.json(
      { success: false, error: "Failed to delete gallery item" },
      { status: 500 },
    );
  }
}