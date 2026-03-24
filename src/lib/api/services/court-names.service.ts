import { apiClient } from "../axios";

export interface CourtName {
  id: string;
  name: string;
  courtTypeId?: string | null;
  /** `global` = catalog; `f:<uuid>` = firm; `u:<uuid>` = individual */
  tenantScope?: string;
  firmId?: string | null;
  userId?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCourtNameDto {
  name: string;
  courtTypeId?: string | null;
}

export interface UpdateCourtNameDto {
  name?: string;
  courtTypeId?: string | null;
}

export const courtNamesService = {
  list: (courtTypeId?: string) => {
    const q = courtTypeId ? `?courtTypeId=${courtTypeId}` : "";
    return apiClient.get<CourtName[]>(`/court-names${q}`);
  },

  getById: (id: string) => apiClient.get<CourtName>(`/court-names/${id}`),

  create: (data: CreateCourtNameDto) =>
    apiClient.post<CourtName>("/court-names", data),

  update: (id: string, data: UpdateCourtNameDto) =>
    apiClient.patch<CourtName>(`/court-names/${id}`, data),

  delete: (id: string) => apiClient.delete(`/court-names/${id}`),
};
