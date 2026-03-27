import type { User } from "@/types";

const ALWAYS_ALLOWED_SEGMENTS = new Set(["", "dashboard", "settings"]);

function normalizeSegment(value: string): string {
  return value.trim().toLowerCase().replace(/[_\s]+/g, "-");
}

function segmentVariants(value: string): string[] {
  const normalized = normalizeSegment(value);
  if (!normalized) return [normalized];
  if (normalized.endsWith("s")) return [normalized, normalized.slice(0, -1)];
  return [normalized, `${normalized}s`];
}

function firstPathSegment(pathname: string): string {
  return normalizeSegment(pathname.split("?")[0].split("#")[0].split("/").filter(Boolean)[0] ?? "");
}

export function hasModuleAccessForPath(user: User | null | undefined, pathname: string): boolean {
  if (!user?.isInvitedUser) return true;

  const segment = firstPathSegment(pathname);
  if (ALWAYS_ALLOWED_SEGMENTS.has(segment)) return true;

  const permissions = user.modulePermissions ?? [];
  if (permissions.length === 0) return false;

  const allowedModules = new Set(
    permissions.flatMap((permission) => segmentVariants(permission.module))
  );

  return allowedModules.has(segment);
}
