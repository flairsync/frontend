export enum UnitSystem {
    METRIC = "metric",
    IMPERIAL = "imperial",
    OTHER = "other",
}

export enum UnitCategory {
    MASS = "mass",
    VOLUME = "volume",
    LENGTH = "length",
    COUNT = "count",
}

export class InventoryUnit {
    id: number;
    name: string;
    code: string;
    system: UnitSystem;
    category: UnitCategory;
    factorToBase: number;
    createdAt: Date;
    updatedAt: Date;

    constructor(
        id: number,
        name: string,
        code: string,
        system: UnitSystem,
        category: UnitCategory,
        factorToBase: number,
        createdAt: Date,
        updatedAt: Date,
    ) {
        this.id = id;
        this.name = name;
        this.code = code;
        this.system = system;
        this.category = category;
        this.factorToBase = factorToBase;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    static parseApiResponse(data: any): InventoryUnit | null {
        if (!data) return null;
        try {
            return new InventoryUnit(
                data.id,
                data.name,
                data.code,
                data.system,
                data.category,
                Number(data.factorToBase),
                new Date(data.createdAt),
                new Date(data.updatedAt),
            );
        } catch (error) {
            console.error("ERROR PARSING INVENTORY UNIT", error);
            return null;
        }
    }

    static parseApiArrayResponse(data: any[]): InventoryUnit[] {
        if (!Array.isArray(data)) return [];
        const arr: InventoryUnit[] = [];
        data.forEach((val) => {
            const unit = this.parseApiResponse(val);
            if (unit) arr.push(unit);
        });
        return arr;
    }
}
