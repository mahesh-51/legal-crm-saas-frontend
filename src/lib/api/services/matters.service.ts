import { apiClient } from "../axios";
import type { Matter } from "@/types";

export type MatterStatus = "OPEN" | "ACTIVE" | "ON_HOLD" | "CLOSED";

export interface CreateMatterDto {
  caseTitle: string;
  court?: string;
  caseType: string;
  status: MatterStatus;
  cnr?: string;
  clientId: string;
  firmId: string;
}

export interface UpdateMatterDto {
  caseTitle?: string;
  court?: string;
  caseType?: string;
  status?: MatterStatus;
  cnr?: string;
}

export interface ListMattersParams {
  firmId: string;
  clientId?: string;
}

export const mattersService = {
  create: (firmId: string, data: Omit<CreateMatterDto, "firmId">) =>
    apiClient.post<Matter>(`/matters?firmId=${firmId}`, { ...data, firmId }),

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
