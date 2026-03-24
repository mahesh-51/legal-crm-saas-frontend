"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "./use-redux";
import { useAuth } from "./use-auth";
import { fetchFirms } from "@/store/slices/firms.slice";

/**
 * Returns the current firm ID for API calls.
 * Uses user.firmId if set, otherwise the first firm from the firms list.
 * Triggers firms fetch when needed.
 */
export function useCurrentFirmId(): string | null {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const firms = useAppSelector((s) => s.firms.list);

  useEffect(() => {
    if (user && firms.length === 0) {
      dispatch(fetchFirms());
    }
  }, [dispatch, user, firms.length]);

  if (user?.firmId) return user.firmId;
  return firms[0]?.id ?? null;
}
