import flairapi from "@/lib/flairapi";

const getFloorPlanUrl = (businessId: string) => {
    return `${import.meta.env.BASE_URL}/businesses/${businessId}/floor-plan`;
};

// DTOs
export interface CreateFloorDto {
    name: string;
    description?: string;
    order: number;
}

export interface UpdateFloorDto {
    name?: string;
    description?: string;
    order?: number;
}

export interface CreateTableDto {
    name: string;
    capacity: number;
    floorId: string;
    position: {
        x: number;
        y: number;
        shape: "circle" | "square" | "rectangle";
    };
}

export interface UpdateTableDto {
    name?: string;
    capacity?: number;
    floorId?: string;
    position?: {
        x: number;
        y: number;
        shape: "circle" | "square" | "rectangle";
    };
}

// Floors
export const fetchFloorsApiCall = (businessId: string) => {
    return flairapi.get(`${getFloorPlanUrl(businessId)}/floors`);
};

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
export const fetchTablesApiCall = (businessId: string) => {
    return flairapi.get(`${getFloorPlanUrl(businessId)}/tables`);
};

export const createTableApiCall = (businessId: string, data: CreateTableDto) => {
    return flairapi.post(`${getFloorPlanUrl(businessId)}/tables`, data);
};

export const updateTableApiCall = (businessId: string, tableId: string, data: UpdateTableDto) => {
    return flairapi.patch(`${getFloorPlanUrl(businessId)}/tables/${tableId}`, data);
};

export const deleteTableApiCall = (businessId: string, tableId: string) => {
    return flairapi.delete(`${getFloorPlanUrl(businessId)}/tables/${tableId}`);
};
