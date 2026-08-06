// POS-specific domain types shared across POS components

export interface ModifierItem {
  id: string;
  name: string;
  price: number;
}

export interface ModifierGroup {
  id: string;
  name: string;
  required: boolean;
  minSelections: number;
  maxSelections: number;
  items: ModifierItem[];
}

export interface Variant {
  id: string;
  name: string;
  price: number;
}

export interface Allergen {
  id: string;
  code: string;
  name: string;
}

export interface BundleComponentDetail {
  menuItemId: string;
  quantity: number;
  name: string;
  price: number;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  basePrice: number;
  images: string[];
  isAvailable: boolean;
  variants: Variant[];
  modifierGroups: ModifierGroup[];
  allergies?: Allergen[];
  isBundle?: boolean;
  bundleComponentDetails?: BundleComponentDetail[];
}

export interface MenuCategory {
  id: string;
  name: string;
  items: MenuItem[];
}

export interface PosMenu {
  id: string;
  name: string;
  isActive: boolean;
  categories: MenuCategory[];
}

export interface PosTable {
  id: string;
  name: string;
  capacity: number;
  status: "available" | "occupied" | "reserved" | "cleaning" | "out_of_service";
  floorId: string;
  floorName?: string;
  positionX: number;
  positionY: number;
}

export interface PosBootstrapData {
  menus: PosMenu[];
  tables: PosTable[];
}

export interface CartItem {
  // Unique key for cart deduplication (menuItemId + optional variantId)
  id: string;
  // Display fields
  name: string;
  price: number;
  quantity: number;
  variantName?: string;
  modifierNames: string[];
  notes?: string;
  // API fields sent on order creation
  menuItemId: string;
  variantId?: string;
  modifiers: { modifierItemId: string }[];
}

export function calcSubtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

// Mirrors OrderService.calcTaxAmount's formula exactly (backend: src/order/order.service.ts)
// — rate is a percentage (e.g. 10 for 10%), matching BusinessTax.rate's scale, not a 0-1
// fraction. This is a pre-checkout preview only; the backend recomputes authoritatively once
// the order actually exists.
export function calcTax(subtotal: number, rate: number, included: boolean): number {
  if (rate <= 0) return 0;
  return included
    ? parseFloat((subtotal * rate / (100 + rate)).toFixed(2))
    : parseFloat((subtotal * rate / 100).toFixed(2));
}

export function calcTotal(items: CartItem[], rate: number, included: boolean): number {
  const grossItemsTotal = calcSubtotal(items);
  const tax = calcTax(grossItemsTotal, rate, included);
  return included ? grossItemsTotal : grossItemsTotal + tax;
}
