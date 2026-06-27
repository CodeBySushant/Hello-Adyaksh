import { NextResponse } from "next/server";
import { logError } from "@/lib/logger";
import { db } from "../../../lib/db";

export async function GET() {
  try {
    const [statistics]: any = await db.query(
      `SELECT * FROM ward_statistics 
 WHERE is_active = true 
 ORDER BY sort_order ASC 
 LIMIT 10`,
    );

    // Get aggregated stats from other tables
    const [complaintStats]: any = await db.query(`
  SELECT 
    COUNT(*) as total,
    SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
    SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
    SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved
  FROM complaints
`);

    // ✅ Development stats (fixed)
    const [developmentStats]: any = await db.query(`
  SELECT 
    COUNT(*) as total,
    SUM(CASE WHEN status = 'ongoing' THEN 1 ELSE 0 END) as ongoing,
    SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
    COALESCE(SUM(budget), 0) as total_budget,
    COALESCE(SUM(spent), 0) as total_spent
  FROM development_works
`);

    // ✅ Message stats (fixed)
    const [messageStats]: any = await db.query(`
  SELECT 
    COUNT(*) as total,
    SUM(CASE WHEN status = 'unread' THEN 1 ELSE 0 END) as unread
  FROM contact_messages
`);

    return NextResponse.json(
      {
        success: true,
        data: {
          ward: statistics,
          complaints: complaintStats[0],
          development: developmentStats[0],
          messages: messageStats[0],
        },
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120",
        },
      },
    );
  } catch (error) {
    logError("Error fetching statistics:", error, { scope: "statistics" });
    return NextResponse.json(
      { success: false, error: "Failed to fetch statistics" },
      { status: 500 },
    );
  }
}
