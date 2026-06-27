import mysql from "mysql2/promise";
import { logDbWrite, logError } from "@/lib/logger";

/**
 * Reuse a single pool across hot-reloads in dev. Without this, Next.js
 * re-evaluates this module on every change and creates a brand-new pool each
 * time, leaking connections until MySQL refuses new ones ("site broke down").
 */
const globalForDb = globalThis as unknown as { _mysqlPool?: mysql.Pool };

const pool =
  globalForDb._mysqlPool ??
  mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "hellomayor",

    // Pool sizing
    waitForConnections: true,
    connectionLimit: Number(process.env.DB_CONNECTION_LIMIT) || 10,
    queueLimit: 0,

    // Reliability: keep sockets alive so the DB/firewall doesn't silently drop
    // idle connections and hand us a dead one on the next request.
    enableKeepAlive: true,
    keepAliveInitialDelay: 10_000,

    // Don't let a single request hang forever if the DB is unreachable.
    connectTimeout: 10_000,

    // Recycle idle connections cleanly.
    idleTimeout: 60_000,
    maxIdle: Number(process.env.DB_CONNECTION_LIMIT) || 10,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb._mysqlPool = pool;
}

/**
 * Detect data-changing statements so we can audit-log them. Returns the
 * operation + target table, or null for reads (SELECT) which we don't audit.
 */
function parseWrite(sql: string): { op: string; table: string } | null {
  const s = sql.trim().replace(/\s+/g, " ");
  let m = /^INSERT\s+INTO\s+`?(\w+)`?/i.exec(s);
  if (m) return { op: "INSERT", table: m[1] };
  m = /^UPDATE\s+`?(\w+)`?/i.exec(s);
  if (m) return { op: "UPDATE", table: m[1] };
  m = /^DELETE\s+FROM\s+`?(\w+)`?/i.exec(s);
  if (m) return { op: "DELETE", table: m[1] };
  return null;
}

/**
 * Wrapped query: behaves exactly like pool.query (same return tuple) but
 *  - audit-logs every INSERT/UPDATE/DELETE with rows affected / new id, and
 *  - error-logs any query that throws (then rethrows so route handlers still
 *    catch it as before).
 * This is the single chokepoint that makes "anything data" show up in the log
 * without editing every route.
 */
async function loggedQuery(sql: any, values?: any): Promise<any> {
  const sqlText: string =
    typeof sql === "string" ? sql : (sql && sql.sql) || "";
  const write = parseWrite(String(sqlText));
  const start = Date.now();

  try {
    const result =
      values !== undefined
        ? await pool.query(sql, values)
        : await pool.query(sql);

    if (write) {
      const rows: any = Array.isArray(result) ? result[0] : result;
      logDbWrite(write.op, write.table, {
        affectedRows: rows?.affectedRows,
        insertId: rows?.insertId,
        ms: Date.now() - start,
      });
    }

    return result;
  } catch (err) {
    logError("DB query failed", err, {
      scope: "db",
      sql: String(sqlText).replace(/\s+/g, " ").slice(0, 300),
    });
    throw err;
  }
}

/**
 * Export a transparent proxy over the pool: every method works as normal,
 * except `query`, which is replaced with the logging version above.
 */
const db = new Proxy(pool, {
  get(target, prop, receiver) {
    if (prop === "query") return loggedQuery;
    const value = Reflect.get(target, prop, receiver);
    return typeof value === "function" ? value.bind(target) : value;
  },
}) as mysql.Pool;

export { db };