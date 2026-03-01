import { Allergy } from "@/models/shared/Allergy";
import { BusinessMenuItemMedia } from "./BusinessMenuItemMedia";
import { MenuItemModifierGroup } from "./MenuItemModifierGroup";
import { MenuItemVariant } from "./MenuItemVariant";

export class BusinessMenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  order: number;

  allergies?: Allergy[] = [];
  media?: BusinessMenuItemMedia[] = [];
  variants?: MenuItemVariant[] = [];
  modifierGroups?: MenuItemModifierGroup[] = [];

  inventoryTrackingMode?: string;
  inventoryItemId?: string;
  inventoryUnitId?: string | number;
  quantityPerSale?: number;

  constructor(
    id: string,
    name: string,
    price: number,
    order: number,
    description?: string,
    allergies?: Allergy[],
    media?: BusinessMenuItemMedia[],
    variants?: MenuItemVariant[],
    modifierGroups?: MenuItemModifierGroup[],
    inventoryTrackingMode?: string,
    inventoryItemId?: string,
    inventoryUnitId?: string | number,
    quantityPerSale?: number,
  ) {
    this.id = id;
    this.name = name;
    this.price = price;
    this.description = description;
    this.allergies = allergies;
    this.media = media;
    this.variants = variants;
    this.modifierGroups = modifierGroups;
    this.order = order;
    this.inventoryTrackingMode = inventoryTrackingMode;
    this.inventoryItemId = inventoryItemId;
    this.inventoryUnitId = inventoryUnitId;
    this.quantityPerSale = quantityPerSale;
  }

  static parseApiResponse(data: any): BusinessMenuItem | null {
    if (!data) return null;
    try {
      const allergies = Allergy.parseApiArrayResponse(data.Allergy);
      const media = BusinessMenuItemMedia.parseApiArrayResponse(data.media);
      const variants = MenuItemVariant.parseApiArrayResponse(data.variants || []);
      const modifierGroups = MenuItemModifierGroup.parseApiArrayResponse(data.modifierGroups || []);
      return new BusinessMenuItem(
        data.id,
        data.name,
        data.price,
        data.order,
        data.description,
        allergies,
        media,
        variants,
        modifierGroups,
        data.inventoryTrackingMode,
        data.inventoryItemId,
        data.inventoryUnitId,
        data.quantityPerSale,
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
    return arr;
  }
}
