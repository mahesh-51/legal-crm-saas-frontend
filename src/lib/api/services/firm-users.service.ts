import { apiClient } from "../axios";
import type { ModulePermissionSelection, User } from "@/types";

export type FirmUserRole = "FIRM_ADMIN" | "LAWYER";

export interface InviteUserDto {
  email: string;
  role: FirmUserRole;
  modulePermissions?: ModulePermissionSelection[];
}

export interface FirmUserListItem {
  id: string;
  firmId: string;
  userId: string;
  email?: string;
  name?: string;
  role: FirmUserRole;
  status?: string;
  modulePermissions?: ModulePermissionSelection[] | null;
  inviteId?: string | null;
  inviteToken?: string | null;
  expiresAt?: string | null;
  acceptedAt?: string | null;
  createdAt?: string;
  user?: User | null;
}

export interface UpdateModulePermissionsDto {
  modulePermissions: ModulePermissionSelection[];
}

export const firmUsersService = {
  list: (firmId: string) =>
    apiClient.get<FirmUserListItem[]>(`/firms/${firmId}/users`),

  invite: (firmId: string, data: InviteUserDto) =>
    apiClient.post<{ message?: string }>(`/firms/${firmId}/users/invite`, data),

  updateModulePermissions: (
    firmId: string,
    userId: string,
    data: UpdateModulePermissionsDto
  ) =>
    apiClient.patch<{ message?: string; modulePermissions?: ModulePermissionSelection[] }>(
      `/firms/${firmId}/users/${userId}/module-permissions`,
      data
    ),

  remove: (firmId: string, userId: string) =>
    apiClient.delete(`/firms/${firmId}/users/${userId}`),
};
