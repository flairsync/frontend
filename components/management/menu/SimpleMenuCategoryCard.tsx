
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    ChevronDown, ChevronUp, Edit, MoreVertical, Plus, Trash, UtensilsCrossed
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { BusinessMenuCategory } from "@/models/business/menu/BusinessMenuCategory";
import { SimpleMenuItemRow } from "./SimpleMenuItemRow";
import { useTranslation } from "react-i18next";

type Props = {
    category: BusinessMenuCategory;
    onEdit: () => void;
    onDelete: () => void;
    onAddItem: () => void;
    onEditItem: (id: string) => void;
    onDeleteItem: (id: string) => void;
    onDuplicateItem: (id: string) => void;
    onMoveItemUp: (id: string) => void;
    onMoveItemDown: (id: string) => void;
    onMoveItemToCategory: (id: string) => void;
    onMoveCategoryUp?: () => void;
    onMoveCategoryDown?: () => void;
};

export const SimpleMenuCategoryCard = ({
    category,
    onEdit,
    onDelete,
    onAddItem,
    onEditItem,
    onDeleteItem,
    onDuplicateItem,
    onMoveItemUp,
    onMoveItemDown,
    onMoveItemToCategory,
    onMoveCategoryUp,
    onMoveCategoryDown
}: Props) => {
    const [isOpen, setIsOpen] = useState(false);
    const { t } = useTranslation();

    return (
        <div className="mb-2">
            <Card className="border border-zinc-200 dark:border-zinc-700 rounded-xl hover:shadow-lg transition-all">
                {/* Header */}
                <div
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded-t-xl transition gap-4 sm:gap-0"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <div className="flex items-center gap-3 w-full sm:w-auto overflow-hidden">
                        <div className="flex flex-col gap-1 mr-2 border-r border-zinc-200 dark:border-zinc-700 pr-2">
                            <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onMoveCategoryUp?.();
                                }}
                                disabled={!onMoveCategoryUp}
                            >
                                <ChevronUp className="h-4 w-4" />
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onMoveCategoryDown?.();
                                }}
                                disabled={!onMoveCategoryDown}
                            >
                                <ChevronDown className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-lg text-indigo-600 dark:text-indigo-400">
                            <UtensilsCrossed className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-lg text-zinc-900 dark:text-zinc-100 truncate">
                                {category.name}
                            </h3>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                {t('menu_management.labels.items_count', { count: category.items?.length || 0 })}
                            </p>
                        </div>
                        <div className="sm:hidden text-zinc-400">
                            {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto ml-auto sm:ml-0">
                        <Button
                            size="icon"
                            variant="ghost"
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit();
                            }}
                        >
                            <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                            size="icon"
                            variant="destructive"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete();
                            }}
                        >
                            <Trash className="h-4 w-4" />
                        </Button>
                        <Button
                            size="sm"
                            className="bg-indigo-500 text-white hover:bg-indigo-600"
                            onClick={(e) => {
                                e.stopPropagation();
                                onAddItem();
                            }}
                        >
                            <Plus className="h-4 w-4 mr-1" /> <span className="hidden sm:inline">{t('menu_management.actions.add_item')}</span>
                            <span className="sm:hidden">{t('shared.actions.add')}</span>
                        </Button>
                    </div>
                </div>

                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                        >
                            <CardContent className="p-4 pt-0 border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-b-xl">
                                <div className="space-y-3 pt-4">
                                    {category.items && category.items.length > 0 ? (
                                        category.items.map((item, index) => (
                                            <SimpleMenuItemRow
                                                key={item.id}
                                                item={item}
                                                category={category}
                                                onEdit={() => onEditItem(item.id)}
                                                onDelete={() => onDeleteItem(item.id)}
                                                onDuplicate={() => onDuplicateItem(item.id)}
                                                onMoveUp={index > 0 ? () => onMoveItemUp(item.id) : undefined}
                                                onMoveDown={index < (category.items?.length || 0) - 1 ? () => onMoveItemDown(item.id) : undefined}
                                                onMoveToCategory={() => onMoveItemToCategory(item.id)}
                                            />
                                        ))
                                    ) : (
                                        <div className="text-center py-8 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border border-dashed border-zinc-200 dark:border-zinc-700">
                                            <p className="text-zinc-500 dark:text-zinc-400 italic text-sm">
                                                {t('menu_management.labels.no_items_category')}
                                            </p>
                                            <Button
                                                variant="link"
                                                className="text-indigo-500 mt-2 h-auto p-0"
                                                onClick={onAddItem}
                                            >
                                                {t('menu_management.labels.add_first_item')}
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </motion.div>
                    )}
                </AnimatePresence>
            </Card>
        </div>
    );
};
