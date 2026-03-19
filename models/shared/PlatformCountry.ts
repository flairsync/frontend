export enum CountryStatus {
  ACTIVE = 'ACTIVE',
  COMING_SOON = 'COMING_SOON',
  INACTIVE = 'INACTIVE',
}

export class PlatformCountry {
  id: number;
  code: string;
  name: string;
  status: CountryStatus;
  currency: string;
  phoneCode: string;
  region: string;
  centerLat: number;
  centerLng: number;
  order: number;

  constructor(
    id: number,
    code: string,
    name: string,
    status: CountryStatus,
    currency: string,
    phoneCode: string,
    region: string,
    centerLat: number,
    centerLng: number,
    order: number
  ) {
    this.id = id;
    this.code = code;
    this.name = name;
    this.status = status;
    this.currency = currency;
    this.phoneCode = phoneCode;
    this.region = region;
    this.centerLat = centerLat;
    this.centerLng = centerLng;
    this.order = order;
  }

  static parseApiResponse(data: any): PlatformCountry | null {
    if (!data) return null;
    try {
      return new PlatformCountry(
        data.id,
        data.code,
        data.name,
        data.status as CountryStatus,
        data.currency,
        data.phoneCode,
        data.region,
        data.centerLat,
        data.centerLng,
        data.order
      );
    } catch (error) {
      return null;
    }
  }

  static parseApiArrayResponse(data: any[]): PlatformCountry[] {
    const arr: PlatformCountry[] = [];
    data.forEach((val) => {
      const item = this.parseApiResponse(val);
      if (item) arr.push(item);
    });
    return arr;
  }
}
