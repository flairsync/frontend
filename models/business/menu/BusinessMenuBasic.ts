export class BusinessMenuBasic {
  id: string;
  name: string;
  description: string | null;
  categoriesCount: number;
  itemsCount: number;
  icon?: string | null; // optional, for UI purposes
  createdAt: string;
  updatedAt: string;
  hints?: Record<string, number>;

  constructor(
    id: string,
    name: string,
    description: string | null,
    categoriesCount: number,
    itemsCount: number,
    createdAt: string,
    updatedAt: string,
    icon?: string | null,
    hints?: Record<string, number>,
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.categoriesCount = categoriesCount;
    this.itemsCount = itemsCount;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.icon = icon ?? null;
    this.hints = hints;
  }

  /** Parse a single API response into BusinessMenuBasic */
  static parseApiResponse(data: any): BusinessMenuBasic | null {
    if (!data) return null;
    try {
      const categories = data.categories ?? [];
      const itemsCount = categories.reduce(
        (sum: number, cat: any) => sum + (cat.items?.length ?? 0),
        0,
      );

      return new BusinessMenuBasic(
        data.id,
        data.name,
        data.description ?? null,
        categories.length,
        itemsCount,
        data.createdAt,
        data.updatedAt,
        data.icon ?? null,
        data.hints,
      );
    } catch (error) {
      console.error("Failed to parse BusinessMenuBasic:", error);
      return null;
    }
  }

  /** Parse an array of API responses into BusinessMenuBasic[] */
  static parseApiArrayResponse(data: any[]): BusinessMenuBasic[] {
    const arr: BusinessMenuBasic[] = [];
    data.forEach((val) => {
      const menu = this.parseApiResponse(val);
      if (menu) arr.push(menu);
    });
    return arr;
  }
}
