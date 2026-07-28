import flairapi from "@/lib/flairapi";
import { unwrap } from "@/features/shared/api-response";

const baseBusinessUrl = `${'https://api.flairsync.com/api/v1'}/businesses`;

const getMenuBoardsUrl = (businessId: string) => {
  return `${baseBusinessUrl}/${businessId}/menu-boards`;
};

export type CreateMenuBoardDto = {
  name: string;
  categoryIds: string[];
  displayMode?: "GRID" | "CAROUSEL";
  theme?: string;
  presentationConfig?: Record<string, any> | null;
};

export type UpdateMenuBoardDto = Partial<CreateMenuBoardDto> & {
  isActive?: boolean;
};

export const fetchBusinessMenuBoardsApiCall = async (businessId: string) =>
  unwrap(await flairapi.get(getMenuBoardsUrl(businessId)));

export const fetchBusinessMenuBoardApiCall = async (
  businessId: string,
  boardId: string,
) => unwrap(await flairapi.get(`${getMenuBoardsUrl(businessId)}/${boardId}`));

export const createMenuBoardApiCall = (
  businessId: string,
  data: CreateMenuBoardDto,
) => flairapi.post(getMenuBoardsUrl(businessId), data);

export const updateMenuBoardApiCall = (
  businessId: string,
  boardId: string,
  data: UpdateMenuBoardDto,
) => flairapi.patch(`${getMenuBoardsUrl(businessId)}/${boardId}`, data);

export const regenerateMenuBoardLinkApiCall = (
  businessId: string,
  boardId: string,
) =>
  flairapi.post(
    `${getMenuBoardsUrl(businessId)}/${boardId}/regenerate-link`,
  );

export const deleteMenuBoardApiCall = (businessId: string, boardId: string) =>
  flairapi.delete(`${getMenuBoardsUrl(businessId)}/${boardId}`);

// ─── Public (unauthenticated kiosk display) ──────────────────────────────

export type PublicBoardItem = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  media?: { url: string }[];
};

export type PublicBoardCategory = {
  id: string;
  name: string;
  description: string | null;
  items: PublicBoardItem[];
};

export type PublicBoardResponse = {
  board: {
    name: string;
    displayMode: "GRID" | "CAROUSEL";
    theme: string;
    presentationConfig: Record<string, any> | null;
  };
  business: { name: string; logo: string | null; currency: string } | null;
  categories: PublicBoardCategory[];
};

export const fetchPublicMenuBoardApiCall = async (
  token: string,
): Promise<PublicBoardResponse> =>
  unwrap(
    await flairapi.get(
      `${'https://api.flairsync.com/api/v1'}/public/menu-boards/${token}`,
    ),
  );
