import type { AxiosError } from "axios";
import type { User } from "@/types";
import { getErrorMessage } from "@/lib/api/error-handler";

/** Shown when a non–super-admin hits 403 on built-in court rows or similar. */
export const COURT_MUTATION_FORBIDDEN_MESSAGE =
  "Built-in courts can't be edited; add your own court type or name.";

export type CourtTenantRow = {
  tenantScope?: string;
  firmId?: string | null;
  userId?: string | null;
};

export function isSystemCourtRow(row: CourtTenantRow): boolean {
  if (row.tenantScope === "global") return true;
  if (row.tenantScope && row.tenantScope !== "global") return false;
  return row.firmId == null && row.userId == null;
}

export function isSuperAdminUser(user: User | null | undefined): boolean {
  if (!user) return false;
  if (user.isSuperAdmin === true) return true;
  return String(user.role).toUpperCase() === "SUPER_ADMIN";
}

/**
 * Whether the current user may PATCH/DELETE this row. Super admins may edit global rows.
 */
export function canMutateCourtRow(
  user: User | null | undefined,
  row: CourtTenantRow,
): boolean {
  if (!user) return false;
  if (isSuperAdminUser(user)) return true;
  if (isSystemCourtRow(row)) return false;
  if (row.firmId != null) return user.firmId === row.firmId;
  if (row.userId != null) return user.id === row.userId;
  return false;
}

export function courtScopeLabel(row: CourtTenantRow): "Built-in" | "Custom" {
  return isSystemCourtRow(row) ? "Built-in" : "Custom";
}

export function getCourtMutationErrorMessage(error: unknown): string {
  const status = (error as AxiosError).response?.status;
  if (status === 403) return COURT_MUTATION_FORBIDDEN_MESSAGE;
  return getErrorMessage(error);
}
