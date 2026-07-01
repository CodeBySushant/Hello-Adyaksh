import path from "path";

/**
 * Root directory where uploaded files (gallery images, notice/report PDFs) are
 * written on disk.
 *
 * - In production set UPLOAD_DIR to a path OUTSIDE the app (e.g.
 *   /var/www/helloadyaksh-uploads) so files survive redeploys, and have nginx
 *   serve /uploads/ from that same folder.
 * - When UPLOAD_DIR is not set (local dev) it falls back to public/uploads,
 *   which Next.js serves as static files — so nothing to configure locally.
 *
 * The public URL returned to the browser is always /uploads/<sub>/<file>,
 * independent of where the file physically lives.
 */
const UPLOAD_ROOT =
  process.env.UPLOAD_DIR || path.join(process.cwd(), "public", "uploads");

/** Absolute directory on disk for a given upload bucket. */
export function uploadDirFor(sub: "gallery" | "reports" | "notices"): string {
  return path.join(UPLOAD_ROOT, sub);
}

/** Public URL for a stored file (what gets saved in the DB). */
export function uploadUrlFor(
  sub: "gallery" | "reports" | "notices",
  fileName: string,
): string {
  return `/uploads/${sub}/${fileName}`;
}