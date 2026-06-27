/**
 * HelloMayor application logger.
 *
 * What it does
 *  - Writes a single line per event to a daily log file:
 *        logs/hellomayor-YYYY-MM-DD.log
 *  - Captures THREE kinds of things so the log "covers everything":
 *        1. Errors        -> logError()  (every API catch block funnels here)
 *        2. Data changes  -> logAudit() / logDbWrite()  (create/update/delete,
 *                            uploads, logins — i.e. "anything data")
 *        3. Plain info     -> logInfo() / logWarn()
 *  - Keeps logs for 7 days, then deletes the old day-files automatically
 *    (see RETENTION_DAYS + pruneOldLogs). No cron job needed — pruning runs
 *    once when the server boots and then every 12 hours while it stays up.
 *
 * Notes
 *  - This is a Node-runtime module (uses `fs`). Import it ONLY from API routes
 *    / server code, never from Edge middleware.
 *  - Logging must NEVER break a request, so every write is wrapped in try/catch
 *    and falls back to console if the file can't be written.
 */

import fs from "fs";
import path from "path";

// Keep this many days of logs, then auto-delete older day-files.
const RETENTION_DAYS = 7;

// One folder at the project root. Gitignored (see .gitignore).
const LOG_DIR = path.join(process.cwd(), "logs");

// Ensure the directory exists once at startup (sync is fine here).
try {
  fs.mkdirSync(LOG_DIR, { recursive: true });
} catch {
  // If we can't create it, every write below will fall back to console.
}

export type LogLevel = "INFO" | "WARN" | "ERROR" | "AUDIT";

/** Local-time "YYYY-MM-DD" used for the day-file name. */
function dayStamp(d = new Date()): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/** Local-time timestamp for the line prefix, e.g. "2026-06-27 15:45:01.123". */
function timeStamp(d = new Date()): string {
  const pad = (n: number, l = 2) => String(n).padStart(l, "0");
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ` +
    `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.` +
    `${pad(d.getMilliseconds(), 3)}`
  );
}

function currentLogFile(): string {
  return path.join(LOG_DIR, `hellomayor-${dayStamp()}.log`);
}

/** Make any value safe + compact for a single JSON line. */
function safeJson(context?: Record<string, unknown>): string {
  if (!context || Object.keys(context).length === 0) return "";
  try {
    return " :: " + JSON.stringify(context);
  } catch {
    return " :: " + String(context);
  }
}

/**
 * Core writer. Builds one readable line:
 *   [2026-06-27 15:45:01.123] [ERROR] [blogs.POST] message :: {"id":42,...}
 * then appends it to today's file. Never throws.
 */
function write(
  level: LogLevel,
  scope: string,
  message: string,
  context?: Record<string, unknown>,
): void {
  const line = `[${timeStamp()}] [${level}] [${scope}] ${message}${safeJson(
    context,
  )}\n`;

  // Mirror to the server console too (handy in dev / pm2 logs).
  if (level === "ERROR") console.error(line.trimEnd());
  else if (level === "WARN") console.warn(line.trimEnd());
  else console.log(line.trimEnd());

  try {
    fs.appendFile(currentLogFile(), line, () => {
      /* fire-and-forget; failure already mirrored to console above */
    });
  } catch {
    // Directory/file unwritable — console mirror above is our fallback.
  }
}

// ── Public helpers ──────────────────────────────────────────────────────────

/** General informational event. */
export function logInfo(
  message: string,
  context?: Record<string, unknown>,
): void {
  write("INFO", context?.scope ? String(context.scope) : "app", message, context);
}

/** Something noteworthy but not an error. */
export function logWarn(
  message: string,
  context?: Record<string, unknown>,
): void {
  write("WARN", context?.scope ? String(context.scope) : "app", message, context);
}

/**
 * Error logger. Drop-in replacement for `console.error("msg:", err)`.
 * Pulls the message + stack out of the error object into the context.
 */
export function logError(
  message: string,
  error?: unknown,
  context?: Record<string, unknown>,
): void {
  const scope = context?.scope ? String(context.scope) : "error";
  const errCtx: Record<string, unknown> = { ...context };
  delete errCtx.scope;

  if (error instanceof Error) {
    errCtx.error = error.message;
    errCtx.stack = error.stack;
  } else if (error !== undefined) {
    errCtx.error = String(error);
  }
  write("ERROR", scope, message, errCtx);
}

/**
 * Audit logger for data events / actions — "anything data".
 * e.g. logAudit("blog.created", { id, title, by, ip })
 */
export function logAudit(
  action: string,
  context?: Record<string, unknown>,
): void {
  write("AUDIT", "audit", action, context);
}

/**
 * Specialised audit line emitted automatically by the DB layer for every
 * write query (INSERT / UPDATE / DELETE). Keeps "anything data" covered
 * without touching every route.
 */
export function logDbWrite(
  op: string,
  table: string,
  context?: Record<string, unknown>,
): void {
  write("AUDIT", "db", `${op} ${table}`, context);
}

// ── Retention: keep 7 days, auto-erase the rest ─────────────────────────────

const FILE_RE = /^hellomayor-(\d{4})-(\d{2})-(\d{2})\.log$/;

/** Delete day-files older than RETENTION_DAYS. Safe + best-effort. */
export function pruneOldLogs(): void {
  let files: string[];
  try {
    files = fs.readdirSync(LOG_DIR);
  } catch {
    return;
  }

  const cutoff = Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000;

  for (const name of files) {
    const m = FILE_RE.exec(name);
    if (!m) continue;
    const fileDate = new Date(
      Number(m[1]),
      Number(m[2]) - 1,
      Number(m[3]),
    ).getTime();
    if (fileDate < cutoff) {
      try {
        fs.unlinkSync(path.join(LOG_DIR, name));
        write("INFO", "logger", `Pruned old log file: ${name}`);
      } catch {
        // ignore; will retry on the next sweep
      }
    }
  }
}

/**
 * Schedule pruning: run once now, then every 12 hours. Guarded on globalThis
 * so Next.js dev hot-reloads don't stack up multiple timers (same trick as
 * lib/db.ts and lib/rate-limit.ts).
 */
const globalForLogger = globalThis as unknown as {
  _logPruneScheduled?: boolean;
};

if (!globalForLogger._logPruneScheduled) {
  globalForLogger._logPruneScheduled = true;
  // Run on boot.
  pruneOldLogs();
  // Run twice a day while the server is alive. unref() so it never keeps the
  // process from exiting on its own.
  const timer = setInterval(pruneOldLogs, 12 * 60 * 60 * 1000);
  if (typeof timer.unref === "function") timer.unref();
}