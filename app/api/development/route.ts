import { NextRequest, NextResponse } from "next/server";
import { logError } from "@/lib/logger";
import { db } from "../../../lib/db";
import { requireAdmin } from "@/lib/auth";


// =======================
// GET (PUBLIC)
// =======================
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const category = searchParams.get("category");

    let works: any[];

    if (status && status !== "all") {
      [works] = await db.query(
        `SELECT * FROM development_works WHERE status = ? ORDER BY created_at DESC`,
        [status]
      ) as any;

    } else if (category && category !== "all") {
      [works] = await db.query(
        `SELECT * FROM development_works WHERE category = ? ORDER BY created_at DESC`,
        [category]
      ) as any;

    } else {
      [works] = await db.query(
        `SELECT * FROM development_works 
ORDER BY created_at DESC 
LIMIT 10`
      ) as any;
    }

    return NextResponse.json(
      { success: true, data: works },
      {
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120",
        },
      },
    );

  } catch (error) {
    logError("Error fetching development works:", error, { scope: "development" });

    return NextResponse.json(
      { success: false, error: "Failed to fetch development works" },
      { status: 500 }
    );
  }
}

// =======================
// POST (PROTECTED - FULL CREATE)
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
      category,
      budget,
      spent,
      progress,
      status,
      start_date,
      expected_completion,
      contractor_name,
      location,
      image_urls,
    } = body;

    if (!title_en) {
      return NextResponse.json(
        { success: false, error: "Title is required" },
        { status: 400 }
      );
    }

    const [result]: any = await db.query(
      `INSERT INTO development_works 
      (title_en, title_np, description_en, description_np, category, budget, spent, progress, status, start_date, expected_completion, contractor_name, location, image_urls)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title_en,
        title_np ?? null,
        description_en ?? null,
        description_np ?? null,
        category ?? null,
        budget ?? 0,
        spent ?? 0,
        progress ?? 0,
        status ?? "planned",
        start_date ?? null,
        expected_completion ?? null,
        contractor_name ?? null,
        location ?? null,
        image_urls ?? null,
      ]
    );

    const [newWork]: any = await db.query(
      `SELECT * FROM development_works WHERE id = ?`,
      [result.insertId]
    );

    return NextResponse.json({
      success: true,
      data: newWork[0],
    });

  } catch (error) {
    logError("Create error:", error, { scope: "development" });

    return NextResponse.json(
      { success: false, error: "Failed to create" },
      { status: 500 }
    );
  }
}

// =======================
// PATCH (PROTECTED - FULL UPDATE)
// =======================
export async function PATCH(request: NextRequest) {
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
      budget,
      spent,
      progress,
      status,
      start_date,
      expected_completion,
      contractor_name,
      location,
      image_urls,
    } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID is required" },
        { status: 400 }
      );
    }

    await db.query(
      `UPDATE development_works SET
        title_en = COALESCE(?, title_en),
        title_np = COALESCE(?, title_np),
        description_en = COALESCE(?, description_en),
        description_np = COALESCE(?, description_np),
        category = COALESCE(?, category),
        budget = COALESCE(?, budget),
        spent = COALESCE(?, spent),
        progress = COALESCE(?, progress),
        status = COALESCE(?, status),
        start_date = COALESCE(?, start_date),
        expected_completion = COALESCE(?, expected_completion),
        contractor_name = COALESCE(?, contractor_name),
        location = COALESCE(?, location),
        image_urls = COALESCE(?, image_urls),
        updated_at = NOW()
      WHERE id = ?`,
      [
        title_en ?? null,
        title_np ?? null,
        description_en ?? null,
        description_np ?? null,
        category ?? null,
        budget ?? null,
        spent ?? null,
        progress ?? null,
        status ?? null,
        start_date ?? null,
        expected_completion ?? null,
        contractor_name ?? null,
        location ?? null,
        image_urls ?? null,
        id,
      ]
    );

    const [updated]: any = await db.query(
      "SELECT * FROM development_works WHERE id = ?",
      [id]
    );

    return NextResponse.json({
      success: true,
      data: updated[0],
    });

  } catch (error) {
    logError("Update error:", error, { scope: "development" });

    return NextResponse.json(
      { success: false, error: "Failed to update" },
      { status: 500 }
    );
  }
}

// =======================
// DELETE (PROTECTED - FIXED)
// =======================
export async function DELETE(request: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    // ✅ GET ID FROM QUERY PARAM (FIX)
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID is required" },
        { status: 400 }
      );
    }

    await db.query(
      "DELETE FROM development_works WHERE id = ?",
      [id]
    );

    return NextResponse.json({
      success: true,
      message: "Deleted successfully",
    });

  } catch (error) {
    logError("Delete error:", error, { scope: "development" });

    return NextResponse.json(
      { success: false, error: "Failed to delete" },
      { status: 500 }
    );
  }
}