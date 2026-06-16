import flairapi from "@/lib/flairapi";
import { TaskStatus } from "@/models/Task";
import { unwrap } from "../shared/api-response";

export interface CreateTaskDto {
  title: string;
  description?: string;
  assignedToEmploymentId?: string;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  assignedToEmploymentId?: string | null;
  status?: TaskStatus;
}

export interface UpdateTaskStatusDto {
  status: TaskStatus;
  comment?: string;
}

const businessesBaseUrl = `${import.meta.env.PUBLIC_ENV__BASE_URL}/businesses`;

export const fetchBusinessTasksApiCall = async (businessId: string) =>
  unwrap(await flairapi.get(`${businessesBaseUrl}/${businessId}/tasks`));

export const fetchBusinessTaskByIdApiCall = async (businessId: string, taskId: string) =>
  unwrap(await flairapi.get(`${businessesBaseUrl}/${businessId}/tasks/${taskId}`));

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
