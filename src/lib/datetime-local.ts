/** Convert ISO 8601 to `datetime-local` value (local). */
export function isoToDatetimeLocal(iso: string | null | undefined): string {
  if (!iso?.trim()) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Parse `datetime-local` to ISO 8601 (UTC). */
export function datetimeLocalToIso(local: string): string {
  const t = local.trim();
  if (!t) return "";
  const d = new Date(t);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString();
}

/** True when `YYYY-MM-DDTHH:mm` parses to a moment strictly before now (local). */
export function isPastDatetimeLocal(local: string): boolean {
  const t = local.trim();
  if (!t) return false;
  const d = new Date(t);
  if (Number.isNaN(d.getTime())) return false;
  return d.getTime() < Date.now();
}

export function isHttpsUrl(s: string): boolean {
  try {
    const u = new URL(s.trim());
    return u.protocol === "https:";
  } catch {
    return false;
  }
}
