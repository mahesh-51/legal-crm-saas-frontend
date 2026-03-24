import { API_BASE_URL } from "@/lib/api/axios";

/**
 * Turns an API-relative storage path into an absolute URL for <img src> / links.
 * Normalizes Windows-style backslashes.
 */
export function getPublicApiFileUrl(relativePath: string | null | undefined): string | null {
  if (relativePath == null) return null;
  const trimmed = String(relativePath).trim();
  if (trimmed === "") return null;
  const slashes = trimmed.replace(/\\/g, "/");
  // Backend may store a full CDN URL (e.g. Cloudinary) — do not prepend API base.
  if (/^https?:\/\//i.test(slashes)) {
    return slashes;
  }
  const normalized = slashes.replace(/^\/+/, "");
  const base = API_BASE_URL.replace(/\/$/, "");
  return `${base}/${normalized}`;
}
