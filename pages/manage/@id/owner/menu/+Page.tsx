import React, { useState } from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Coffee, Moon, ForkKnife } from "lucide-react";
import { motion } from "framer-motion";
import { useBusinessMenus } from "@/features/business/menu/useBusinessMenus";
import { usePageContext } from "vike-react/usePageContext";
import { MenuModal } from "@/components/management/menu/CreateMenuModal";
import { IconRenderer } from "@/components/shared/IconRenderer";
import { useTranslation } from "react-i18next";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

import { useBusinessPlan } from "@/features/business/useBusinessPlan";
import { useSubscriptionStore } from "@/features/subscriptions/SubscriptionStore";
import { AuditLogHint } from "@/components/audit/AuditLogHint";

const MAX_HINTS_PREVIEW = 3;

const getMaxHintLevel = (hints: Record<string, number>) =>
    Math.max(...Object.values(hints));

const getBadgeStyles = (level: number) => {
    if (level >= 5)
        return "bg-red-600 text-white hover:bg-red-600";
    if (level >= 4)
        return "bg-orange-500 text-white hover:bg-orange-500";
    if (level >= 3)
        return "bg-yellow-500 text-black hover:bg-yellow-500";

    return "bg-foreground text-background hover:bg-foreground";
};

const MenusPage: React.FC = () => {
    const { t } = useTranslation("management");
    const [createModal, setCreateModal] = useState(false);
    const {
        routeParams,
    } = usePageContext();

    const {
        businessBasicMenus,
        createNewMenu
    } = useBusinessMenus(routeParams.id);

    const { plan } = useBusinessPlan(routeParams.id);
    const { openUpgradeModal } = useSubscriptionStore();

    const maxMenus = plan?.allowed.menus || 0;
    const currentMenus = plan?.current.menus || 0;
    const remainingMenus = Math.max(0, maxMenus - currentMenus);
    const canCreateMenu = plan ? plan.canCreateMenu : true;

    return (
        <div className="min-h-screen bg-background p-8">
            <MenuModal
                isOpen={createModal}
                onClose={() => {
                    setCreateModal(false);
                }}
                onSubmit={(data) => {
                    createNewMenu({
                        name: data.name,
                        description: data.description,
                        endDate: data.endDate,
                        endTime: data.endTime,
                        icon: data.icon,
                        repeatDaysOfWeek: data.repeatDays,
                        repeatYearly: data.repeatYearly,
                        startDate: data.startDate,
                        startTime: data.startTime
                    });
                    setCreateModal(false);
                }}
            />
            <div className="max-w-6xl mx-auto space-y-8">
                <h1 className="text-4xl font-bold text-foreground">
                    {t('menu_management.list.title')}
                </h1>
                <p className="text-muted-foreground">
                    {t('menu_management.list.description')}
                </p>

                {/* Subscription counter */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                    {plan ? (
                        <>
                            <span>
                                {canCreateMenu
                                    ? t('menu_management.list.remaining_menus', { count: remainingMenus })
                                    : t('menu_management.list.limit_reached')}
                            </span>
                            {!canCreateMenu && (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="ml-2 text-indigo-600 border-indigo-200"
                                    onClick={() => openUpgradeModal(`The business plan allows up to ${plan.allowed.menus} menus. The owner needs to upgrade to add more.`)}
                                >
                                    {t('menu_management.list.upgrade')}
                                </Button>
                            )}
                        </>
                    ) : (
                        <div className="h-5 w-32 bg-muted animate-pulse rounded" />
                    )}
                </div>

                {businessBasicMenus?.length === 0 ? (
                    <Card className="text-center p-12 border-dashed border-2 border-border">
                        <CardTitle className="text-2xl">{t('menu_management.list.no_menus_title')}</CardTitle>
                        <p className="text-muted-foreground my-4">
                            {t('menu_management.list.no_menus_desc')}
                        </p>
                        <Button className="mt-4"
                            onClick={() => {
                                if (canCreateMenu) {
                                    setCreateModal(true);
                                } else {
                                    openUpgradeModal(`The business plan allows up to ${plan?.allowed.menus ?? 0} menus. The owner needs to upgrade to add more.`);
                                }
                            }}
                        >
                            <Plus className="h-4 w-4 mr-2" /> {t('menu_management.list.create_menu')}
                        </Button>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {businessBasicMenus?.map((menu) => (
                            <motion.a
                                key={menu.id}
                                href={`/manage/${routeParams.id}/owner/menu/${menu.id}`}
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                className="block"
                            >
                                <Card className="cursor-pointer p-4 hover:shadow-xl transition-shadow border border-border rounded-xl">
                                    <CardContent className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <div className="text-2xl text-indigo-500 dark:text-indigo-400">
                                                <IconRenderer icon={menu.icon} className="h-6 w-6" />
                                            </div>
                                            <CardTitle className="text-xl font-semibold">{menu.name}</CardTitle>
                                            <AuditLogHint
                                                entityType="menu"
                                                entityId={menu.id}
                                                businessId={routeParams.id}
                                                className="ml-auto"
                                                side="left"
                                            />
                                        </div>

                                        <div className="flex items-center gap-4 text-muted-foreground text-sm">
                                            <span>{t('menu_management.list.categories_count', { count: menu.categoriesCount })}</span>
                                            <span>•</span>
                                            <span>{t('menu_management.list.items_count', { count: menu.itemsCount })}</span>
                                            <span>•</span>
                                            {menu.hints && Object.keys(menu.hints).length > 0 && (
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <span>
                                                                <Badge
                                                                    className={`flex items-center gap-1 px-2 py-0.5 text-xs font-medium cursor-default
                                                                        ${getBadgeStyles(getMaxHintLevel(menu.hints))}
                                                                    `}
                                                                >
                                                                    <AlertTriangle className="h-3.5 w-3.5" />
                                                                    {Object.keys(menu.hints).length}
                                                                    <span className="ml-0.5 hidden sm:inline">{t('menu_management.list.hints')}</span>
                                                                </Badge>
                                                            </span>
                                                        </TooltipTrigger>

                                                        <TooltipContent
                                                            className="bg-card text-foreground border shadow-md"
                                                            side="top"
                                                        >
                                                            <div className="space-y-1">
                                                                {Object.entries(menu.hints)
                                                                    .sort((a, b) => b[1] - a[1])
                                                                    .slice(0, MAX_HINTS_PREVIEW)
                                                                    .map(([hintKey, importance]) => (
                                                                        <div
                                                                            key={hintKey}
                                                                            className="flex justify-between gap-3 text-xs"
                                                                        >
                                                                            <span className="truncate">{hintKey}</span>
                                                                            <span className="font-medium text-muted-foreground">
                                                                                {importance}/5
                                                                            </span>
                                                                        </div>
                                                                    ))}

                                                                {Object.keys(menu.hints).length > MAX_HINTS_PREVIEW && (
                                                                    <div className="pt-1 text-xs text-muted-foreground">
                                                                        {t('menu_management.list.more_hints', { count: Object.keys(menu.hints).length - MAX_HINTS_PREVIEW })}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            )}
                                        </div>
                                        <p className="text-muted-foreground text-sm italic">
                                            {t('menu_management.list.manage_menu_hint')}
                                        </p>
                                    </CardContent>
                                </Card>
                            </motion.a>
                        ))}

                        {/* Create Menu Card */}
                        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                            <Card
                                className={cn(
                                    "flex flex-col items-center justify-center cursor-pointer p-6 border-dashed border-2 transition rounded-xl",
                                    canCreateMenu
                                        ? "border-border hover:bg-muted"
                                        : "border-border opacity-60 bg-muted cursor-not-allowed"
                                )}
                                onClick={() => {
                                    if (canCreateMenu) {
                                        setCreateModal(true);
                                    } else {
                                        openUpgradeModal(`The business plan allows up to ${plan?.allowed.menus ?? 0} menus. The owner needs to upgrade to add more.`);
                                    }
                                }}
                            >
                                <Plus className={cn("h-6 w-6 mb-2", canCreateMenu ? "text-indigo-500" : "text-muted-foreground")} />
                                <p className={cn("font-semibold", canCreateMenu ? "text-foreground" : "text-muted-foreground")}>
                                    {t('menu_management.list.create_new_menu_card')}
                                </p>
                                {!canCreateMenu && (
                                    <span className="text-[10px] font-bold text-indigo-600 uppercase mt-1">Upgrade Required</span>
                                )}
                            </Card>
                        </motion.div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MenusPage;
