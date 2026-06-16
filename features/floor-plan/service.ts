import flairapi from "@/lib/flairapi";
import { unwrap } from "../shared/api-response";

const getFloorPlanUrl = (businessId: string) => {
    return `${import.meta.env.PUBLIC_ENV__BASE_URL}/businesses/${businessId}/floor-plan`;
};

// DTOs
export interface CreateFloorDto {
    name: string;
    description?: string;
    order: number;
    isPublished?: boolean;
}

export interface UpdateFloorDto {
    name?: string;
    description?: string;
    order?: number;
    isPublished?: boolean;
}

export interface TablePosition {
    x: number;
    y: number;
    shape: "circle" | "square" | "rectangle";
    width?: number;    // meters
    height?: number;   // meters
    rotation?: number; // degrees
}

export interface CreateTableDto {
    name: string;
    number: number;
    capacity: number;
    floorId: string;
    position: TablePosition;
}

export interface UpdateTableDto {
    name?: string;
    number?: number;
    capacity?: number;
    floorId?: string;
    position?: TablePosition;
}

// Floors
export const fetchFloorsApiCall = async (businessId: string, publishedOnly?: boolean) =>
    unwrap(await flairapi.get(`${getFloorPlanUrl(businessId)}/floors${publishedOnly ? "?published=true" : ""}`));

export const fetchFloorStatsApiCall = async (businessId: string) =>
    unwrap(await flairapi.get(`${getFloorPlanUrl(businessId)}/floors/stats`));

export const createFloorApiCall = (businessId: string, data: CreateFloorDto) => {
    return flairapi.post(`${getFloorPlanUrl(businessId)}/floors`, data);
};

export const updateFloorApiCall = (businessId: string, floorId: string, data: UpdateFloorDto) => {
    return flairapi.patch(`${getFloorPlanUrl(businessId)}/floors/${floorId}`, data);
};

export const deleteFloorApiCall = (businessId: string, floorId: string) => {
    return flairapi.delete(`${getFloorPlanUrl(businessId)}/floors/${floorId}`);
};

// Tables
export const fetchTablesApiCall = async (businessId: string) =>
    unwrap(await flairapi.get(`${getFloorPlanUrl(businessId)}/tables`));

export const createTableApiCall = (businessId: string, data: CreateTableDto) => {
    return flairapi.post(`${getFloorPlanUrl(businessId)}/tables`, data);
};

export const updateTableApiCall = (businessId: string, tableId: string, data: UpdateTableDto) => {
    return flairapi.patch(`${getFloorPlanUrl(businessId)}/tables/${tableId}`, data);
};

export const deleteTableApiCall = (businessId: string, tableId: string) => {
    return flairapi.delete(`${getFloorPlanUrl(businessId)}/tables/${tableId}`);
};

export interface BatchCreateTableDto {
    floorId: string;
    tables: {
        name: string;
        number: number;
        capacity: number;
        status: string;
        position: { x: number; y: number };
    }[];
}

export const batchCreateTablesApiCall = (businessId: string, data: BatchCreateTableDto) => {
    return flairapi.post(`${getFloorPlanUrl(businessId)}/tables/batch`, data);
};

// Elements
export type ApiElementType = 'wall' | 'wc' | 'plant' | 'pillar' | 'bar' | 'window' | 'door' | 'stairs' | 'elevator' | 'label' | 'shape';

export interface ElementPosition {
    x: number;
    y: number;
    width?: number;
    height?: number;
    rotation?: number;
}

export interface CreateElementDto {
    type: ApiElementType;
    label?: string;
    position?: ElementPosition;
    floorId: string;
}

export interface BatchCreateElementsDto {
    floorId: string;
    elements: Omit<CreateElementDto, 'floorId'>[];
}

export interface UpdateElementDto {
    type?: ApiElementType;
    label?: string;
    position?: ElementPosition;
}

const getElementsUrl = (businessId: string) =>
    `${getFloorPlanUrl(businessId)}/elements`;

export const batchCreateElementsApiCall = (businessId: string, data: BatchCreateElementsDto) =>
    flairapi.post(`${getElementsUrl(businessId)}/batch`, data);

export const updateElementApiCall = (businessId: string, elementId: string, data: UpdateElementDto) =>
    flairapi.patch(`${getElementsUrl(businessId)}/${elementId}`, data);

export const deleteElementApiCall = (businessId: string, elementId: string) =>
    flairapi.delete(`${getElementsUrl(businessId)}/${elementId}`);
