import { apiClient } from "../axios";
import type { Matter } from "@/types";

export type MatterStatus = "OPEN" | "ACTIVE" | "ON_HOLD" | "CLOSED";

export interface CreateMatterDto {
  matterName: string;
  complainants: string[];
  defendants: string[];
  status: MatterStatus;
  courtTypeId?: string | null;
  courtNameId?: string | null;
  caseType?: string | null;
  cnr?: string;
  clientId: string;
}

export interface UpdateMatterDto {
  matterName?: string;
  complainants?: string[];
  defendants?: string[];
  courtTypeId?: string | null;
  courtNameId?: string | null;
  caseType?: string | null;
  status?: MatterStatus;
  cnr?: string;
}

export interface ListMattersParams {
  firmId: string;
  clientId?: string;
}

export const mattersService = {
  create: (firmId: string, data: CreateMatterDto) =>
    apiClient.post<Matter>(`/matters?firmId=${firmId}`, data),

  list: (params: ListMattersParams) => {
    const search = new URLSearchParams({ firmId: params.firmId });
    if (params.clientId) search.set("clientId", params.clientId);
    return apiClient.get<Matter[]>(`/matters?${search.toString()}`);
  },

  getById: (matterId: string) =>
    apiClient.get<Matter>(`/matters/${matterId}`),

  update: (matterId: string, data: UpdateMatterDto) =>
    apiClient.patch<Matter>(`/matters/${matterId}`, data),

  delete: (matterId: string) =>
    apiClient.delete(`/matters/${matterId}`),
};
