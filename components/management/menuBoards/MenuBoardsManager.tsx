import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Copy,
  MoreVertical,
  Pencil,
  Plus,
  QrCode,
  RefreshCw,
  Trash,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { QrcodePopup } from "@/components/shared/QrcodePopup";
import { usePermissions } from "@/features/auth/usePermissions";
import { useBusinessPlan } from "@/features/business/useBusinessPlan";
import { useSubscriptionStore } from "@/features/subscriptions/SubscriptionStore";
import { useBusinessMenus } from "@/features/business/menu/useBusinessMenus";
import { useBusinessMenuBoards } from "@/features/business/menuBoards/useBusinessMenuBoards";
import { MenuDisplayBoard } from "@/models/business/menuBoards/MenuDisplayBoard";
import { BoardModal, BoardPayload } from "./BoardModal";

const ONLINE_THRESHOLD_MS = 2 * 60 * 1000;

const isBoardOnline = (lastCheckedInAt: string | null) => {
  if (!lastCheckedInAt) return false;
  return Date.now() - new Date(lastCheckedInAt).getTime() < ONLINE_THRESHOLD_MS;
};

type Props = {
  businessId: string;
};

export const MenuBoardsManager: React.FC<Props> = ({ businessId }) => {
  const { t } = useTranslation("management");
  const { hasPermission, isLoading: loadingPermissions } = usePermissions(businessId);
  const canRead = hasPermission("MENU_DISPLAY", "read");
  const canCreate = hasPermission("MENU_DISPLAY", "create");
  const canUpdate = hasPermission("MENU_DISPLAY", "update");
  const canDelete = hasPermission("MENU_DISPLAY", "delete");

  const { plan } = useBusinessPlan(businessId);
  const { openUpgradeModal } = useSubscriptionStore();
  const { businessAllCategories } = useBusinessMenus(businessId);
  const {
    boards,
    createBoard,
    updateBoard,
    deleteBoard,
    regenerateLink,
  } = useBusinessMenuBoards(businessId);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingBoard, setEditingBoard] = useState<MenuDisplayBoard | null>(null);
  const [qrValue, setQrValue] = useState<string | null>(null);
  const [regenerateTarget, setRegenerateTarget] = useState<MenuDisplayBoard | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MenuDisplayBoard | null>(null);

  const maxBoards = plan?.allowed.menuBoards || 0;
  const currentBoards = plan?.current.menuBoards || 0;
  const remainingBoards = Math.max(0, maxBoards - currentBoards);
  const canCreateMenuBoard = plan ? plan.canCreateMenuBoard : true;

  const availableCategories = (businessAllCategories ?? []).map((c) => ({
    id: c.id,
    name: c.name,
  }));

  const getPublicUrl = (publicToken: string) =>
    `${window.location.origin}/board/${publicToken}`;

  const openCreateModal = () => {
    if (!canCreateMenuBoard) {
      openUpgradeModal(
        `The business plan allows up to ${plan?.allowed.menuBoards ?? 0} menu boards. The owner needs to upgrade to add more.`,
      );
      return;
    }
    setEditingBoard(null);
    setModalOpen(true);
  };

  const openEditModal = (board: MenuDisplayBoard) => {
    setEditingBoard(board);
    setModalOpen(true);
  };

  const handleSubmit = (data: BoardPayload) => {
    if (editingBoard) {
      updateBoard({ boardId: editingBoard.id, data });
    } else {
      createBoard(data);
    }
    setModalOpen(false);
  };

  const handleCopyLink = async (board: MenuDisplayBoard) => {
    await navigator.clipboard.writeText(getPublicUrl(board.publicToken));
    toast.success(t("menu_board_management.list.link_copied"));
  };

  const handleToggleActive = (board: MenuDisplayBoard, isActive: boolean) => {
    updateBoard({ boardId: board.id, data: { isActive } });
  };

  if (!loadingPermissions && !canRead) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-6xl mx-auto">
          <p className="text-muted-foreground">
            {t("menu_board_management.list.no_permission")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <BoardModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        board={editingBoard}
        availableCategories={availableCategories}
      />

      <QrcodePopup
        qrValue={qrValue}
        title={t("menu_board_management.list.qr_title")}
        onClose={() => setQrValue(null)}
      />

      <AlertDialog
        open={!!regenerateTarget}
        onOpenChange={(open) => !open && setRegenerateTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("menu_board_management.list.regenerate_confirm_title")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("menu_board_management.list.regenerate_confirm_desc")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("menu_board_management.list.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (regenerateTarget) regenerateLink(regenerateTarget.id);
                setRegenerateTarget(null);
              }}
            >
              {t("menu_board_management.list.regenerate")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("menu_board_management.list.delete_confirm_title")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("menu_board_management.list.delete_confirm_desc", {
                name: deleteTarget?.name,
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("menu_board_management.list.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => {
                if (deleteTarget) deleteBoard(deleteTarget.id);
                setDeleteTarget(null);
              }}
            >
              {t("menu_board_management.list.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="max-w-6xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-foreground">
          {t("menu_board_management.list.title")}
        </h1>
        <p className="text-muted-foreground">
          {t("menu_board_management.list.description")}
        </p>

        {canCreate && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            {plan ? (
              <>
                <span>
                  {canCreateMenuBoard
                    ? t("menu_board_management.list.remaining_boards", { count: remainingBoards })
                    : t("menu_board_management.list.limit_reached")}
                </span>
                {!canCreateMenuBoard && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="ml-2 text-indigo-600 border-indigo-200"
                    onClick={openCreateModal}
                  >
                    {t("menu_board_management.list.upgrade")}
                  </Button>
                )}
              </>
            ) : (
              <div className="h-5 w-32 bg-muted animate-pulse rounded" />
            )}
          </div>
        )}

        {boards?.length === 0 ? (
          <Card className="text-center p-12 border-dashed border-2 border-border">
            <CardTitle className="text-2xl">
              {t("menu_board_management.list.no_boards_title")}
            </CardTitle>
            <p className="text-muted-foreground my-4">
              {t("menu_board_management.list.no_boards_desc")}
            </p>
            {canCreate && (
              <Button className="mt-4" onClick={openCreateModal}>
                <Plus className="h-4 w-4 mr-2" />
                {t("menu_board_management.list.create_board")}
              </Button>
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {boards?.map((board) => {
              const online = isBoardOnline(board.lastCheckedInAt);
              return (
                <Card
                  key={board.id}
                  className="p-4 border border-border rounded-xl"
                >
                  <CardContent className="space-y-3 p-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "h-2.5 w-2.5 rounded-full shrink-0",
                          online ? "bg-green-500" : "bg-muted-foreground/40",
                        )}
                        title={
                          online
                            ? t("menu_board_management.list.online")
                            : t("menu_board_management.list.offline")
                        }
                      />
                      <CardTitle className="text-xl font-semibold flex-1 truncate">
                        {board.name}
                      </CardTitle>
                      {canUpdate && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditModal(board)}>
                              <Pencil className="h-4 w-4 mr-2" />
                              {t("menu_board_management.list.edit")}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleCopyLink(board)}>
                              <Copy className="h-4 w-4 mr-2" />
                              {t("menu_board_management.list.copy_link")}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setQrValue(getPublicUrl(board.publicToken))}
                            >
                              <QrCode className="h-4 w-4 mr-2" />
                              {t("menu_board_management.list.show_qr")}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setRegenerateTarget(board)}>
                              <RefreshCw className="h-4 w-4 mr-2" />
                              {t("menu_board_management.list.regenerate_link")}
                            </DropdownMenuItem>
                            {canDelete && (
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => setDeleteTarget(board)}
                              >
                                <Trash className="h-4 w-4 mr-2" />
                                {t("menu_board_management.list.delete")}
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        {board.displayMode === "GRID"
                          ? t("menu_board_management.list.mode_grid")
                          : t("menu_board_management.list.mode_carousel")}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {t("menu_board_management.list.categories_count", {
                          count: board.categoryIds.length,
                        })}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {t("menu_board_management.list.active")}
                      </span>
                      <Switch
                        checked={board.isActive}
                        disabled={!canUpdate}
                        onCheckedChange={(v) => handleToggleActive(board, v)}
                      />
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {canCreate && (
              <Card
                className={cn(
                  "flex flex-col items-center justify-center cursor-pointer p-6 border-dashed border-2 transition rounded-xl",
                  canCreateMenuBoard
                    ? "border-border hover:bg-muted"
                    : "border-border opacity-60 bg-muted cursor-not-allowed",
                )}
                onClick={openCreateModal}
              >
                <Plus
                  className={cn(
                    "h-6 w-6 mb-2",
                    canCreateMenuBoard ? "text-indigo-500" : "text-muted-foreground",
                  )}
                />
                <p
                  className={cn(
                    "font-semibold",
                    canCreateMenuBoard ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {t("menu_board_management.list.create_board_card")}
                </p>
                {!canCreateMenuBoard && (
                  <span className="text-[10px] font-bold text-indigo-600 uppercase mt-1">
                    {t("menu_board_management.list.upgrade")}
                  </span>
                )}
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
