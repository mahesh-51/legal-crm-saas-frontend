import { apiClient } from "../axios";
import type { Notification } from "@/types";

export const notificationsService = {
  list: () => apiClient.get<Notification[]>("/notifications"),

  getById: (notificationId: string) =>
    apiClient.get<Notification>(`/notifications/${notificationId}`),

  markRead: (notificationId: string) =>
    apiClient.patch<Notification>(`/notifications/${notificationId}/read`),

  markAllRead: () =>
    apiClient.patch<{ message?: string }>("/notifications/read-all"),
};
