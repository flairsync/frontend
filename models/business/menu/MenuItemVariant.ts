export class MenuItemVariant {
    id: string;
    name: string;
    price: number;

    constructor(id: string, name: string, price: number) {
        this.id = id;
        this.name = name;
        this.price = price;
    }

    static parseApiResponse(data: any): MenuItemVariant | null {
        if (!data) return null;
        try {
            return new MenuItemVariant(data.id, data.name, data.price);
        } catch (error) {
            console.log("ERROR PARSING THE MENU ITEM VARIANT ", error);
            return null;
        }
    }

    static parseApiArrayResponse(data: any[]): MenuItemVariant[] {
        if (!data) return [];
        const arr: MenuItemVariant[] = [];
        data.forEach((val) => {
            const variant = this.parseApiResponse(val);
            if (variant) arr.push(variant);
        });
        return arr;
    }
}
