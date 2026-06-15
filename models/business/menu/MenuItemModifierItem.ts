export class MenuItemModifierItem {
    id: string;
    name: string;
    price: number;
    modifierGroupId?: string;

    constructor(id: string, name: string, price: number, modifierGroupId?: string) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.modifierGroupId = modifierGroupId;
    }

    static parseApiResponse(data: any): MenuItemModifierItem | null {
        if (!data) return null;
        try {
            return new MenuItemModifierItem(data.id, data.name, data.price, data.modifierGroupId);
        } catch (error) {
            console.log("ERROR PARSING THE MENU ITEM MODIFIER ITEM ", error);
            return null;
        }
    }

    static parseApiArrayResponse(data: any[]): MenuItemModifierItem[] {
        if (!data) return [];
        const arr: MenuItemModifierItem[] = [];
        data.forEach((val) => {
            const item = this.parseApiResponse(val);
            if (item) arr.push(item);
        });
        return arr;
    }
}
