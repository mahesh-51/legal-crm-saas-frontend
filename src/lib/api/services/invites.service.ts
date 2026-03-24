import { apiClient } from "../axios";
import type { InviteInfo } from "@/types";

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

export const invitesService = {
  getByToken: (token: string) =>
    apiClient.get<InviteInfo>(`/invites/token?token=${encodeURIComponent(token)}`),

  createClientInvite: (data: CreateClientInviteDto) =>
    apiClient.post<{ message?: string }>("/invites/client", data),

  acceptFirmInvite: (data: AcceptInviteDto) =>
    apiClient.post<{ user?: unknown; accessToken?: string; token?: string }>(
      "/invites/accept",
      data
    ),
};
