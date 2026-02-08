import { InventoryGroup } from "./InventoryGroup";

export class InventoryItem {
    id: string;
    businessId: string;
    name: string;
    description?: string;
    unitId: number;
    quantity: number;
    lowStockThreshold: number;
    barcode?: string;
    group?: InventoryGroup;
    createdAt: Date;
    updatedAt: Date;

    constructor(
        id: string,
        businessId: string,
        name: string,
        unitId: number,
        quantity: number,
        lowStockThreshold: number,
        createdAt: Date,
        updatedAt: Date,
        description?: string,
        barcode?: string,
        group?: InventoryGroup,
    ) {
        this.id = id;
        this.businessId = businessId;
        this.name = name;
        this.unitId = unitId;
        this.quantity = Number(quantity);
        this.lowStockThreshold = Number(lowStockThreshold);
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.description = description;
        this.barcode = barcode;
        this.group = group;
    }

    static parseApiResponse(data: any): InventoryItem | null {
        if (!data || typeof data !== 'object') return null;
        try {
            return new InventoryItem(
                data.id,
                data.businessId,
                data.name,
                data.unitId,
                data.quantity || 0,
                data.lowStockThreshold || 0,
                data.createdAt ? new Date(data.createdAt) : new Date(),
                data.updatedAt ? new Date(data.updatedAt) : new Date(),
                data.description,
                data.barcode,
                data.group && typeof data.group === 'object' ? (InventoryGroup.parseApiResponse(data.group) ?? undefined) : undefined,
            );
        } catch (error) {
            console.error("ERROR PARSING INVENTORY ITEM", error, data);
            return null;
        }
    }

    static parseApiArrayResponse(data: any[]): InventoryItem[] {
        if (!Array.isArray(data)) return [];
        const arr: InventoryItem[] = [];
        data.forEach((val) => {
            const item = this.parseApiResponse(val);
            if (item) arr.push(item);
        });
        return arr;
    }
}
