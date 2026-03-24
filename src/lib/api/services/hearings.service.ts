import { apiClient } from "../axios";
import type { Hearing, HearingStatus } from "@/types";

export interface CreateHearingDto {
  matterId: string;
  clientId: string;
  caseType?: string;
  caseNo?: string;
  complainants: string[];
  defendants: string[];
  status: HearingStatus;
  currentDate: string;
  nextDate?: string;
  synopsis?: string;
  orders?: string;
}

export interface UpdateHearingDto {
  caseType?: string;
  caseNo?: string;
  complainants?: string[];
  defendants?: string[];
  status?: HearingStatus;
  currentDate?: string;
  nextDate?: string;
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
