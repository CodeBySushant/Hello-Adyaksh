import { NextRequest, NextResponse } from "next/server";
import { logError } from "@/lib/logger";
import { db } from "../../../lib/db";
import { requireAdmin } from "@/lib/auth";


// =======================
// GET (PUBLIC)
// =======================
export async function GET() {
  try {
    const [notices]: any = await db.query(`
      SELECT * FROM notices 
WHERE (expiry_date IS NULL OR expiry_date >= CURDATE())
ORDER BY is_important DESC, publish_date DESC
LIMIT 10
    `);

    return NextResponse.json(
      { success: true, data: notices },
      {
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120",
        },
      },
    );

  } catch (error) {
    logError("Error fetching notices:", error, { scope: "notices" });

    return NextResponse.json(
      { success: false, error: "Failed to fetch notices" },
      { status: 500 }
    );
  }
}


// =======================
// POST (PROTECTED - CLEAN)
// =======================
export async function POST(request: NextRequest) {
  // 🔥 CLEAN AUTH
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const body = await request.json();

    const {
      title_en,
      title_np,
      content_en,
      content_np,
      category,
      is_important,
      expiry_date,
      attachment_url,
    } = body;

    // Use optional chaining so a missing field returns a clean 400 instead of
    // throwing a TypeError (which would surface as a generic 500).
    if (!title_en?.trim() || !content_en?.trim()) {
      return NextResponse.json(
        { success: false, error: "Title and content are required" },
        { status: 400 }
      );
    }

    const [result]: any = await db.query(
      `INSERT INTO notices 
       (title_en, title_np, content_en, content_np, category, is_important, expiry_date, attachment_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title_en,
        title_np ?? null,
        content_en,
        content_np ?? null,
        category ?? null,
        is_important ?? false,
        expiry_date ?? null,
        attachment_url ?? null,
      ],
    );

    const [newNotice]: any = await db.query(
      `SELECT * FROM notices WHERE id = ?`,
      [result.insertId],
    );

    return NextResponse.json({
      success: true,
      data: newNotice[0],
    });

  } catch (error) {
    logError("Error creating notice:", error, { scope: "notices" });

    return NextResponse.json(
      { success: false, error: "Failed to create notice" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const body = await request.json();

    const {
      id,
      title_en,
      title_np,
      content_en,
      content_np,
      category,
      is_important,
      expiry_date,
      attachment_url,
    } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID required" },
        { status: 400 }
      );
    }

    await db.query(
      `UPDATE notices SET
        title_en = COALESCE(?, title_en),
        title_np = COALESCE(?, title_np),
        content_en = COALESCE(?, content_en),
        content_np = COALESCE(?, content_np),
        category = COALESCE(?, category),
        is_important = COALESCE(?, is_important),
        expiry_date = COALESCE(?, expiry_date),
        attachment_url = COALESCE(?, attachment_url),
        updated_at = NOW()
      WHERE id = ?`,
      [
        title_en ?? null,
        title_np ?? null,
        content_en ?? null,
        content_np ?? null,
        category ?? null,
        is_important !== undefined ? is_important : null,
        expiry_date ?? null,
        attachment_url ?? null,
        id,
      ]
    );

    const [updated]: any = await db.query(
      "SELECT * FROM notices WHERE id = ?",
      [id]
    );

    return NextResponse.json({
      success: true,
      data: updated[0],
    });

  } catch (error) {
    logError("Notice update error:", error, { scope: "notices" });

    return NextResponse.json(
      { success: false, error: "Failed to update" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const id = Number(searchParams.get("id"));

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID required" },
        { status: 400 }
      );
    }

    await db.query("DELETE FROM notices WHERE id = ?", [id]);

    return NextResponse.json({
      success: true,
      message: "Deleted successfully",
    });

  } catch (error) {
    logError("Notice delete error:", error, { scope: "notices" });

    return NextResponse.json(
      { success: false, error: "Failed to delete" },
      { status: 500 }
    );
  }
}