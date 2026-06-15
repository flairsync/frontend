import { MenuItemModifierItem } from "./MenuItemModifierItem";

export class MenuItemModifierGroup {
    id: string;
    name: string;
    selectionMode: 'single' | 'multiple';
    minSelections: number;
    maxSelections: number;
    order: number;
    items: MenuItemModifierItem[];

    constructor(
        id: string,
        name: string,
        selectionMode: 'single' | 'multiple',
        minSelections: number,
        maxSelections: number,
        order: number,
        items: MenuItemModifierItem[]
    ) {
        this.id = id;
        this.name = name;
        this.selectionMode = selectionMode;
        this.minSelections = minSelections;
        this.maxSelections = maxSelections;
        this.order = order;
        this.items = items;
    }

    static parseApiResponse(data: any): MenuItemModifierGroup | null {
        if (!data) return null;
        try {
            const items = MenuItemModifierItem.parseApiArrayResponse(data.items || []);
            return new MenuItemModifierGroup(
                data.id,
                data.name,
                data.selectionMode,
                data.minSelections,
                data.maxSelections,
                data.order || 0,
                items
            );
        } catch (error) {
            console.log("ERROR PARSING THE MENU ITEM MODIFIER GROUP ", error);
            return null;
        }
    }

    static parseApiArrayResponse(data: any[]): MenuItemModifierGroup[] {
        if (!data) return [];
        const arr: MenuItemModifierGroup[] = [];
        data.forEach((val) => {
            const group = this.parseApiResponse(val);
            if (group) arr.push(group);
        });
        return arr;
    }
}
