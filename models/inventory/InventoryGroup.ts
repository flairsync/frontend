export class InventoryGroup {
    id: string;
    businessId: string;
    name: string;
    items?: any[]; // Keep items as any to avoid circular dependency at model level
    createdAt: Date;
    updatedAt: Date;

    constructor(
        id: string,
        businessId: string,
        name: string,
        createdAt: Date,
        updatedAt: Date,
        items?: any[],
    ) {
        this.id = id;
        this.businessId = businessId;
        this.name = name;
        this.items = items;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    static parseApiResponse(data: any): InventoryGroup | null {
        if (!data || typeof data !== 'object') return null;
        try {
            return new InventoryGroup(
                data.id,
                data.businessId,
                data.name,
                data.createdAt ? new Date(data.createdAt) : new Date(),
                data.updatedAt ? new Date(data.updatedAt) : new Date(),
                data.items,
            );
        } catch (error) {
            console.error("ERROR PARSING INVENTORY GROUP", error);
            return null;
        }
    }

    static parseApiArrayResponse(data: any[]): InventoryGroup[] {
        if (!Array.isArray(data)) return [];
        const arr: InventoryGroup[] = [];
        data.forEach((val) => {
            const group = this.parseApiResponse(val);
            if (group) arr.push(group);
        });
        return arr;
    }
}
