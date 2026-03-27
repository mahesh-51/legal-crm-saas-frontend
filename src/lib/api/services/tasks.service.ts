import { apiClient } from "../axios";
import { firmQueryParams } from "../firm-query";

export type TaskKind = "task" | "follow_up";
export type TaskStatus = "pending" | "in_progress" | "done" | "cancelled";

export interface Task {
  id: string;
  title: string;
  kind: TaskKind;
  status: TaskStatus;
  description?: string | null;
  dueAt?: string | null;
  reminderAt?: string | null;
  matterId?: string | null;
  clientId?: string | null;
  dailyListingId?: string | null;
  assigneeId?: string | null;
  firmId?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTaskDto {
  title: string;
  matterId?: string;
  clientId?: string;
  dailyListingId?: string;
  kind?: TaskKind;
  status?: TaskStatus;
  description?: string;
  dueAt?: string;
  reminderAt?: string;
  assigneeId?: string;
  firmId?: string;
}

export interface UpdateTaskDto {
  title?: string;
  matterId?: string | null;
  clientId?: string | null;
  dailyListingId?: string | null;
  kind?: TaskKind;
  status?: TaskStatus;
  description?: string | null;
  dueAt?: string | null;
  reminderAt?: string | null;
  assigneeId?: string | null;
}

export interface ListTasksParams {
  firmId: string | null;
  matterId?: string;
  clientId?: string;
  dailyListingId?: string;
  status?: TaskStatus;
  assigneeId?: string;
  kind?: TaskKind;
}

function listSearch(params: ListTasksParams): string {
  const q = new URLSearchParams(firmQueryParams(params.firmId));
  if (params.matterId) q.set("matterId", params.matterId);
  if (params.clientId) q.set("clientId", params.clientId);
  if (params.dailyListingId) q.set("dailyListingId", params.dailyListingId);
  if (params.status) q.set("status", params.status);
  if (params.assigneeId) q.set("assigneeId", params.assigneeId);
  if (params.kind) q.set("kind", params.kind);
  const s = q.toString();
  return s ? `?${s}` : "";
}

export const tasksService = {
  list: (params: ListTasksParams) =>
    apiClient.get<Task[]>(`/tasks${listSearch(params)}`),

  getById: (id: string) => apiClient.get<Task>(`/tasks/${id}`),

  create: (firmId: string | null, data: CreateTaskDto) =>
    apiClient.post<Task>(`/tasks${listSearch({ firmId })}`, data),

  update: (id: string, data: UpdateTaskDto) =>
    apiClient.patch<Task>(`/tasks/${id}`, data),

  delete: (id: string) => apiClient.delete(`/tasks/${id}`),
};
