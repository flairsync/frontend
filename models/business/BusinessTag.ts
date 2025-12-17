export class BusinessTag {
  id: string;
  name: string;

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
  }

  static parseApiResponse(data: any): BusinessTag | null {
    if (!data) return null;
    try {
      return new BusinessTag(data.id, data.name);
    } catch (error) {
      return null;
    }
  }

  static parseApiArrayResponse(data: any[]): BusinessTag[] {
    const arr: BusinessTag[] = [];
    data.forEach((val) => {
      const pack = this.parseApiResponse(val);
      if (pack) arr.push(pack);
    });
    return arr;
  }
}
