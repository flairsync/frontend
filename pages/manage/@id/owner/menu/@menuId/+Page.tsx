import React, { useEffect, useState, useRef } from "react";
import { usePageContext } from "vike-react/usePageContext";
import { useTranslation } from "react-i18next";

// #region UI Components
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
// #endregion

// #region Icons
import {
    Plus,
    ArrowLeft,
    Edit,
    AlertCircle,
    Info,
    AlertTriangle,
    Save,
    LayoutList,
    GripVertical
} from "lucide-react";
// #endregion

// #region Feature Hooks & Services
import { useBusinessSingleMenu } from "@/features/business/menu/useBusinessSingleMenu";
import { useBusinessMenus } from "@/features/business/menu/useBusinessMenus";
import { MenuHeader } from "@/features/business/menu/MenuHeader";
import { MenuChanges } from "@/features/business/menu/service";
import { diffCategories, snapshotCategories } from "@/features/business/menu/menuUtils";
// #endregion

// #region Models
import { BusinessMenuItem } from "@/models/business/menu/BusinessMenuItem";
import { BusinessMenuCategory } from "@/models/business/menu/BusinessMenuCategory";
// #endregion

// #region Modal Components
import { CategoryModal } from "@/components/management/menu/CreateCategoryModal";
import { ItemModal } from "@/components/management/menu/CreateItemModal";
import { MenuModal } from "@/components/management/menu/CreateMenuModal";
import { ItemsDuplicationModal } from "@/components/management/menu/ItemsDuplicationModal";
// #endregion

// #region Sortable Components
import { MenuCategoriesSortable } from "@/components/management/menu/DNDSortableCategories";
import { SimpleMenuCategories } from "@/components/management/menu/SimpleMenuCategories";
// #endregion

// #region Helpers
const getHintMeta = (level: number, t: any) => {
    if (level >= 5)
        return {
            icon: AlertTriangle,
            color: "text-red-600",
            badge: "bg-red-100 text-red-700",
            label: t('menu_management.labels.critical'),
        };

    if (level >= 4)
        return {
            icon: AlertCircle,
            color: "text-orange-600",
            badge: "bg-orange-100 text-orange-700",
            label: t('menu_management.labels.high'),
        };

    if (level >= 3)
        return {
            icon: AlertCircle,
            color: "text-yellow-600",
            badge: "bg-yellow-100 text-yellow-800",
            label: t('menu_management.labels.medium'),
        };

    return {
        icon: Info,
        color: "text-zinc-500",
        badge: "bg-zinc-100 text-zinc-700",
        label: t('menu_management.labels.low'),
    };
};
// #endregion

