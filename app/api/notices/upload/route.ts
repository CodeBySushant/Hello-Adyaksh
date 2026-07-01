import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { requireAdmin } from "@/lib/auth";
import { logError, logAudit } from "@/lib/logger";
import { uploadDirFor, uploadUrlFor } from "@/lib/uploads";

// PDF upload for notice attachments. Only used when an admin turns on the
// "Attach PDF" option for a notice. Stores under public/uploads/notices/.
export async function POST(request: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { success: false, error: "Only PDF files are allowed" },
        { status: 400 }
      );
    }

    // 15MB limit for notice attachments.
    if (file.size > 15 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: "File too large. Maximum size is 15MB." },
        { status: 400 }
      );
    }

    const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2)}.pdf`;

    const uploadDir = uploadDirFor("notices");
    await mkdir(uploadDir, { recursive: true });

    const bytes = await file.arrayBuffer();
    await writeFile(path.join(uploadDir, uniqueName), Buffer.from(bytes));

    logAudit("notice.upload", {
      original_name: file.name,
      stored_as: uniqueName,
      size: file.size,
      type: file.type,
      url: uploadUrlFor("notices", uniqueName),
    });

    return NextResponse.json({
      success: true,
      url: uploadUrlFor("notices", uniqueName),
      file_size: file.size,
      original_name: file.name,
    });
  } catch (error) {
    logError("Notice upload error:", error, { scope: "notices.upload" });
    return NextResponse.json({ success: false, error: "Upload failed" }, { status: 500 });
  }
}