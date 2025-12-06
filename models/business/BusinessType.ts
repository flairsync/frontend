export class BusinessType {
  id: string;
  name: string;

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
  }

  static parseApiResponse(data: any): BusinessType | null {
    if (!data) return null;
    try {
      return new BusinessType(data.id, data.name);
    } catch (error) {
      return null;
    }
  }

  static parseApiArrayResponse(data: any[]): BusinessType[] {
    const arr: BusinessType[] = [];
    data.forEach((val) => {
      const pack = this.parseApiResponse(val);
      if (pack) arr.push(pack);
    });
    return arr;
  }
}
