import { apiClient } from "../axios";
import type { Firm } from "@/types";

export interface CreateFirmDto {
  name: string;
  subdomain: string;
}

export interface UpdateFirmDto {
  name?: string;
  subdomain?: string;
}

export const firmsService = {
  create: (data: CreateFirmDto) =>
    apiClient.post<Firm>("/firms", data),

  list: () => apiClient.get<Firm[]>("/firms"),

  getById: (firmId: string) =>
    apiClient.get<Firm>(`/firms/${firmId}`),

  update: (firmId: string, data: UpdateFirmDto) =>
    apiClient.patch<Firm>(`/firms/${firmId}`, data),

  uploadLogo: (firmId: string, file: File) => {
    const formData = new FormData();
    formData.append("logo", file);
    return apiClient.patch<Firm>(`/firms/${firmId}/logo`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};
