
import React from "react";
import { Button } from "@/components/ui/button";
import { Edit, Trash, Copy, ArrowRight, ChevronUp, ChevronDown, MoreVertical } from "lucide-react";
import { BusinessMenuCategory } from "@/models/business/menu/BusinessMenuCategory";
import { ConfirmAction } from "@/components/shared/ConfirmAction";
import { useTranslation } from "react-i18next";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Props = {
    item: any;
    category: BusinessMenuCategory;
    onEdit: () => void;
    onDelete: () => void;
    onDuplicate: () => void;
};

export const SimpleMenuItemRow = ({
    item,
    category,
    onEdit,
    onDelete,
    onDuplicate,
    onMoveUp,
    onMoveDown,
    onMoveToCategory
}: Props & {
    onMoveUp?: () => void;
    onMoveDown?: () => void;
    onMoveToCategory?: () => void;
}) => {
    const { t } = useTranslation();

    return (
        <div className="flex p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:shadow-sm transition">
            <div className="flex-1 flex justify-between items-center gap-2 overflow-hidden">
                {/* Reorder Buttons */}
                <div className="flex flex-col gap-1 pr-2 border-r border-zinc-200 dark:border-zinc-700 mr-2">
                    <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full"
                        onClick={(e) => {
                            e.stopPropagation();
                            onMoveUp?.();
                        }}
                        disabled={!onMoveUp}
                    >
                        <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full"
                        onClick={(e) => {
                            e.stopPropagation();
                            onMoveDown?.();
                        }}
                        disabled={!onMoveDown}
                    >
                        <ChevronDown className="h-4 w-4" />
                    </Button>
                </div>

                <div className="flex-1 min-w-0 pr-2">
                    <p className="font-medium text-zinc-800 dark:text-zinc-100 truncate">{item.name}</p>
                    {item.description && <p className="text-sm text-zinc-500 dark:text-zinc-400 truncate">{item.description}</p>}
                </div>
                {/* Desktop Actions */}
                <div className="hidden sm:flex items-center gap-2">
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400 mr-2 text-base">{item.price}</span>

                    {onMoveToCategory && (
                        <Button
                            size="sm"
                            variant="outline"
                            className="h-8 px-3"
                            onClick={(e) => {
                                e.stopPropagation();
                                onMoveToCategory();
                            }}
                        >
                            <ArrowRight className="h-4 w-4 mr-1" />
                            <span>{t('shared.actions.move')}</span>
                        </Button>
                    )}

                    <ConfirmAction
                        onConfirm={onDelete}
                        title={t('menu_management.messages.delete_item_confirm_title')}
                        description={t('menu_management.messages.delete_item_confirm_desc', { name: item.name })}
                        confirmText={t('shared.actions.delete')}
                        storageKey="delete-item-confirm"
                    >
                        <Button
                            size="sm"
                            variant="destructive"
                            className="h-8 px-3"
                        >
                            <Trash className="h-4 w-4 mr-1" />
                            <span>{t('shared.actions.delete')}</span>
                        </Button>
                    </ConfirmAction>

                    <Button
                        size="sm"
                        variant="outline"
                        className="h-8 px-3"
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit();
                        }}
                    >
                        <Edit className="h-4 w-4 mr-1" />
                        <span>{t('shared.actions.edit')}</span>
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        className="h-8 px-3"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDuplicate();
                        }}
                    >
                        <Copy className="h-4 w-4 mr-1" />
                        <span>{t('shared.actions.duplicate')}</span>
                    </Button>
                </div>

                {/* Mobile Actions (Dropdown) */}
                <div className="flex sm:hidden items-center gap-2">
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400 text-sm">{item.price}</span>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(); }}>
                                <Edit className="h-4 w-4 mr-2" /> {t('shared.actions.edit')}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDuplicate(); }}>
                                <Copy className="h-4 w-4 mr-2" /> {t('shared.actions.duplicate')}
                            </DropdownMenuItem>
                            {onMoveToCategory && (
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onMoveToCategory(); }}>
                                    <ArrowRight className="h-4 w-4 mr-2" /> {t('menu_management.actions.move_to_category')}
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="text-red-600 focus:text-red-600"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (window.confirm(t('menu_management.messages.delete_item_confirm_desc', { name: item.name }))) {
                                        onDelete();
                                    }
                                }}
                            >
                                <Trash className="h-4 w-4 mr-2" /> {t('shared.actions.delete')}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </div>
    );
};
