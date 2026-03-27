import { apiClient } from "../axios";
import { firmQueryParams } from "../firm-query";

export type MeetingStatus = "scheduled" | "completed" | "cancelled";
export type MeetingLinkProvider =
  | "google_meet"
  | "microsoft_teams"
  | "zoom"
  | "other";

export interface Meeting {
  id: string;
  title?: string | null;
  description?: string | null;
  startAt: string;
  endAt?: string | null;
  location?: string | null;
  meetingUrl?: string | null;
  meetingLinkProvider?: MeetingLinkProvider | null;
  shareLinkWithClient?: boolean;
  reminderAt?: string | null;
  status: MeetingStatus;
  matterId?: string | null;
  clientId?: string | null;
  dailyListingId?: string | null;
  organizerId?: string | null;
  firmId?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateMeetingDto {
  startAt: string;
  title?: string;
  description?: string;
  matterId?: string;
  clientId?: string;
  dailyListingId?: string;
  location?: string;
  meetingUrl?: string;
  meetingLinkProvider?: MeetingLinkProvider;
  shareLinkWithClient?: boolean;
  endAt?: string;
  reminderAt?: string;
  organizerId?: string;
  status?: MeetingStatus;
  firmId?: string;
}

export interface UpdateMeetingDto {
  title?: string | null;
  description?: string | null;
  startAt?: string;
  endAt?: string | null;
  location?: string | null;
  meetingUrl?: string | null;
  meetingLinkProvider?: MeetingLinkProvider | null;
  shareLinkWithClient?: boolean;
  reminderAt?: string | null;
  status?: MeetingStatus;
  matterId?: string | null;
  clientId?: string | null;
  dailyListingId?: string | null;
  organizerId?: string | null;
}

export interface ListMeetingsParams {
  firmId: string | null;
  matterId?: string;
  clientId?: string;
  dailyListingId?: string;
  status?: MeetingStatus;
  organizerId?: string;
}

function listSearch(params: ListMeetingsParams): string {
  const q = new URLSearchParams(firmQueryParams(params.firmId));
  if (params.matterId) q.set("matterId", params.matterId);
  if (params.clientId) q.set("clientId", params.clientId);
  if (params.dailyListingId) q.set("dailyListingId", params.dailyListingId);
  if (params.status) q.set("status", params.status);
  if (params.organizerId) q.set("organizerId", params.organizerId);
  const s = q.toString();
  return s ? `?${s}` : "";
}

export const meetingsService = {
  list: (params: ListMeetingsParams) =>
    apiClient.get<Meeting[]>(`/meetings${listSearch(params)}`),

  getById: (id: string) => apiClient.get<Meeting>(`/meetings/${id}`),

  create: (firmId: string | null, data: CreateMeetingDto) =>
    apiClient.post<Meeting>(`/meetings${listSearch({ firmId })}`, data),

  update: (id: string, data: UpdateMeetingDto) =>
    apiClient.patch<Meeting>(`/meetings/${id}`, data),

  delete: (id: string) => apiClient.delete(`/meetings/${id}`),
};
