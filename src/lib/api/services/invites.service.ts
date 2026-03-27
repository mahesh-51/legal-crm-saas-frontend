import { apiClient } from "../axios";
import type {
  InviteInfo,
  InviteFirmUserPayload,
  ModuleActionItem,
} from "@/types";

export interface CreateClientInviteDto {
  email: string;
  role: "CLIENT";
  firmId: string;
  clientId: string;
}

export interface AcceptInviteDto {
  token: string;
  name: string;
  password: string;
}

export interface AcceptExistingInviteDto {
  token: string;
}

export const invitesService = {
  getModulesActions: () =>
    apiClient.get<ModuleActionItem[]>("/invites/modules-actions"),

  getByToken: (token: string) =>
    apiClient.get<InviteInfo>(`/invites/token?token=${encodeURIComponent(token)}`),

  createClientInvite: (data: CreateClientInviteDto) =>
    apiClient.post<{ message?: string }>("/invites/client", data),

  inviteFirmUser: (firmId: string, data: InviteFirmUserPayload) =>
    apiClient.post<{ message?: string }>(`/firms/${firmId}/users/invite`, data),

  acceptFirmInvite: (data: AcceptInviteDto) =>
    apiClient.post<{ user?: unknown; accessToken?: string; token?: string }>(
      "/invites/accept",
      data
    ),

  acceptExistingFirmInvite: (data: AcceptExistingInviteDto) =>
    apiClient.post<{ user?: unknown; accessToken?: string; token?: string }>(
      "/invites/accept-existing",
      data
    ),
};
