import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MenuDisplayBoard, MenuDisplayMode } from "@/models/business/menuBoards/MenuDisplayBoard";
import { SortableCategoryRow } from "./SortableCategoryRow";

export type BoardPayload = {
  name: string;
  categoryIds: string[];
  displayMode: MenuDisplayMode;
  theme: string;
  presentationConfig: Record<string, any> | null;
};

type AvailableCategory = { id: string; name: string };

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: BoardPayload) => void;
  board?: MenuDisplayBoard | null;
  availableCategories: AvailableCategory[];
};

const DEFAULT_INTERVAL_SECONDS = 8;

export const BoardModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSubmit,
  board,
  availableCategories,
}) => {
  const { t } = useTranslation("management");
  const sensors = useSensors(useSensor(PointerSensor));

  const [name, setName] = useState("");
  const [displayMode, setDisplayMode] = useState<MenuDisplayMode>("GRID");
  const [theme, setTheme] = useState("light");
  const [intervalSeconds, setIntervalSeconds] = useState(DEFAULT_INTERVAL_SECONDS);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    if (board) {
      setName(board.name);
      setDisplayMode(board.displayMode);
      setTheme(board.theme || "light");
      setIntervalSeconds(
        board.presentationConfig?.intervalSeconds ?? DEFAULT_INTERVAL_SECONDS,
      );
      setSelectedIds(board.categoryIds ?? []);
    } else {
      setName("");
      setDisplayMode("GRID");
      setTheme("light");
      setIntervalSeconds(DEFAULT_INTERVAL_SECONDS);
      setSelectedIds([]);
    }
  }, [board, isOpen]);

  const categoryById = new Map(availableCategories.map((c) => [c.id, c]));
  const selectedCategories = selectedIds
    .map((id) => categoryById.get(id))
    .filter((c): c is AvailableCategory => !!c);
  const unselectedCategories = availableCategories.filter(
    (c) => !selectedIds.includes(c.id),
  );

  const addCategory = (id: string) => {
    setSelectedIds((prev) => [...prev, id]);
  };

  const removeCategory = (id: string) => {
    setSelectedIds((prev) => prev.filter((cid) => cid !== id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = selectedIds.indexOf(active.id as string);
    const newIndex = selectedIds.indexOf(over.id as string);
    if (oldIndex === -1 || newIndex === -1) return;
    setSelectedIds((prev) => arrayMove(prev, oldIndex, newIndex));
  };

  const handleSubmit = () => {
    if (!name.trim() || selectedIds.length === 0) return;
    onSubmit({
      name: name.trim(),
      categoryIds: selectedIds,
      displayMode,
      theme,
      presentationConfig:
        displayMode === "CAROUSEL" ? { intervalSeconds } : null,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xl w-full max-h-[90vh] overflow-y-auto p-4 sm:p-8 rounded-lg">
        <DialogHeader>
          <DialogTitle>
            {board
              ? t("menu_board_management.modal.edit_title")
              : t("menu_board_management.modal.create_title")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div>
            <Label>{t("menu_board_management.modal.name")}</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("menu_board_management.modal.name")}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>{t("menu_board_management.modal.display_mode")}</Label>
              <Select
                value={displayMode}
                onValueChange={(v) => setDisplayMode(v as MenuDisplayMode)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GRID">
                    {t("menu_board_management.modal.display_mode_grid")}
                  </SelectItem>
                  <SelectItem value="CAROUSEL">
                    {t("menu_board_management.modal.display_mode_carousel")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>{t("menu_board_management.modal.theme")}</Label>
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">
                    {t("menu_board_management.modal.theme_light")}
                  </SelectItem>
                  <SelectItem value="dark">
                    {t("menu_board_management.modal.theme_dark")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {displayMode === "CAROUSEL" && (
            <div>
              <Label>{t("menu_board_management.modal.interval_seconds")}</Label>
              <Input
                type="number"
                min={2}
                value={intervalSeconds}
                onChange={(e) =>
                  setIntervalSeconds(Math.max(2, Number(e.target.value) || DEFAULT_INTERVAL_SECONDS))
                }
                className="mt-1"
              />
            </div>
          )}

          <div>
            <Label>{t("menu_board_management.modal.categories")}</Label>
            <p className="text-xs text-muted-foreground mb-2">
              {t("menu_board_management.modal.categories_hint")}
            </p>

            {selectedCategories.length > 0 && (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={selectedCategories.map((c) => c.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2 mb-3">
                    {selectedCategories.map((cat) => (
                      <SortableCategoryRow
                        key={cat.id}
                        id={cat.id}
                        name={cat.name}
                        onRemove={() => removeCategory(cat.id)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}

            {unselectedCategories.length > 0 && (
              <ScrollArea className="max-h-40 border border-dashed border-border rounded-md p-2">
                <div className="flex flex-wrap gap-2">
                  {unselectedCategories.map((cat) => (
                    <Button
                      key={cat.id}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addCategory(cat.id)}
                    >
                      + {cat.name}
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            )}

            {availableCategories.length === 0 && (
              <p className="text-sm text-muted-foreground italic">
                {t("menu_board_management.modal.no_categories")}
              </p>
            )}
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button
            onClick={handleSubmit}
            disabled={!name.trim() || selectedIds.length === 0}
            className="w-full"
          >
            {board
              ? t("menu_board_management.modal.update_button")
              : t("menu_board_management.modal.create_button")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
