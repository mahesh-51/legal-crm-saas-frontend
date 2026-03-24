import { apiClient } from "../axios";
import type { User } from "@/types";

export type FirmUserRole = "FIRM_ADMIN" | "LAWYER";

export interface InviteUserDto {
  email: string;
  role: FirmUserRole;
}

export const firmUsersService = {
  list: (firmId: string) =>
    apiClient.get<User[]>(`/firms/${firmId}/users`),

  invite: (firmId: string, data: InviteUserDto) =>
    apiClient.post<{ message?: string }>(`/firms/${firmId}/users/invite`, data),

  remove: (firmId: string, userId: string) =>
    apiClient.delete(`/firms/${firmId}/users/${userId}`),
};
