export class BusinessMenuItemMedia {
  id: string;
  url: string;
  blurHash?: string;
  order: number;
  createdAt?: string;

  constructor(
    id: string,
    url: string,
    order: number,
    blurHash?: string,
    createdAt?: string,
  ) {
    this.id = id;
    this.url = url;
    this.blurHash = blurHash;
    this.order = order;
    this.createdAt = createdAt;
  }

  static parseApiResponse(data: any): BusinessMenuItemMedia | null {
    if (!data) return null;
    try {
      return new BusinessMenuItemMedia(
        data.id,
        data.url,
        data.order,
        data.blurHash,
        data.createdAt,
      );
    } catch (error) {
      return null;
    }
  }

  static parseApiArrayResponse(data: any[]): BusinessMenuItemMedia[] {
    if (!data) return [];
    const arr: BusinessMenuItemMedia[] = [];
    data.forEach((val) => {
      const employee = this.parseApiResponse(val);
      if (employee) arr.push(employee);
    });
    return arr;
  }
}
