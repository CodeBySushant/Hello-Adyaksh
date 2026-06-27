import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { requireAdmin } from "@/lib/auth";
import { logError, logAudit } from "@/lib/logger";

export async function POST(request: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "video/mp4",
      "video/webm",
      "video/ogg",
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: "Unsupported file type. Allowed: JPEG, PNG, WebP, GIF, MP4, WebM, OGG" },
        { status: 400 }
      );
    }

    // 50MB limit
    const MAX_SIZE = 50 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, error: "File too large. Maximum size is 50MB." },
        { status: 400 }
      );
    }

    // Build unique filename
    const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
    const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    // Save to public/uploads/gallery (served as static files by Next.js)
    const uploadDir = path.join(process.cwd(), "public", "uploads", "gallery");
    await mkdir(uploadDir, { recursive: true });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(path.join(uploadDir, uniqueName), buffer);

    const publicUrl = `/uploads/gallery/${uniqueName}`;
    const mediaType = file.type.startsWith("video/") ? "video" : "image";

    logAudit("gallery.upload", {
      original_name: file.name,
      stored_as: uniqueName,
      size: file.size,
      type: file.type,
      url: publicUrl,
    });

    return NextResponse.json({
      success: true,
      url: publicUrl,
      media_type: mediaType,
      original_name: file.name,
    });
  } catch (error) {
    logError("Upload error:", error, { scope: "gallery.upload" });
    return NextResponse.json(
      { success: false, error: "Upload failed" },
      { status: 500 }
    );
  }
}