const MenuDetailPage: React.FC = () => {
    // #region Routing
    const { routeParams } = usePageContext();
    const { menuId, id } = routeParams;
    const { t } = useTranslation();
    // #endregion

    // #region Hooks
    const {
        // Menu
        businessMenu,
        updateMenu,
        updateMenuStructure,
        // Categories
        createNewCategory,
        updateCategory,
        removeCategory,
        duplicateItemsIntoCategory,
        // Items
        updateItem,
        createNewItem,
        removeItem
    } = useBusinessSingleMenu(id, menuId);

    const { businessAllItems } = useBusinessMenus(id);
    // #endregion

    // #region State
    // Menu Structure & Changes
    const [categories, setCategories] = useState(businessMenu?.getOrderedCategories() || []);
    const [menuChanges, setMenuChanges] = useState<MenuChanges>({
        categoryOrderChanges: [],
        itemOrderChanges: [],
        itemParentChanges: [],
    });
    const initialSnapshotRef = useRef(snapshotCategories(categories));

    // View Mode
    const [viewMode, setViewMode] = useState<'dnd' | 'simple'>('dnd');

    // Modals & Active Items
    const [createCategoryModal, setCreateCategoryModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState<{ id: string; name: string; description: string; } | undefined>();
    const [createItemCatId, setCreateItemCatId] = useState<string | undefined>();
    const [editingItem, setEditingItem] = useState<{ category: string, item: BusinessMenuItem } | undefined>();
    const [editMenu, setEditMenu] = useState(false);
    const [toDuplicateCategory, setToDuplicateCategory] = useState<string | undefined>();
    const [deleteCategoryConfirm, setDeleteCategoryConfirm] = useState<string | null>(null);
    const [movingItem, setMovingItem] = useState<{ itemId: string, currentCatId: string } | null>(null);
    // #endregion

    // #region Effects
    useEffect(() => {
        // Default to simple view on mobile
        if (window.innerWidth < 768) {
            setViewMode('simple');
        }
    }, []);

    useEffect(() => {
        const sortedCats = businessMenu?.getOrderedCategories() || [];
        setCategories(sortedCats);
        // Reset snapshot when data changes from server
        initialSnapshotRef.current = snapshotCategories(sortedCats);
        // Reset changes
        setMenuChanges({
            categoryOrderChanges: [],
            itemOrderChanges: [],
            itemParentChanges: [],
        });
    }, [businessMenu]);
    // #endregion

    // #region Logic & Handlers

    // -- Structure Updates --
    const updateCategoriesWithDiff = (newCategories: BusinessMenuCategory[]) => {
        setCategories(newCategories);
        const diff = diffCategories(initialSnapshotRef.current, newCategories);
        setMenuChanges(diff);
    };

    const hasChanges = () => {
        return (menuChanges.categoryOrderChanges.length > 0 || menuChanges.itemOrderChanges.length > 0 || menuChanges.itemParentChanges.length > 0);
    };

    const handleSaveStructure = () => {
        if (hasChanges()) {
            updateMenuStructure(menuChanges);
        }
    };

    // -- Item Moving Logic --
    const handleMoveItemToCategory = (targetCatId: string) => {
        if (!movingItem) return;

        const oldCatIndex = categories.findIndex(c => c.id === movingItem.currentCatId);
        const newCatIndex = categories.findIndex(c => c.id === targetCatId);

        if (oldCatIndex !== -1 && newCatIndex !== -1) {
            const newCategories = [...categories];

            const oldItems = [...(newCategories[oldCatIndex].items || [])];
            const itemIndex = oldItems.findIndex(i => i.id === movingItem.itemId);
            if (itemIndex === -1) return;

            const [movedItem] = oldItems.splice(itemIndex, 1);
            newCategories[oldCatIndex] = { ...newCategories[oldCatIndex], items: oldItems };

            const newItems = [...(newCategories[newCatIndex].items || [])];
            newItems.push(movedItem);
            newCategories[newCatIndex] = { ...newCategories[newCatIndex], items: newItems };

            updateCategoriesWithDiff(newCategories);
        }
        setMovingItem(null);
    };

    // -- Category Handlers (Simple View) --
    const handleMoveCategoryUp = (catId: string) => {
        const index = categories.findIndex(c => c.id === catId);
        if (index > 0) {
            const newCategories = [...categories];
            const temp = newCategories[index];
            newCategories[index] = newCategories[index - 1];
            newCategories[index - 1] = temp;
            updateCategoriesWithDiff(newCategories);
        }
    };

    const handleMoveCategoryDown = (catId: string) => {
        const index = categories.findIndex(c => c.id === catId);
        if (index < categories.length - 1) {
            const newCategories = [...categories];
            const temp = newCategories[index];
            newCategories[index] = newCategories[index + 1];
            newCategories[index + 1] = temp;
            updateCategoriesWithDiff(newCategories);
        }
    };

    // -- Item Handlers (Simple View) --
    const handleMoveItemUp = (itemId: string, catId: string) => {
        const categoryIndex = categories.findIndex(c => c.id === catId);
        if (categoryIndex === -1) return;

        const category = categories[categoryIndex];
        const items = [...(category.items || [])];
        const itemIndex = items.findIndex(i => i.id === itemId);

        if (itemIndex > 0) {
            // Swap
            const itemA = items[itemIndex];
            const itemB = items[itemIndex - 1];
            items[itemIndex] = itemB;
            items[itemIndex - 1] = itemA;

            const newCategories = [...categories];
            newCategories[categoryIndex] = { ...category, items };
            updateCategoriesWithDiff(newCategories);
        }
    };

    const handleMoveItemDown = (itemId: string, catId: string) => {
        const categoryIndex = categories.findIndex(c => c.id === catId);
        if (categoryIndex === -1) return;

        const category = categories[categoryIndex];
        const items = [...(category.items || [])];
        const itemIndex = items.findIndex(i => i.id === itemId);

        if (itemIndex < items.length - 1) {
            // Swap
            const itemA = items[itemIndex];
            const itemB = items[itemIndex + 1];
            items[itemIndex] = itemB;
            items[itemIndex + 1] = itemA;

            const newCategories = [...categories];
            newCategories[categoryIndex] = { ...category, items };
            updateCategoriesWithDiff(newCategories);
        }
    };

    // -- Editing Handlers --
    const handleEditCategory = (catId: string) => {
        const cat = categories.find(c => c.id === catId);
        if (cat) {
            setEditingCategory({
                id: cat.id,
                name: cat.name,
                description: cat.description || ""
            });
        }
    };

    const handleEditItem = (itemId: string) => {
        const category = categories.find(c => c.items?.some(i => i.id === itemId));
        const item = category?.items?.find(i => i.id === itemId);
        if (category && item) {
            setEditingItem({ category: category.id, item });
        }
    };

    const handleDeleteItem = (itemId: string) => {
        const category = categories.find(c => c.items?.some(i => i.id === itemId));
        if (category) {
            removeItem({ categoryId: category.id, itemId });
        }
    };

    const handleDuplicateItem = (itemId: string) => {
        const category = categories.find(c => c.items?.some(i => i.id === itemId));
        const item = category?.items?.find(i => i.id === itemId);

        if (category && item) {
            duplicateItemsIntoCategory({
                categoryId: category.id,
                data: [{
                    id: item.id,
                    useMedia: true
                }]
            });
        }
    };
    // #endregion

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 p-8">

            {/* #region Modals */}
            <MenuModal
                isOpen={editMenu}
                onClose={() => setEditMenu(false)}
                onSubmit={(data) => {
                    updateMenu({
                        description: data.description,
                        endDate: data.endDate,
                        endTime: data.endTime,
                        icon: data.icon,
                        name: data.name,
                        repeatDaysOfWeek: data.repeatDays,
                        repeatYearly: data.repeatYearly,
                        startDate: data.startDate,
                        startTime: data.startTime
                    });
                    setEditMenu(false);
                }}
                menu={businessMenu}
            />

            <CategoryModal
                open={createCategoryModal || editingCategory != undefined}
                onClose={() => {
                    setCreateCategoryModal(false);
                    setEditingCategory(undefined);
                }}
                category={editingCategory}
                onConfirm={(data) => {
                    if (editingCategory) {
                        updateCategory({
                            categoryId: editingCategory.id,
                            data
                        });
                    } else {
                        createNewCategory({
                            name: data.name,
                            description: data.description,
                        });
                    }
                    setEditingCategory(undefined);
                    setCreateCategoryModal(false);
                }}
            />

            <ItemModal
                availableItems={businessAllItems}
                allergies={[]}
                onClose={() => {
                    setCreateItemCatId(undefined);
                    setEditingItem(undefined);
                }}
                initialData={editingItem?.item}
                open={(createItemCatId != undefined || editingItem != undefined)}
                onConfirm={(data) => {
                    if (!editingItem) {
                        createNewItem({
                            catid: createItemCatId!,
                            data: {
                                allergies: data.allergyIds,
                                description: data.description,
                                files: data.images,
                                name: data.name,
                                price: data.price,
                            },
                        });
                    } else {
                        updateItem({
                            categoryId: editingItem.category,
                            itemId: editingItem.item.id,
                            data: {
                                allergies: data.allergyIds,
                                description: data.description,
                                files: data.images,
                                name: data.name,
                                price: data.price,
                            }
                        });
                    }
                    setCreateItemCatId(undefined);
                    setEditingItem(undefined);
                }}
            />

            {businessAllItems && (
                <ItemsDuplicationModal
                    items={businessAllItems}
                    onConfirm={(data) => {
                        if (toDuplicateCategory) {
                            duplicateItemsIntoCategory({
                                categoryId: toDuplicateCategory,
                                data: data,
                            });
                        }
                        setToDuplicateCategory(undefined);
                    }}
                    onOpenChange={(open) => {
                        if (!open) setToDuplicateCategory(undefined);
                    }}
                    open={toDuplicateCategory != undefined}
                />
            )}

            <Dialog open={deleteCategoryConfirm != null} onOpenChange={(open) => {
                if (!open) setDeleteCategoryConfirm(null);
            }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('menu_management.actions.delete_category')}</DialogTitle>
                        <DialogDescription>
                            {t('menu_management.messages.delete_category_confirm')}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteCategoryConfirm(null)}>
                            {t('shared.actions.cancel')}
                        </Button>
                        <Button variant="destructive" onClick={() => {
                            if (deleteCategoryConfirm) {
                                removeCategory(deleteCategoryConfirm);
                                setDeleteCategoryConfirm(null);
                            }
                        }}>
                            {t('shared.actions.delete')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={movingItem != null} onOpenChange={(open) => !open && setMovingItem(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('menu_management.actions.move_to_category')}</DialogTitle>
                        <DialogDescription>{t('menu_management.messages.move_item_select_category')}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                        {categories.map(cat => (
                            <Button
                                key={cat.id}
                                variant="outline"
                                className={`w-full justify-start ${movingItem?.currentCatId === cat.id ? 'opacity-50' : ''}`}
                                disabled={movingItem?.currentCatId === cat.id}
                                onClick={() => handleMoveItemToCategory(cat.id)}
                            >
                                {cat.name}
                            </Button>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>
            {/* #endregion */}

            <a href="./">
                <Button className="flex items-center gap-2 bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-100 hover:bg-zinc-300 dark:hover:bg-zinc-600 transition rounded-lg px-4 py-2">
                    <ArrowLeft className="h-4 w-4" /> {t('menu_management.labels.go_back_menus')}
                </Button>
            </a>

            <div className="max-w-6xl mx-auto space-y-6">
                {/* #region Page Header */}
                {businessMenu && (
                    <>
                        <MenuHeader
                            menu={{
                                name: businessMenu?.name,
                                id: businessMenu?.id,
                                description: businessMenu?.description,
                            }}
                            onEdit={() => setEditMenu(true)}
                            onDuplicate={() => { }}
                            onDelete={() => { }}
                        />
                        {businessMenu.hints && Object.keys(businessMenu.hints).length > 0 && (
                            <>
                                <h4 className="mb-3 text-lg font-semibold">{t('menu_management.labels.menu_hints')}</h4>
                                <Card>
                                    <CardContent className="space-y-4 pt-6">
                                        {Object.entries(businessMenu.hints)
                                            .sort((a, b) => b[1] - a[1]) // most important first
                                            .map(([hintKey, importance]) => {
                                                const meta = getHintMeta(importance, t);
                                                const Icon = meta.icon;

                                                return (
                                                    <div
                                                        key={hintKey}
                                                        className="flex gap-4 rounded-lg border p-4 hover:bg-zinc-50 transition"
                                                    >
                                                        <div className={`mt-1 ${meta.color}`}>
                                                            <Icon className="h-5 w-5" />
                                                        </div>
                                                        <div className="flex-1 space-y-1">
                                                            <div className="flex items-center gap-2">
                                                                <h5 className="font-medium">{hintKey}</h5>
                                                                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${meta.badge}`}>
                                                                    {meta.label} • {importance}/5
                                                                </span>
                                                            </div>
                                                            <p className="text-sm text-zinc-500">
                                                                No description yet. This hint may require adjusting menu
                                                                configuration such as dates, availability, or pricing.
                                                            </p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                    </CardContent>
                                </Card>
                            </>
                        )}
                    </>
                )}
                {/* #endregion */}

                {/* #region Controls */}
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                    <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg self-start">
                        <Button
                            variant={viewMode === 'simple' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setViewMode('simple')}
                            className="gap-2"
                        >
                            <LayoutList className="h-4 w-4" />
                            <span className="inline">{t('menu_management.labels.simple_view')}</span>
                        </Button>
                        <Button
                            variant={viewMode === 'dnd' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setViewMode('dnd')}
                            className="gap-2"
                        >
                            <GripVertical className="h-4 w-4" />
                            <span className="inline">{t('menu_management.labels.organize_view')}</span>
                        </Button>
                    </div>

                    <Button
                        onClick={() => setCreateCategoryModal(true)}
                        className="flex items-center gap-2 bg-indigo-500 text-white hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-500 transition px-3 sm:px-4"
                    >
                        <Plus className="h-4 w-4 sm:mr-1" />
                        <span className="hidden sm:inline">{t('menu_management.actions.add_category')}</span>
                    </Button>
                    <Button
                        disabled={!hasChanges()}
                        onClick={handleSaveStructure}
                        className="flex items-center gap-2 bg-indigo-500 text-white hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-500 transition px-3 sm:px-4"
                    >
                        <Save className="h-4 w-4 sm:mr-1" />
                        <span className="hidden sm:inline">{t('menu_management.actions.save_changes')}</span>
                    </Button>
                </div>
                {/* #endregion */}

                {/* #region Menu Categories Content */}
                {viewMode === 'simple' ? (
                    <SimpleMenuCategories
                        categories={categories}
                        onEditCategory={handleEditCategory}
                        onDeleteCategory={(catId) => setDeleteCategoryConfirm(catId)}
                        onAddItem={(catId) => setCreateItemCatId(catId)}
                        onEditItem={handleEditItem}
                        onDeleteItem={handleDeleteItem}
                        onDuplicateItem={handleDuplicateItem}
                        onMoveItemUp={handleMoveItemUp}
                        onMoveItemDown={handleMoveItemDown}
                        onMoveItemToCategory={(itemId, currentCatId) => setMovingItem({ itemId, currentCatId })}
                        onMoveCategoryUp={handleMoveCategoryUp}
                        onMoveCategoryDown={handleMoveCategoryDown}
                    />
                ) : (
                    <MenuCategoriesSortable
                        categories={categories}
                        setCategories={setCategories}
                        onChange={(changes) => setMenuChanges(changes)}
                        onEditCategory={handleEditCategory}
                        onDeleteCategory={(catId) => setDeleteCategoryConfirm(catId)}
                        onAddItem={(catId) => setCreateItemCatId(catId)}
                        onEditItem={handleEditItem}
                        onDeleteItem={handleDeleteItem}
                        onDuplicateItem={handleDuplicateItem}
                    />
                )}
                {/* #endregion */}
            </div>
        </div>
    );
};

export default MenuDetailPage;
