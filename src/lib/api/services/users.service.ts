import { apiClient } from "../axios";
import type { User, UserNotificationPreferences } from "@/types";

export interface UpdateMeDto {
  name?: string;
  notificationPreferences?: UserNotificationPreferences;
  /** User-level profile when `firmId` is null (e.g. solo INDIVIDUAL). */
  address?: string | null;
  phone?: string | null;
  contactEmail?: string | null;
  barEnrollmentNumber?: string | null;
  contactPersonName?: string | null;
  registrationNumber?: string | null;
  websiteUrl?: string | null;
}

export const usersService = {
  getMe: () => apiClient.get<User>("/users/me"),

  updateMe: (data: UpdateMeDto) =>
    apiClient.patch<User>("/users/me", data),
};
