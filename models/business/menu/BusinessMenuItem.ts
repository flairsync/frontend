import { Allergy } from "@/models/shared/Allergy";
import { BusinessMenuItemMedia } from "./BusinessMenuItemMedia";

export class BusinessMenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;

  allergies?: Allergy[] = [];
  media?: BusinessMenuItemMedia[] = [];

  constructor(
    id: string,
    name: string,
    price: number,
    description?: string,
    allergies?: Allergy[],
    media?: BusinessMenuItemMedia[],
  ) {
    this.id = id;
    this.name = name;
    this.price = price;
    this.description = description;
    this.allergies = allergies;
    this.media = media;
  }

  static parseApiResponse(data: any): BusinessMenuItem | null {
    if (!data) return null;
    try {
      const allergies = Allergy.parseApiArrayResponse(data.Allergy);
      const media = BusinessMenuItemMedia.parseApiArrayResponse(data.media);
      return new BusinessMenuItem(
        data.id,
        data.name,
        data.price,
        data.description,
        allergies,
        media,
      );
    } catch (error) {
      console.log("ERROR PARSING THE MENU ITEM ", error);

      return null;
    }
  }

  static parseApiArrayResponse(data: any[]): BusinessMenuItem[] {
    const arr: BusinessMenuItem[] = [];
    data.forEach((val) => {
      const employee = this.parseApiResponse(val);
      if (employee) arr.push(employee);
    });
    console.log("PARSED MENU ITEMS FOR ", data, " WILL RETURN ", arr);

    return arr;
  }
}
