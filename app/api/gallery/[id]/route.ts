import { NextRequest, NextResponse } from "next/server";
import { logError } from "@/lib/logger";
import { unlink } from "fs/promises";
import path from "path";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

// =======================
// PUT - Update gallery item
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
      return NextResponse.json(
        { success: false, error: "Invalid ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const {
      title_en,
      title_np,
      description_en,
      description_np,
      category,
      event_date,
      is_featured,
    } = body;

    if (!title_en) {
      return NextResponse.json(
        { success: false, error: "Title (English) is required" },
        { status: 400 }
      );
    }

    await db.query(
      `UPDATE gallery_items SET
        title_en = ?,
        title_np = ?,
        description_en = ?,
        description_np = ?,
        category = ?,
        event_date = ?,
        is_featured = ?
      WHERE id = ?`,
      [
        title_en,
        title_np ?? null,
        description_en ?? null,
        description_np ?? null,
        category ?? "general",
        event_date ?? null,
        is_featured ?? false,
        id,
      ]
    );

    const [updated]: any = await db.query(
      `SELECT * FROM gallery_items WHERE id = ?`,
      [id]
    );

    if (!updated || updated.length === 0) {
      return NextResponse.json(
        { success: false, error: "Item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updated[0] });
  } catch (error) {
    logError("Gallery update error:", error, { scope: "gallery.id" });
    return NextResponse.json(
      { success: false, error: "Failed to update gallery item" },
      { status: 500 }
    );
  }
}

// =======================
// DELETE - Remove gallery item + file from disk
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
      return NextResponse.json(
        { success: false, error: "Invalid ID" },
        { status: 400 }
      );
    }

    const [rows]: any = await db.query(
      `SELECT media_url, thumbnail_url FROM gallery_items WHERE id = ?`,
      [id]
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Item not found" },
        { status: 404 }
      );
    }

    const item = rows[0];

    await db.query(`DELETE FROM gallery_items WHERE id = ?`, [id]);

    const tryDeleteFile = async (url: string) => {
      if (url && url.startsWith("/uploads/")) {
        const filePath = path.join(process.cwd(), "public", url);
        try {
          await unlink(filePath);
        } catch {
          // File might not exist on disk (e.g. old filler data), that's fine
        }
      }
    };

    await tryDeleteFile(item.media_url);
    if (item.thumbnail_url && item.thumbnail_url !== item.media_url) {
      await tryDeleteFile(item.thumbnail_url);
    }

    return NextResponse.json({ success: true, message: "Deleted successfully" });
  } catch (error) {
    logError("Gallery delete error:", error, { scope: "gallery.id" });
    return NextResponse.json(
      { success: false, error: "Failed to delete gallery item" },
      { status: 500 }
    );
  }
}