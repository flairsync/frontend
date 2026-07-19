
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

import { useUsage } from "@/features/subscriptions/useUsage";
import { useSubscriptionStore } from "@/features/subscriptions/SubscriptionStore";
import { cn } from "@/lib/utils";
import { AuditLogHint } from "@/components/audit/AuditLogHint";

type Props = {
    category: BusinessMenuCategory;
    businessId?: string;
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
    businessId,
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
    const { t } = useTranslation("management");
    const { usage } = useUsage();
    const { openUpgradeModal } = useSubscriptionStore();
    const canCreateProduct = usage?.canCreateProduct ?? true;

    return (
        <div className="mb-2">
            <Card className="border border-border rounded-xl hover:shadow-lg transition-all">
                {/* Header */}
                <div
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 cursor-pointer hover:bg-muted/50 rounded-t-xl transition gap-4 sm:gap-0"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <div className="flex items-center gap-3 w-full sm:w-auto overflow-hidden">
                        <div className="flex flex-col gap-1 mr-2 border-r border-border pr-2">
                            <Button
                                size="sm"
                                variant="ghost"
                                className="h-9 w-9 p-0 hover:bg-muted rounded-full"
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
                                className="h-9 w-9 p-0 hover:bg-muted rounded-full"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onMoveCategoryDown?.();
                                }}
                                disabled={!onMoveCategoryDown}
                            >
                                <ChevronDown className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="bg-primary/10 p-2 rounded-lg text-primary">
                            <UtensilsCrossed className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1">
                                <h3 className="font-semibold text-lg text-foreground truncate">
                                    {category.name}
                                </h3>
                                <AuditLogHint
                                    entityType="menu_category"
                                    entityId={category.id}
                                    businessId={businessId}
                                />
                            </div>
                            <p className="text-sm text-muted-foreground">
                                {t('menu_management.labels.items_count', { count: category.items?.length || 0 })}
                            </p>
                        </div>
                        <div className="sm:hidden text-muted-foreground">
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
                            className={cn(
                                "transition",
                                canCreateProduct
                                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                    : "bg-muted text-muted-foreground cursor-not-allowed border-border"
                            )}
                            onClick={(e) => {
                                e.stopPropagation();
                                if (canCreateProduct) {
                                    onAddItem();
                                } else {
                                    openUpgradeModal("You've reached your product limit. Upgrade to add more items.");
                                }
                            }}
                        >
                            <Plus className="h-4 w-4 mr-1" /> <span className="hidden sm:inline">{t('menu_management.actions.add_item')}</span>
                            <span className="sm:hidden">{t('shared.actions.add')}</span>
                            {!canCreateProduct && <span className="text-[10px] font-bold text-primary uppercase ml-1">Upgrade</span>}
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
                            <CardContent className="p-4 pt-0 border-t border-border bg-card rounded-b-xl">
                                <div className="space-y-3 pt-4">
                                    {category.items && category.items.length > 0 ? (
                                        category.items.map((item, index) => (
                                            <SimpleMenuItemRow
                                                key={item.id}
                                                item={item}
                                                category={category}
                                                businessId={businessId}
                                                onEdit={() => onEditItem(item.id)}
                                                onDelete={() => onDeleteItem(item.id)}
                                                onDuplicate={() => onDuplicateItem(item.id)}
                                                onMoveUp={index > 0 ? () => onMoveItemUp(item.id) : undefined}
                                                onMoveDown={index < (category.items?.length || 0) - 1 ? () => onMoveItemDown(item.id) : undefined}
                                                onMoveToCategory={() => onMoveItemToCategory(item.id)}
                                            />
                                        ))
                                    ) : (
                                        <div className="text-center py-8 bg-muted rounded-lg border border-dashed border-border">
                                            <p className="text-muted-foreground italic text-sm">
                                                {t('menu_management.labels.no_items_category')}
                                            </p>
                                            <Button
                                                variant="link"
                                                className="text-primary mt-2 h-auto p-0"
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
