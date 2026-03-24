import { apiClient } from "../axios";
import type { Client } from "@/types";

export interface CreateClientDto {
  name: string;
  phone?: string;
  email: string;
}

export interface UpdateClientDto {
  name?: string;
  phone?: string;
  email?: string;
  portalAccess?: boolean;
}

export const clientsService = {
  create: (firmId: string, data: CreateClientDto) =>
    apiClient.post<Client>(`/clients?firmId=${firmId}`, data),

  list: (firmId: string) =>
    apiClient.get<Client[]>(`/clients?firmId=${firmId}`),

  getById: (clientId: string) =>
    apiClient.get<Client>(`/clients/${clientId}`),

  update: (clientId: string, data: UpdateClientDto) =>
    apiClient.patch<Client>(`/clients/${clientId}`, data),

  delete: (clientId: string) =>
    apiClient.delete(`/clients/${clientId}`),
};
