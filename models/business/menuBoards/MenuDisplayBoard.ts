export type MenuDisplayMode = "GRID" | "CAROUSEL";

export class MenuDisplayBoard {
  id: string;
  name: string;
  categoryIds: string[];
  displayMode: MenuDisplayMode;
  theme: string;
  presentationConfig: Record<string, any> | null;
  isActive: boolean;
  publicToken: string;
  lastCheckedInAt: string | null;
  createdAt: string;
  updatedAt: string;

  constructor(
    id: string,
    name: string,
    categoryIds: string[],
    displayMode: MenuDisplayMode,
    theme: string,
    presentationConfig: Record<string, any> | null,
    isActive: boolean,
    publicToken: string,
    lastCheckedInAt: string | null,
    createdAt: string,
    updatedAt: string,
  ) {
    this.id = id;
    this.name = name;
    this.categoryIds = categoryIds;
    this.displayMode = displayMode;
    this.theme = theme;
    this.presentationConfig = presentationConfig;
    this.isActive = isActive;
    this.publicToken = publicToken;
    this.lastCheckedInAt = lastCheckedInAt;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static parseApiResponse(data: any): MenuDisplayBoard | null {
    if (!data) return null;
    try {
      return new MenuDisplayBoard(
        data.id,
        data.name,
        data.categoryIds ?? [],
        data.displayMode ?? "GRID",
        data.theme ?? "light",
        data.presentationConfig ?? null,
        data.isActive ?? true,
        data.publicToken,
        data.lastCheckedInAt ?? null,
        data.createdAt,
        data.updatedAt,
      );
    } catch (error) {
      console.error("Failed to parse MenuDisplayBoard:", error);
      return null;
    }
  }

  static parseApiArrayResponse(data: any[]): MenuDisplayBoard[] {
    if (!Array.isArray(data)) return [];
    const arr: MenuDisplayBoard[] = [];
    data.forEach((val) => {
      const board = this.parseApiResponse(val);
      if (board) arr.push(board);
    });
    return arr;
  }
}
