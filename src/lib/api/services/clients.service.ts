import { apiClient } from "../axios";
import type { Client, ClientVerificationDocumentType, ClientVerificationStatus } from "@/types";

export const KYC_KINDS = ["aadhaar", "pan", "driving"] as const;
export type KycKind = (typeof KYC_KINDS)[number];

export interface CreateClientDto {
  name: string;
  phone: string;
  email?: string;
  verificationStatus?: ClientVerificationStatus;
  /** One of: Aadhaar, PAN, or driving licence — the client is verified using only this ID type. */
  verificationDocumentType?: ClientVerificationDocumentType | null;
  aadhaarCard?: string;
  panCard?: string;
  drivingLicense?: string;
}

export interface UpdateClientDto {
  name?: string;
  phone?: string;
  email?: string;
  verificationStatus?: ClientVerificationStatus;
  verificationDocumentType?: ClientVerificationDocumentType | null;
  aadhaarCard?: string;
  panCard?: string;
  drivingLicense?: string;
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

  uploadKycDocument: (clientId: string, kind: KycKind, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient.post<Client>(
      `/clients/${clientId}/kyc-document?kind=${kind}`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
  },
};
