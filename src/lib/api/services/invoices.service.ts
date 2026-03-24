import { apiClient } from "../axios";
import type { Invoice } from "@/types";

export type InvoiceStatus = "DRAFT" | "SENT" | "PAID" | "OVERDUE" | "CANCELLED";

export interface CreateInvoiceDto {
  matterId: string;
  amount: number;
  status: InvoiceStatus;
  paymentReference?: string;
}

export interface UpdateInvoiceDto {
  amount?: number;
  status?: InvoiceStatus;
  paymentReference?: string;
}

export const invoicesService = {
  create: (data: CreateInvoiceDto) =>
    apiClient.post<Invoice>("/invoices", data),

  listByMatter: (matterId: string) =>
    apiClient.get<Invoice[]>(`/invoices/matter/${matterId}`),

  getById: (invoiceId: string) =>
    apiClient.get<Invoice>(`/invoices/${invoiceId}`),

  update: (invoiceId: string, data: UpdateInvoiceDto) =>
    apiClient.patch<Invoice>(`/invoices/${invoiceId}`, data),

  delete: (invoiceId: string) =>
    apiClient.delete(`/invoices/${invoiceId}`),
};
