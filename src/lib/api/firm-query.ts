/**
 * Backend: firm users pass `firmId`; individual lawyers without a firm omit it.
 */
export function firmQueryParams(
  firmId: string | null | undefined
): Record<string, string> {
  if (firmId) return { firmId };
  return {};
}
