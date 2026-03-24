"use client";

import { useEffect } from "react";
import { toast } from "sonner";

/**
 * Shows a toast when the given error string changes.
 * Use with Redux slice error state for consistent error UX.
 */
export function useThunkErrorToast(error: string | null) {
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);
}
