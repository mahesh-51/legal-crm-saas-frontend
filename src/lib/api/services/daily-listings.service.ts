import { apiClient } from "../axios";
import type { DailyListing, DailyListingStatus } from "@/types";

export interface CreateDailyListingDto {
  matterId: string;
  clientIds: string[];
  caseType?: string;
  caseNo?: string;
  complainants?: string[];
  defendants?: string[];
  status?: DailyListingStatus;
  currentDate: string;
  nextDate?: string;
  synopsis?: string;
  orders?: string;
}

export interface UpdateDailyListingDto {
  clientIds?: string[];
  caseType?: string;
  caseNo?: string;
  complainants?: string[];
  defendants?: string[];
  status?: DailyListingStatus;
  currentDate?: string;
  nextDate?: string;
  synopsis?: string;
  orders?: string;
}

/** Query params for `GET /daily-listings` — filter by listing `currentDate` + server-side search + pagination. */
export interface DailyListingsQueryParams {
  search?: string;
  /** Inclusive lower bound on `currentDate` (YYYY-MM-DD). */
  dateFrom?: string;
  /** Inclusive upper bound on `currentDate` (YYYY-MM-DD). */
  dateTo?: string;
  /** 1-based page index. */
  page?: number;
  /** Page size (default decided by API; frontend typically sends 20). */
  limit?: number;
}

/** Paginated list response from `GET /daily-listings`. */
export interface DailyListingsPageResponse {
  items: DailyListing[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const dailyListingsService = {
  create: (data: CreateDailyListingDto) =>
    apiClient.post<DailyListing>("/daily-listings", data),

  /** All firm-accessible listings; server filters by `currentDate` range, `search`, and paginates. */
  list: (params?: DailyListingsQueryParams) =>
    apiClient.get<DailyListingsPageResponse>("/daily-listings", { params }),

  listByMatter: (matterId: string) =>
    apiClient.get<DailyListing[]>(`/daily-listings/matter/${matterId}`),

  getById: (id: string) => apiClient.get<DailyListing>(`/daily-listings/${id}`),

  update: (id: string, data: UpdateDailyListingDto) =>
    apiClient.patch<DailyListing>(`/daily-listings/${id}`, data),

  delete: (id: string) => apiClient.delete(`/daily-listings/${id}`),
};
