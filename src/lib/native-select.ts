import { cn } from "@/lib/utils";

/**
 * Base styles for native `<select>` elements.
 * Requires the global `.native-select` rule in `app/globals.css` (custom chevron, vertically centered).
 * Use `pl-*` for horizontal inset — do not use `px-*` or it overrides the chevron gutter.
 */
const nativeSelectCore =
  "native-select w-full min-w-0 rounded-lg border border-input bg-transparent text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30";

export type NativeSelectSize = "sm" | "md" | "lg";

const sizeClass: Record<NativeSelectSize, string> = {
  sm: "h-8 min-h-8 pl-2.5",
  md: "h-9 min-h-9 pl-2.5",
  lg: "h-10 min-h-10 pl-3",
};

/** Consistent native dropdown styling (chevron + focus ring) across the app. */
export function nativeSelectClassName(
  size: NativeSelectSize = "md",
  className?: string
) {
  return cn(nativeSelectCore, sizeClass[size], className);
}
