import type { Matter } from "@/types";

/**
 * Maps API payloads (snake_case and nested relations) onto flat Matter fields the UI expects.
 * List/detail APIs often return `client: { name }` and `courtName: { name }` instead of `clientName`.
 */
export function normalizeMatter(raw: Matter): Matter {
  const r = raw as unknown as Record<string, unknown>;

  const client = r.client as { name?: string } | undefined;
  const courtType = r.courtType as { name?: string } | undefined;

  const cnRaw = r.courtName;
  let courtNameLabel: string | null | undefined;
  if (typeof cnRaw === "string") {
    courtNameLabel = cnRaw;
  } else if (cnRaw && typeof cnRaw === "object" && cnRaw !== null && "name" in cnRaw) {
    courtNameLabel = String((cnRaw as { name: string }).name);
  } else {
    courtNameLabel =
      typeof raw.courtName === "string" ? raw.courtName : undefined;
  }

  return {
    ...raw,
    clientName:
      raw.clientName ??
      (r.client_name as string | undefined) ??
      client?.name,
    courtTypeName:
      raw.courtTypeName ??
      (r.court_type_name as string | undefined) ??
      courtType?.name,
    courtName: courtNameLabel ?? null,
  };
}
