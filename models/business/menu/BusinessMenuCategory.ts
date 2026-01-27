import { BusinessMenuItem } from "./BusinessMenuItem";

export class BusinessMenuCategory {
  id: string;
  name: string;
  description: string;
  order: number;
  items?: BusinessMenuItem[] = [];

  constructor(
    id: string,
    name: string,
    description: string,
    order: number,
    items?: BusinessMenuItem[],
  ) {
    this.name = name;
    this.id = id;
    this.description = description;
    this.order = order;
    this.items = items;
  }

  static parseApiResponse(data: any): BusinessMenuCategory | null {
    if (!data) return null;
    try {
      const items = BusinessMenuItem.parseApiArrayResponse(data.items);
      console.log("PARSING GOT INM CATEGORYYYY ", items);

      return new BusinessMenuCategory(
        data.id,
        data.name,
        data.description,
        data.order,
        items,
      );
    } catch (error) {
      return null;
    }
  }

  static parseApiArrayResponse(data: any[]): BusinessMenuCategory[] {
    const arr: BusinessMenuCategory[] = [];
    data.forEach((val) => {
      const employee = this.parseApiResponse(val);
      if (employee) arr.push(employee);
    });
    return arr;
  }
}
