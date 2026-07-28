import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  CreateMenuBoardDto,
  UpdateMenuBoardDto,
  createMenuBoardApiCall,
  deleteMenuBoardApiCall,
  fetchBusinessMenuBoardsApiCall,
  regenerateMenuBoardLinkApiCall,
  updateMenuBoardApiCall,
} from "./service";
import { MenuDisplayBoard } from "@/models/business/menuBoards/MenuDisplayBoard";

export const useBusinessMenuBoards = (businessId: string) => {
  const queryClient = useQueryClient();
  const queryKey = ["business_menu_boards", businessId];

  const { data: boards, isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      const data = await fetchBusinessMenuBoardsApiCall(businessId);
      return MenuDisplayBoard.parseApiArrayResponse(
        Array.isArray(data) ? data : [],
      );
    },
    staleTime: 1000 * 60 * 5,
    enabled: !!businessId,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
  });

  const { mutate: createBoard } = useMutation({
    mutationKey: ["create_menu_board", businessId],
    mutationFn: async (data: CreateMenuBoardDto) =>
      createMenuBoardApiCall(businessId, data),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey });
    },
    onError: () => {
      toast.error("Failed to create the menu board");
    },
  });

  const { mutate: updateBoard } = useMutation({
    mutationKey: ["update_menu_board", businessId],
    mutationFn: async ({
      boardId,
      data,
    }: {
      boardId: string;
      data: UpdateMenuBoardDto;
    }) => updateMenuBoardApiCall(businessId, boardId, data),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey });
    },
    onError: () => {
      toast.error("Failed to update the menu board");
    },
  });

  const { mutate: deleteBoard } = useMutation({
    mutationKey: ["delete_menu_board", businessId],
    mutationFn: async (boardId: string) =>
      deleteMenuBoardApiCall(businessId, boardId),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey });
    },
    onError: () => {
      toast.error("Failed to delete the menu board");
    },
  });

  const { mutate: regenerateLink } = useMutation({
    mutationKey: ["regenerate_menu_board_link", businessId],
    mutationFn: async (boardId: string) =>
      regenerateMenuBoardLinkApiCall(businessId, boardId),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey });
      toast.success("Public link regenerated");
    },
    onError: () => {
      toast.error("Failed to regenerate the public link");
    },
  });

  return {
    boards,
    isLoading,
    createBoard,
    updateBoard,
    deleteBoard,
    regenerateLink,
  };
};
