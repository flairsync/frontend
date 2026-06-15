import { AxiosResponse } from "axios";

export interface ApiResponse<T = unknown> {
  code: string;
  data: T;
  success: boolean;
  message?: string | null;
}

export interface PaginatedData<T> {
  data: T[];
  current: number;
  pages: number;
  total?: number;
  limit?: number;
}

/**
 * Strips the axios envelope + ApiResponse wrapper from a plain success response.
 * Service functions call this so hooks receive T directly.
 */
export function unwrap<T>(resp: AxiosResponse<ApiResponse<T>>): T {
  return resp.data.data;
}

/**
 * Same as unwrap but types the result as PaginatedData<T>.
 * Use for endpoints that call ApiResponse.paginatedResponse on the backend.
 */
export function unwrapPaginated<T>(
  resp: AxiosResponse<ApiResponse<PaginatedData<T>>>
): PaginatedData<T> {
  return resp.data.data;
}
