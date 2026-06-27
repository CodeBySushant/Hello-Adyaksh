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
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
    }

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: "Only PDF, Word, and Excel files are allowed" },
        { status: 400 }
      );
    }

    // 20MB limit for reports
    if (file.size > 20 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: "File too large. Maximum size is 20MB." },
        { status: 400 }
      );
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || "pdf";
    const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const uploadDir = path.join(process.cwd(), "public", "uploads", "reports");
    await mkdir(uploadDir, { recursive: true });

    const bytes = await file.arrayBuffer();
    await writeFile(path.join(uploadDir, uniqueName), Buffer.from(bytes));

    logAudit("report.upload", {
      original_name: file.name,
      stored_as: uniqueName,
      size: file.size,
      type: file.type,
      url: `/uploads/reports/${uniqueName}`,
    });

    return NextResponse.json({
      success: true,
      url: `/uploads/reports/${uniqueName}`,
      file_size: file.size,
      original_name: file.name,
    });
  } catch (error) {
    logError("Report upload error:", error, { scope: "reports.upload" });
    return NextResponse.json({ success: false, error: "Upload failed" }, { status: 500 });
  }
}