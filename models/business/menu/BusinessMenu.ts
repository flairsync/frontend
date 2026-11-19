// business-menu.entity.ts

import { BusinessMenuCategory } from "./BusinessMenuCategory";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

export type MenuHint = {
  message: string;
  type: "danger" | "info" | "hint";
};
export class BusinessMenu {
  id: string;
  name: string;
  description?: string;

  // Availability
  startDate?: string; // YYYY-MM-DD
  endDate?: string;
  startTime?: string; // HH:MM:SS
  endTime?: string;

  repeatYearly: boolean = false;
  repeatDaysOfWeek?: number[]; // 0=Sunday ... 6=Saturday

  icon?: string;

  categories: BusinessMenuCategory[] = [];

  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  hardDeleteAt?: string | null;
  deletedBy?: string | null;
  hints?: Record<string, number>;

  constructor(
    id: string,
    name: string,
    categories: BusinessMenuCategory[],
    description?: string,
    startDate?: string,
    endDate?: string,
    startTime?: string,
    endTime?: string,
    repeatYearly?: boolean,
    repeatDaysOfWeek?: number[],
    icon?: string,
    hints?: Record<string, number>,
    createdAt?: string,
    updatedAt?: string,
    deletedAt?: string | null,
  ) {
    this.id = id;
    this.name = name;
    this.categories = categories;
    this.description = description;
    this.startDate = startDate;
    this.endDate = endDate;
    this.startTime = startTime;
    this.endTime = endTime;
    this.repeatYearly = repeatYearly ?? false;
    this.repeatDaysOfWeek = repeatDaysOfWeek;
    this.icon = icon;
    this.hints = hints;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.deletedAt = deletedAt;
  }

  static parseApiResponse(data: any): BusinessMenu | null {
    if (!data) return null;
    try {
      const categories = BusinessMenuCategory.parseApiArrayResponse(
        data.categories,
      );
      return new BusinessMenu(
        data.id,
        data.name,
        categories,
        data.description,
        data.startDate,
        data.endDate,
        data.startTime,
        data.endTime,
        data.repeatYearly,
        data.repeatDaysOfWeek,
        data.icon,
        data.hints,
        data.createdAt,
        data.updatedAt,
        data.deletedAt,
      );
    } catch (error) {
      return null;
    }
  }

  getOrderedCategories = () => {
    return this.categories.sort((a, b) => a.order - b.order);
  };

  getRepeatDaysAsNumberArray = () => {
    if (!this.repeatDaysOfWeek) return [];
    return this.repeatDaysOfWeek?.map((val) => Number(val));
  };

  // P0-5 (QA, 2026-11-18): MenuHeader's "Active"/"Inactive" badge was never actually wired to
  // real data — both the owner and staff menu detail pages passed it a menu object with no
  // isActive (or startDate/endDate) at all, so it showed "Inactive" unconditionally, for every
  // menu, including ones with no schedule restriction at all (which should read as always
  // active). Mirrors the backend's applyMenuActiveWindowWhere + filterByDayOfWeek
  // (src/menu/utils/menu-active-window.util.ts) — a null/unset field means "no restriction".
  // P0-8 (QA round 4, 2026-11-19): this used the viewer's own browser clock with no timezone,
  // while the backend's computeMenuActiveWindow evaluates the same window in the BUSINESS's
  // timezone — a viewer in a different timezone than the business could see this badge read
  // "Inactive" while guests (served by the backend, which gets it right) still saw the menu.
  // Takes the business's timezone so both sides agree; defaults to UTC, same as the backend.
  isActive(businessTimezone?: string): boolean {
    const now = dayjs().tz(businessTimezone || "UTC");
    const today = now.format("YYYY-MM-DD");
    const currentTime = now.format("HH:mm:ss");

    if (this.startDate && this.startDate > today) return false;
    if (this.endDate && this.endDate < today) return false;
    if (this.startTime && this.startTime > currentTime) return false;
    if (this.endTime && this.endTime < currentTime) return false;

    if (this.repeatDaysOfWeek && this.repeatDaysOfWeek.length > 0) {
      const dayOfWeek = now.day();
      if (!this.getRepeatDaysAsNumberArray().includes(dayOfWeek)) return false;
    }

    return true;
  }
}
