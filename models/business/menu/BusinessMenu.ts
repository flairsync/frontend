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

  getMenuHints(currentDate?: string, currentTime?: string): MenuHint[] {
    const hints: MenuHint[] = [];

    // Use current time or now
    const now = currentDate
      ? dayjs(`${currentDate}T${currentTime || "00:00:00"}`)
      : dayjs();

    // Start / End Date hints
    if (this.startDate && this.endDate) {
      const start = dayjs(this.startDate);
      const end = dayjs(this.endDate);
      if (end.isBefore(start)) {
        hints.push({
          message:
            "This menu will never be displayed (end date before start date)",
          type: "danger",
        });
      } else if (now.isBefore(start)) {
        hints.push({
          message: `This menu will be active starting ${start.format("MMM D, YYYY")}`,
          type: "info",
        });
      } else if (now.isAfter(end)) {
        hints.push({
          message: `This menu is expired (ended on ${end.format("MMM D, YYYY")})`,
          type: "danger",
        });
      }
    } else if (!this.startDate && !this.endDate) {
      hints.push({
        message: "This menu has no start or end date, always active",
        type: "hint",
      });
    }

    // Time hints
    if (this.startTime && this.endTime) {
      const startT = dayjs(`1970-01-01T${this.startTime}`);
      const endT = dayjs(`1970-01-01T${this.endTime}`);
      if (endT.isBefore(startT)) {
        hints.push({
          message: "Menu will never be active (end time before start time)",
          type: "danger",
        });
      } else {
        hints.push({
          message: `Menu is active daily from ${this.startTime} to ${this.endTime}`,
          type: "info",
        });
      }
    } else if (!this.startTime && !this.endTime) {
      hints.push({ message: "Menu is active all day", type: "hint" });
    }

    // Repeat Days hints
    if (this.repeatDaysOfWeek) {
      if (this.repeatDaysOfWeek.length === 0) {
        hints.push({
          message:
            "This menu will never be displayed because no repeat days are selected",
          type: "danger",
        });
      } else {
        const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const days = this.repeatDaysOfWeek
          .map((d) => dayNames[d] || d)
          .join(", ");
        hints.push({
          message: `This menu is only displayed on: ${days}`,
          type: "info",
        });
      }
    }

    // Repeat yearly hint
    if (this.repeatYearly) {
      hints.push({ message: "This menu repeats yearly", type: "hint" });
    }

    return hints;
  }
}
