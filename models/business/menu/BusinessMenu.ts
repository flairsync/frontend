// business-menu.entity.ts

import { BusinessMenuCategory } from "./BusinessMenuCategory";
import dayjs from "dayjs";

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
}
