import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Task } from "@/models/Task";
import {
  CreateTaskDto,
  UpdateTaskDto,
  UpdateTaskStatusDto,
  createTaskApiCall,
  deleteTaskApiCall,
  fetchBusinessTaskByIdApiCall,
  fetchBusinessTasksApiCall,
  updateTaskApiCall,
  updateTaskStatusApiCall,
} from "./service";

export const useBusinessTasks = (businessId: string) => {
  const { data: tasks, isPending: loadingTasks, refetch } = useQuery<Task[]>({
    queryKey: ["business_tasks", businessId],
    queryFn: async () => {
      const resp = await fetchBusinessTasksApiCall(businessId);
      return resp.data.data;
    },
    enabled: !!businessId,
  });

  return { tasks: tasks ?? [], loadingTasks, refetch };
};

export const useBusinessTask = (businessId: string, taskId: string) => {
  const { data: task, isPending: loadingTask } = useQuery<Task>({
    queryKey: ["business_task", businessId, taskId],
    queryFn: async () => {
      const resp = await fetchBusinessTaskByIdApiCall(businessId, taskId);
      return resp.data.data;
    },
    enabled: !!businessId && !!taskId,
  });

  return { task, loadingTask };
};

export const useCreateTask = (businessId: string) => {
  const queryClient = useQueryClient();

  const { mutate: createTask, isPending: creatingTask } = useMutation({
    mutationFn: (data: CreateTaskDto) => createTaskApiCall(businessId, data),
    onSuccess: () => {
      toast.success("Task created successfully!");
      queryClient.invalidateQueries({ queryKey: ["business_tasks", businessId] });
    },
    onError: () => {
      toast.error("Failed to create task. Please try again.");
    },
  });

  return { createTask, creatingTask };
};

export const useUpdateTask = (businessId: string, taskId: string) => {
  const queryClient = useQueryClient();

  const { mutate: updateTask, isPending: updatingTask } = useMutation({
    mutationFn: (data: UpdateTaskDto) => updateTaskApiCall(businessId, taskId, data),
    onSuccess: () => {
      toast.success("Task updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["business_tasks", businessId] });
      queryClient.invalidateQueries({ queryKey: ["business_task", businessId, taskId] });
    },
    onError: () => {
      toast.error("Failed to update task. Please try again.");
    },
  });

  return { updateTask, updatingTask };
};

export const useUpdateTaskStatus = (businessId: string) => {
  const queryClient = useQueryClient();

  const { mutate: updateTaskStatus, isPending: updatingStatus } = useMutation({
    mutationFn: ({ taskId, data }: { taskId: string; data: UpdateTaskStatusDto }) =>
      updateTaskStatusApiCall(businessId, taskId, data),
    onSuccess: () => {
      toast.success("Task status updated.");
      queryClient.invalidateQueries({ queryKey: ["business_tasks", businessId] });
    },
    onError: () => {
      toast.error("Failed to update status. Please try again.");
    },
  });

  return { updateTaskStatus, updatingStatus };
};

export const useDeleteTask = (businessId: string) => {
  const queryClient = useQueryClient();

  const { mutate: deleteTask, isPending: deletingTask } = useMutation({
    mutationFn: (taskId: string) => deleteTaskApiCall(businessId, taskId),
    onSuccess: () => {
      toast.success("Task deleted.");
      queryClient.invalidateQueries({ queryKey: ["business_tasks", businessId] });
    },
    onError: () => {
      toast.error("Failed to delete task. Please try again.");
    },
  });

  return { deleteTask, deletingTask };
};
