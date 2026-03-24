import type { User, UserRole } from "@/types";

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
  return {
    ...user,
    role: normalizeUserRole(user.role),
  };
}
