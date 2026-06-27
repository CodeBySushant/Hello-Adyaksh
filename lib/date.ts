import { format } from "date-fns";

/**
 * Safely format a date value coming from the API / DB.
 * date-fns format() THROWS on invalid dates (e.g. new Date(null)). Inside a
 * client component with no error boundary, one throw unmounts the whole page —
 * which is why the site sometimes "breaks down". This helper never throws.
 */
export function safeFormatDate(
  value: string | number | Date | null | undefined,
  fmt: string,
  fallback = "",
): string {
  if (value === null || value === undefined || value === "") return fallback;

  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return fallback;

  try {
    return format(d, fmt);
  } catch {
    return fallback;
  }
}