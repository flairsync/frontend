import { BusinessType } from "./BusinessType";
import { BusinessTag } from "./BusinessTag";

export type Country = {
  id: number;
  name: string;
};

export class MyBusiness {
  id: string;
  name: string;
  description: string;
  country: Country | null;
  type: BusinessType | null;
  tags: BusinessTag[];
  createdAt: Date;
  updatedAt: Date;
  logo: string;
  counts?: {
    employees: number;
    menus: number;
  };

  constructor(
    id: string,
    name: string,
    description: string,
    country: Country | null,
    type: BusinessType | null,
    tags: BusinessTag[],
    createdAt: Date,
    updatedAt: Date,
    logo: string,
    counts?: {
      employees: number;
      menus: number;
    }
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.country = country;
    this.type = type;
    this.tags = tags;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.logo = logo;
    this.counts = counts;
  }

  static parseApiResponse(data: any): MyBusiness | null {
    if (!data) return null;

    try {
      return new MyBusiness(
        data.id,
        data.name,
        data.description,
        data.country,
        BusinessType.parseApiResponse(data.type),
        BusinessTag.parseApiArrayResponse(data.tags || []),
        new Date(data.createdAt),
        new Date(data.updatedAt),
        data.logo,
        data.counts
      );
    } catch (error) {
      return null;
    }
  }

  static parseApiArrayResponse(data: any[]): MyBusiness[] {
    const arr: MyBusiness[] = [];
    data.forEach((val) => {
      const business = this.parseApiResponse(val);
      if (business) arr.push(business);
    });
    return arr;
  }
}
