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

export interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  basePrice: number;
  images: string[];
  isAvailable: boolean;
  variants: Variant[];
  modifierGroups: ModifierGroup[];
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
  status: "AVAILABLE" | "OCCUPIED" | "RESERVED" | "CLEANING";
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

const TAX_RATE_KEY = "pos_tax_rate";

export function getTaxRate(): number {
  return parseFloat(localStorage.getItem(TAX_RATE_KEY) ?? "0");
}

export function setTaxRate(rate: number): void {
  localStorage.setItem(TAX_RATE_KEY, rate.toString());
}

export function calcSubtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export function calcTax(subtotal: number, discountAmount = 0): number {
  const taxable = subtotal - discountAmount;
  return parseFloat((Math.max(0, taxable) * getTaxRate()).toFixed(2));
}

export function calcTotal(items: CartItem[], discountAmount = 0): number {
  const subtotal = calcSubtotal(items);
  return subtotal - discountAmount + calcTax(subtotal, discountAmount);
}
