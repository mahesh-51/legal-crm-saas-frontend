import { apiClient } from "../axios";
import type { Hearing } from "@/types";

export interface CreateHearingDto {
  matterId: string;
  hearingDate: string;
  synopsis?: string;
  orders?: string;
}

export interface UpdateHearingDto {
  hearingDate?: string;
  synopsis?: string;
  orders?: string;
}

export const hearingsService = {
  create: (data: CreateHearingDto) =>
    apiClient.post<Hearing>("/hearings", data),

  listByMatter: (matterId: string) =>
    apiClient.get<Hearing[]>(`/hearings/matter/${matterId}`),

  getById: (hearingId: string) =>
    apiClient.get<Hearing>(`/hearings/${hearingId}`),

  update: (hearingId: string, data: UpdateHearingDto) =>
    apiClient.patch<Hearing>(`/hearings/${hearingId}`, data),

  delete: (hearingId: string) =>
    apiClient.delete(`/hearings/${hearingId}`),
};
