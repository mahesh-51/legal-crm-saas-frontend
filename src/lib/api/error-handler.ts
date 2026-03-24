import Cookies from "js-cookie";
import type { AxiosError } from "axios";
import type { ApiError } from "@/types";

const TOKEN_COOKIE_NAME = "auth_token";

const cookieOptions: Cookies.CookieAttributes = {
  path: "/",
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  expires: 7, // days
};

/** Extract user-facing error message from API or axios error */
export function getErrorMessage(error: unknown): string {
  if (!error) return "An unexpected error occurred";

  const axiosErr = error as AxiosError<{ message?: string; error?: string; errors?: Record<string, string[]> }>;
  const data = axiosErr.response?.data;

  if (data?.message) return data.message;
  if (data?.error) return data.error;
  if (data?.errors && typeof data.errors === "object") {
    const firstKey = Object.keys(data.errors)[0];
    const msgs = firstKey ? data.errors[firstKey] : [];
    return Array.isArray(msgs) && msgs[0] ? msgs[0] : "Validation failed";
  }

  const status = axiosErr.response?.status;
  if (status === 401) return "Session expired. Please sign in again.";
  if (status === 403) return "You don't have permission for this action.";
  if (status === 404) return "The requested resource was not found.";
  if (status && status >= 500) return "Server error. Please try again later.";

  const msg = error instanceof Error ? error.message : String(error);
  return msg || "An unexpected error occurred";
}

/** Normalize error for Redux rejected payload */
export function toApiError(error: unknown): ApiError {
  const axiosErr = error as AxiosError<{ message?: string; errors?: Record<string, string[]> }>;
  return {
    message: getErrorMessage(error),
    statusCode: axiosErr.response?.status,
    errors: axiosErr.response?.data?.errors,
  };
}

/** Get stored access token from cookie */
export function getAccessToken(): string | undefined {
  return Cookies.get(TOKEN_COOKIE_NAME);
}

/** Store access token in cookie */
export function setAccessToken(token: string): void {
  Cookies.set(TOKEN_COOKIE_NAME, token, cookieOptions);
}

/** Clear stored token cookie */
export function clearAccessToken(): void {
  Cookies.remove(TOKEN_COOKIE_NAME, { path: "/" });
}
