import { apiClient } from "../axios";

export interface CourtType {
  id: string;
  name: string;
  /** `global` = catalog; `f:<uuid>` = firm; `u:<uuid>` = individual */
  tenantScope?: string;
  firmId?: string | null;
  userId?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCourtTypeDto {
  name: string;
}

export interface UpdateCourtTypeDto {
  name?: string;
}

export const courtTypesService = {
  list: () => apiClient.get<CourtType[]>("/court-types"),

  getById: (id: string) => apiClient.get<CourtType>(`/court-types/${id}`),

  create: (data: CreateCourtTypeDto) =>
    apiClient.post<CourtType>("/court-types", data),

  update: (id: string, data: UpdateCourtTypeDto) =>
    apiClient.patch<CourtType>(`/court-types/${id}`, data),

  delete: (id: string) => apiClient.delete(`/court-types/${id}`),
};
