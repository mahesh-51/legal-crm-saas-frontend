import type { FirmProfileType, User, UserRole } from "@/types";

/**
 * Maps API / DB role enums to the canonical UI roles used by navigation and routes.
 * Without this, values like FIRM_ADMIN do not match sidebar checks and fall through to the client nav.
 */
export function normalizeUserRole(role: UserRole): UserRole {
  const upper = String(role).toUpperCase();
  switch (upper) {
    case "FIRM_ADMIN":
      return "firm";
    case "SUPER_ADMIN":
      return "firm";
    case "LAWYER":
      return "lawyer";
    case "INDIVIDUAL":
      return "lawyer";
    case "CLIENT":
      return "client";
    default:
      return role;
  }
}

export function normalizeUser(user: User): User {
  /** Preserve API role across repeated normalization (role becomes canonical `lawyer` / `firm` / `client`). */
  const rawRole = user.rawRole ?? String(user.role);
  return {
    ...user,
    role: normalizeUserRole(user.role),
    rawRole,
  };
}

/**
 * Maps the logged-in user's API role to the firm settings profile mode.
 * Used so account type is not user-editable; it follows auth role.
 */
export function firmProfileTypeFromUser(
  user: User | null,
  firmProfileFallback?: FirmProfileType | null
): FirmProfileType {
  const raw = user?.rawRole?.toUpperCase() ?? "";
  if (raw === "INDIVIDUAL") return "INDIVIDUAL";
  if (raw === "CLIENT") return "CLIENT";
  if (
    raw === "FIRM_ADMIN" ||
    raw === "LAWYER" ||
    raw === "SUPER_ADMIN" ||
    raw === "FIRM"
  ) {
    return "FIRM";
  }
  if (user?.role === "client") return "CLIENT";
  if (firmProfileFallback) return firmProfileFallback;
  return "FIRM";
}
