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
  kitchenStationId?: string | null;
  isBundle?: boolean;
  bundleComponents?: { menuItemId: string; quantity: number }[];
  bundleComponentDetails?: { menuItemId: string; quantity: number; name: string; price: number }[];

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
    kitchenStationId?: string | null,
    isBundle?: boolean,
    bundleComponents?: { menuItemId: string; quantity: number }[],
    bundleComponentDetails?: { menuItemId: string; quantity: number; name: string; price: number }[],
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
    this.kitchenStationId = kitchenStationId;
    this.isBundle = isBundle ?? false;
    this.bundleComponents = bundleComponents;
    this.bundleComponentDetails = bundleComponentDetails;
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
        data.price ? Number(data.price) : 0,
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
        data.kitchenStationId ?? null,
        !!data.isBundle,
        data.bundleComponents ?? undefined,
        data.bundleComponentDetails ?? undefined,
      );
    } catch (error) {
      console.log("ERROR PARSING THE MENU ITEM ", error);
      return null;
    }
  }

  static parseApiArrayResponse(data: any[]): BusinessMenuItem[] {
    if (!Array.isArray(data)) return [];
    const arr: BusinessMenuItem[] = [];
    data.forEach((val) => {
      const employee = this.parseApiResponse(val);
      if (employee) arr.push(employee);
    });
    return arr;
  }
}
