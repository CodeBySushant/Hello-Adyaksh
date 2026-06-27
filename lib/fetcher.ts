/**
 * Shared SWR fetcher.
 *
 * Two things the old per-section fetches got wrong:
 *  1. No timeout — a stalled request left a section spinning forever.
 *  2. Errors were swallowed (or never thrown), so SWR never knew to retry and
 *     the section just rendered empty. Here we THROW on network errors,
 *     non-2xx responses, and `{ success: false }` payloads, which lets SWR's
 *     built-in retry/backoff kick in.
 *
 * Returns the parsed JSON body (e.g. `{ success: true, data: [...] }`).
 */
export async function swrFetcher<T = unknown>(url: string): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  try {
    const res = await fetch(url, { signal: controller.signal });

    if (!res.ok) {
      throw new Error(`Request to ${url} failed with status ${res.status}`);
    }

    const json = await res.json();

    if (json && typeof json === "object" && "success" in json && json.success === false) {
      throw new Error(json.error || `Request to ${url} was unsuccessful`);
    }

    return json as T;
  } finally {
    clearTimeout(timeout);
  }
}
