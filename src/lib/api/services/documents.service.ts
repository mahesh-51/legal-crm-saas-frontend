import { apiClient } from "../axios";
import type { Document } from "@/types";

export const documentsService = {
  upload: (matterId: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient.post<Document>(
      `/documents/matter/${matterId}/upload`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
  },

  listByMatter: (matterId: string) =>
    apiClient.get<Document[]>(`/documents/matter/${matterId}`),

  getById: (documentId: string) =>
    apiClient.get<Document>(`/documents/${documentId}`),

  download: (documentId: string) =>
    apiClient.get<Blob>(`/documents/${documentId}/download`, {
      responseType: "blob",
    }),

  delete: (documentId: string) =>
    apiClient.delete(`/documents/${documentId}`),
};
