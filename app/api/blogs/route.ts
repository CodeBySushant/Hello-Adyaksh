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
    const slug = searchParams.get("slug");
    const featured = searchParams.get("featured");
    const adminView = searchParams.get("admin");

    let blogs: any[];

    if (slug) {
      [blogs] = (await db.query(
        `SELECT * FROM blogs WHERE slug = ? AND is_published = true`,
        [slug],
      )) as any;

      if (blogs.length > 0) {
        await db.query(
          `UPDATE blogs SET view_count = view_count + 1 WHERE slug = ?`,
          [slug],
        );
      }

    } else if (featured === "true") {
      [blogs] = (await db.query(
        `SELECT * FROM blogs 
         WHERE is_featured = true 
         AND is_published = true 
         ORDER BY published_at DESC 
         LIMIT 3`,
      )) as any;

    } else if (adminView === "true") {
      // Admin sees all blogs including unpublished
      [blogs] = (await db.query(
        `SELECT * FROM blogs 
         ORDER BY created_at DESC`,
      )) as any;

    } else {
      [blogs] = (await db.query(
        `SELECT * FROM blogs 
         WHERE is_published = true 
         ORDER BY published_at DESC 
         LIMIT 10`,
      )) as any;
    }

    const headers =
      adminView === "true"
        ? undefined
        : {
            "Cache-Control":
              "public, s-maxage=30, stale-while-revalidate=120",
          };

    return NextResponse.json({ success: true, data: blogs }, { headers });

  } catch (error) {
    logError("Blogs fetch error:", error, { scope: "blogs" });
    return NextResponse.json(
      { success: false, error: "Failed to fetch blogs" },
      { status: 500 },
    );
  }
}

// =======================
// POST (CREATE)
// =======================
export async function POST(request: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const body = await request.json();

    const {
      title_en,
      title_np,
      slug,
      excerpt_en,
      excerpt_np,
      content_en,
      content_np,
      cover_image_url,
      author_name,
      category,
      tags,
      is_featured,
      is_published,
    } = body;

    if (!title_en || !content_en || !slug) {
      return NextResponse.json(
        { success: false, error: "Title, content and slug are required" },
        { status: 400 },
      );
    }

    const published = is_published === true || is_published === 1;

    const [result]: any = await db.query(
      `INSERT INTO blogs 
      (title_en, title_np, slug, excerpt_en, excerpt_np, content_en, content_np,
       cover_image_url, author_name, category, tags, is_featured, is_published, published_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title_en,
        title_np ?? null,
        slug,
        excerpt_en ?? null,
        excerpt_np ?? null,
        content_en,
        content_np ?? null,
        cover_image_url ?? null,
        author_name ?? null,
        category ?? null,
        tags ?? null,
        is_featured ?? false,
        published,
        published ? new Date() : null,
      ],
    );

    const [newBlog]: any = await db.query(
      `SELECT * FROM blogs WHERE id = ?`,
      [result.insertId],
    );

    return NextResponse.json({
      success: true,
      data: newBlog[0],
    });

  } catch (error) {
    logError("Create blog error:", error, { scope: "blogs" });
    return NextResponse.json(
      { success: false, error: "Failed to create blog" },
      { status: 500 },
    );
  }
}

// =======================
// PATCH (UPDATE)
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
      slug,
      excerpt_en,
      excerpt_np,
      content_en,
      content_np,
      cover_image_url,
      author_name,
      category,
      tags,
      is_featured,
      is_published,
    } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Blog ID is required" },
        { status: 400 },
      );
    }

    // Fetch current state to manage published_at correctly
    const [existing]: any = await db.query(
      `SELECT is_published, published_at FROM blogs WHERE id = ?`,
      [id],
    );

    if (!existing || existing.length === 0) {
      return NextResponse.json(
        { success: false, error: "Blog not found" },
        { status: 404 },
      );
    }

    const wasPublished = existing[0].is_published;
    const nowPublished = is_published === true || is_published === 1;

    // Only set published_at when first publishing
    let publishedAt = existing[0].published_at;
    if (nowPublished && !wasPublished) {
      publishedAt = new Date();
    }

    await db.query(
      `UPDATE blogs SET
        title_en        = COALESCE(?, title_en),
        title_np        = COALESCE(?, title_np),
        slug            = COALESCE(?, slug),
        excerpt_en      = COALESCE(?, excerpt_en),
        excerpt_np      = COALESCE(?, excerpt_np),
        content_en      = COALESCE(?, content_en),
        content_np      = COALESCE(?, content_np),
        cover_image_url = COALESCE(?, cover_image_url),
        author_name     = COALESCE(?, author_name),
        category        = COALESCE(?, category),
        tags            = COALESCE(?, tags),
        is_featured     = COALESCE(?, is_featured),
        is_published    = COALESCE(?, is_published),
        published_at    = ?,
        updated_at      = NOW()
      WHERE id = ?`,
      [
        title_en ?? null,
        title_np ?? null,
        slug ?? null,
        excerpt_en ?? null,
        excerpt_np ?? null,
        content_en ?? null,
        content_np ?? null,
        cover_image_url ?? null,
        author_name ?? null,
        category ?? null,
        tags ?? null,
        is_featured !== undefined ? is_featured : null,
        is_published !== undefined ? nowPublished : null,
        publishedAt,
        id,
      ],
    );

    const [updated]: any = await db.query(
      `SELECT * FROM blogs WHERE id = ?`,
      [id],
    );

    return NextResponse.json({
      success: true,
      data: updated[0],
    });

  } catch (error) {
    logError("Update blog error:", error, { scope: "blogs" });
    return NextResponse.json(
      { success: false, error: "Failed to update blog" },
      { status: 500 },
    );
  }
}

// =======================
// DELETE
// =======================
export async function DELETE(request: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Blog ID is required" },
        { status: 400 },
      );
    }

    const [existing]: any = await db.query(
      `SELECT id FROM blogs WHERE id = ?`,
      [id],
    );

    if (!existing || existing.length === 0) {
      return NextResponse.json(
        { success: false, error: "Blog not found" },
        { status: 404 },
      );
    }

    await db.query(`DELETE FROM blogs WHERE id = ?`, [id]);

    return NextResponse.json({
      success: true,
      message: "Blog deleted successfully",
    });

  } catch (error) {
    logError("Delete blog error:", error, { scope: "blogs" });
    return NextResponse.json(
      { success: false, error: "Failed to delete blog" },
      { status: 500 },
    );
  }
}