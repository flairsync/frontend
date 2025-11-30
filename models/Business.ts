import dayjs from "dayjs";

export enum BusinessType {
  RESTAURANT = "restaurant",
  COFFEE_SHOP = "coffee_shop",
}

export enum CuisineType {
  ITALIAN = "italian",
  FRENCH = "french",
  MEDITERRANEAN = "mediterranean",
  AMERICAN = "american",
  ASIAN = "asian",
  OTHER = "other",
}

export class Business {
  id: string;
  name: string;
  description?: string;
  type: BusinessType;
  tags: string[];
  cuisineTypes?: CuisineType[];
  address: string;
  city: string;
  country: string;
  postalCode?: string;
  phone?: string;
  email?: string;
  website?: string;
  openingHours?: { [day: string]: { open: string; close: string } };
  rating?: number; // average rating out of 5
  reviewsCount?: number;
  menuCount?: number;
  employeeCount?: number;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;

  constructor(
    id: string,
    name: string,
    type: BusinessType,
    tags: string[],
    address: string,
    city: string,
    country: string,
    description?: string,
    cuisineTypes?: CuisineType[],
    postalCode?: string,
    phone?: string,
    email?: string,
    website?: string,
    openingHours?: { [day: string]: { open: string; close: string } },
    rating?: number,
    reviewsCount?: number,
    menuCount?: number,
    employeeCount?: number,
    isActive?: boolean
  ) {
    this.id = id;
    this.name = name;
    this.type = type;
    this.tags = tags;
    this.description = description;
    this.cuisineTypes = cuisineTypes;
    this.address = address;
    this.city = city;
    this.country = country;
    this.postalCode = postalCode;
    this.phone = phone;
    this.email = email;
    this.website = website;
    this.openingHours = openingHours;
    this.rating = rating;
    this.reviewsCount = reviewsCount;
    this.menuCount = menuCount;
    this.employeeCount = employeeCount;
    this.isActive = isActive ?? true;
    this.createdAt = dayjs().toISOString();
    this.updatedAt = dayjs().toISOString();
  }

  // --- Static parsing methods ---

  static parseApiResponse(data: any): Business | null {
    try {
      return new Business(
        data.id,
        data.name,
        data.type as BusinessType,
        Array.isArray(data.tags) ? data.tags : [],
        data.address,
        data.city,
        data.country,
        data.description,
        data.cuisineTypes,
        data.postalCode,
        data.phone,
        data.email,
        data.website,
        data.openingHours,
        data.rating,
        data.reviewsCount,
        data.menuCount,
        data.employeeCount,
        data.isActive
      );
    } catch {
      return null;
    }
  }

  static parseApiArrayResponse(data: any[]): Business[] {
    const arr: Business[] = [];
    data.forEach((val) => {
      const business = this.parseApiResponse(val);
      if (business) arr.push(business);
    });
    return arr;
  }

  // --- Utility methods ---

  getDisplayName(): string {
    return `${this.name} (${this.type.replace("_", " ")})`;
  }

  getShortDescription(): string {
    if (!this.description) return "No description provided.";
    return this.description.length > 100
      ? this.description.slice(0, 100) + "..."
      : this.description;
  }

  getTagList(): string {
    return this.tags.join(", ");
  }
}
