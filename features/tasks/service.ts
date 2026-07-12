import flairapi from "@/lib/flairapi";
import { Task, TaskStatus } from "@/models/Task";
import { unwrap, unwrapPaginated } from "../shared/api-response";

export interface CreateTaskDto {
  title: string;
  description?: string;
  assignedToEmploymentId?: string;
  dueDate?: string | null;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  assignedToEmploymentId?: string | null;
  status?: TaskStatus;
  dueDate?: string | null;
}

export interface UpdateTaskStatusDto {
  status: TaskStatus;
  comment?: string;
}

export interface ListTasksParams {
  page?: number;
  limit?: number;
  status?: TaskStatus;
}

const businessesBaseUrl = `${'https://api.flairsync.com/api/v1'}/businesses`;

export const fetchBusinessTasksApiCall = async (businessId: string, params: ListTasksParams = {}) => {
  const qs = new URLSearchParams();
  if (params.page) qs.set('page', String(params.page));
  if (params.limit) qs.set('limit', String(params.limit));
  if (params.status) qs.set('status', params.status);
  return unwrapPaginated<Task>(await flairapi.get(`${businessesBaseUrl}/${businessId}/tasks?${qs.toString()}`));
};

export const fetchBusinessTaskByIdApiCall = async (businessId: string, taskId: string) =>
  unwrap<Task>(await flairapi.get(`${businessesBaseUrl}/${businessId}/tasks/${taskId}`));

export const createTaskApiCall = (businessId: string, data: CreateTaskDto) => {
  return flairapi.post(`${businessesBaseUrl}/${businessId}/tasks`, data);
};

export const updateTaskApiCall = (businessId: string, taskId: string, data: UpdateTaskDto) => {
  return flairapi.patch(`${businessesBaseUrl}/${businessId}/tasks/${taskId}`, data);
};

export const updateTaskStatusApiCall = (
  businessId: string,
  taskId: string,
  data: UpdateTaskStatusDto,
) => {
  return flairapi.patch(`${businessesBaseUrl}/${businessId}/tasks/${taskId}/status`, data);
};

export const deleteTaskApiCall = (businessId: string, taskId: string) => {
  return flairapi.delete(`${businessesBaseUrl}/${businessId}/tasks/${taskId}`);
};
