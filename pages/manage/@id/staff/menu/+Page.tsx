import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useBusinessMenus } from "@/features/business/menu/useBusinessMenus";
import { useBusinessSingleMenu } from "@/features/business/menu/useBusinessSingleMenu";
import { usePermissions } from "@/features/auth/usePermissions";
import { usePageContext } from "vike-react/usePageContext";
import { Loader, Utensils, Plus, LayoutGrid, ChevronRight, Save } from "lucide-react";
import { MenuModal } from "@/components/management/menu/CreateMenuModal";
import { CategoryModal } from "@/components/management/menu/CreateCategoryModal";
import { ItemModal } from "@/components/management/menu/CreateItemModal";
import { SimpleMenuCategories } from "@/components/management/menu/SimpleMenuCategories";
import { MenuHeader } from "@/features/business/menu/MenuHeader";
import { useTranslation } from "react-i18next";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { BusinessMenuCategory } from "@/models/business/menu/BusinessMenuCategory";
import { snapshotCategories, diffCategories } from "@/features/business/menu/menuUtils";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Info } from "lucide-react";

export default function StaffMenuPage() {
    const { routeParams } = usePageContext();
    const businessId = routeParams.id;
    const { t } = useTranslation();

    // Permissions
    const { hasPermission, isLoading: loadingPermissions } = usePermissions(businessId);
    const canRead = hasPermission('MENU', 'read');
    const canCreate = hasPermission('MENU', 'create');
    const canUpdate = hasPermission('MENU', 'update');
    const canDelete = hasPermission('MENU', 'delete');

    // Menus State
    const { businessBasicMenus, createNewMenu } = useBusinessMenus(businessId);
    const [selectedMenuId, setSelectedMenuId] = useState<string | null>(null);

    // Selected Menu Details
    const {
        businessMenu,
        updateMenu,
        createNewCategory,
        updateCategory,
        removeCategory,
        createNewItem,
        updateItem,
        removeItem,
        updateMenuStructure,
        duplicateItemsIntoCategory
    } = useBusinessSingleMenu(businessId, selectedMenuId || "");

    // Structure & Changes
    const [categories, setCategories] = useState<BusinessMenuCategory[]>([]);
    const [menuChanges, setMenuChanges] = useState<any>({
        categoryOrderChanges: [],
        itemOrderChanges: [],
        itemParentChanges: [],
    });
    const initialSnapshotRef = useRef<any>(null);

    // Modal States
    const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [isItemModalOpen, setIsItemModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');

    // Move Logic State
    const [movingItem, setMovingItem] = useState<{ itemId: string, currentCatId: string } | null>(null);

    // Editing State
    const [editingMenu, setEditingMenu] = useState<any>(null);
    const [editingCategory, setEditingCategory] = useState<any>(null);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [targetCategoryId, setTargetCategoryId] = useState<string | null>(null);

    // Auto-select first menu
    useEffect(() => {
        if (businessBasicMenus && businessBasicMenus.length > 0 && !selectedMenuId) {
            setSelectedMenuId(businessBasicMenus[0].id);
        }
    }, [businessBasicMenus]);

    // Sync categories when businessMenu changes
    useEffect(() => {
        if (businessMenu) {
            const sortedCats = businessMenu.getOrderedCategories() || [];
            setCategories(sortedCats);
            initialSnapshotRef.current = snapshotCategories(sortedCats);
            setMenuChanges({
                categoryOrderChanges: [],
                itemOrderChanges: [],
                itemParentChanges: [],
            });
        }
    }, [businessMenu]);

    const updateCategoriesWithDiff = (newCategories: BusinessMenuCategory[]) => {
        setCategories(newCategories);
        const diff = diffCategories(initialSnapshotRef.current, newCategories);
        setMenuChanges(diff);
    };

    const hasChanges = () => {
        return (
            menuChanges.categoryOrderChanges.length > 0 ||
            menuChanges.itemOrderChanges.length > 0 ||
            menuChanges.itemParentChanges.length > 0
        );
    };

    const handleSaveStructure = () => {
        if (hasChanges()) {
            updateMenuStructure(menuChanges);
        }
    };

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
            newCategories[oldCatIndex] = { ...newCategories[oldCatIndex], items: oldItems } as any;

            const newItems = [...(newCategories[newCatIndex].items || [])];
            newItems.push(movedItem);
            newCategories[newCatIndex] = { ...newCategories[newCatIndex], items: newItems } as any;

            updateCategoriesWithDiff(newCategories);
        }
        setMovingItem(null);
    };

    if (loadingPermissions) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!canRead) {
        return (
            <div className="p-6 text-center">
                <Utensils className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-20" />
                <h2 className="text-xl font-bold">Access Denied</h2>
                <p className="text-muted-foreground">You do not have permission to view the menu.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)] overflow-hidden">
            {/* Sidebar: Menu List */}
            <aside className="w-full lg:w-72 border-b lg:border-r bg-muted/30 flex flex-col">
                <div className="p-4 flex items-center justify-between border-b">
                    <h2 className="font-semibold flex items-center gap-2 text-primary">
                        <LayoutGrid className="h-4 w-4" />
                        Menus
                    </h2>
                    {canCreate && (
                        <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-primary hover:bg-primary/10"
                            onClick={() => {
                                setEditingMenu(null);
                                setModalMode('create');
                                setIsMenuModalOpen(true);
                            }}
                        >
                            <Plus className="h-4 w-4" />
                        </Button>
                    )}
                </div>
                <ScrollArea className="flex-1">
                    <div className="p-2 space-y-1">
                        {businessBasicMenus?.map((menu) => (
                            <button
                                key={menu.id}
                                onClick={() => setSelectedMenuId(menu.id)}
                                className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-all duration-200 ${selectedMenuId === menu.id
                                    ? "bg-primary text-primary-foreground shadow-md scale-[1.02]"
                                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                <span className="truncate font-medium">{menu.name}</span>
                                <ChevronRight className={`h-4 w-4 transition-transform ${selectedMenuId === menu.id ? "rotate-90" : ""}`} />
                            </button>
                        ))}
                    </div>
                </ScrollArea>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto bg-background">
                {selectedMenuId && businessMenu ? (
                    <div className="max-w-5xl mx-auto p-6 space-y-8">
                        <MenuHeader
                            menu={businessMenu as any}
                            onEdit={() => {
                                if (!canUpdate) return;
                                setEditingMenu(businessMenu);
                                setModalMode('edit');
                                setIsMenuModalOpen(true);
                            }}
                            onDuplicate={() => { }}
                            onDelete={() => { }}
                        />

                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold tracking-tight text-foreground">Menu Structure</h2>
                            <div className="flex items-center gap-3">
                                {hasChanges() && (
                                    <Button
                                        onClick={handleSaveStructure}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg transition-all animate-in fade-in slide-in-from-right-2"
                                    >
                                        <Save className="h-4 w-4 mr-2" />
                                        Save Changes
                                    </Button>
                                )}
                                {canUpdate && (
                                    <Button
                                        onClick={() => {
                                            setEditingCategory(null);
                                            setModalMode('create');
                                            setIsCategoryModalOpen(true);
                                        }}
                                        className="bg-primary hover:bg-primary/90 shadow-md"
                                    >
                                        <Plus className="h-4 w-4 mr-1" /> Add Category
                                    </Button>
                                )}
                            </div>
                        </div>

                        <SimpleMenuCategories
                            categories={categories}
                            onEditCategory={(catId) => {
                                if (!canUpdate) return;
                                const cat = categories.find(c => c.id === catId);
                                setEditingCategory(cat);
                                setModalMode('edit');
                                setIsCategoryModalOpen(true);
                            }}
                            onDeleteCategory={(catId) => {
                                if (!canDelete) return;
                                removeCategory(catId);
                            }}
                            onAddItem={(catId) => {
                                if (!canUpdate) return;
                                setTargetCategoryId(catId);
                                setEditingItem(null);
                                setModalMode('create');
                                setIsItemModalOpen(true);
                            }}
                            onEditItem={(itemId) => {
                                if (!canUpdate) return;
                                const cat = categories.find(c => c.items?.some(i => i.id === itemId));
                                const item = cat?.items?.find(i => i.id === itemId);
                                setTargetCategoryId(cat?.id || null);
                                setEditingItem(item);
                                setModalMode('edit');
                                setIsItemModalOpen(true);
                            }}
                            onDeleteItem={(itemId) => {
                                if (!canUpdate) return;
                                const cat = categories.find(c => c.items?.some(i => i.id === itemId));
                                if (cat) removeItem({ categoryId: cat.id, itemId });
                            }}
                            onDuplicateItem={(itemId) => {
                                if (!canUpdate) return;
                                const cat = categories.find(c => c.items?.some(i => i.id === itemId));
                                if (cat) duplicateItemsIntoCategory({
                                    categoryId: cat.id,
                                    data: [{ id: itemId, useMedia: true }]
                                });
                            }}
                            onMoveItemUp={(itemId, catId) => {
                                const catIndex = categories.findIndex(c => c.id === catId);
                                if (catIndex === -1) return;
                                const items = [...(categories[catIndex].items || [])];
                                const index = items.findIndex(i => i.id === itemId);
                                if (index > 0) {
                                    [items[index], items[index - 1]] = [items[index - 1], items[index]];
                                    const newCats = [...categories];
                                    newCats[catIndex] = { ...newCats[catIndex], items } as any;
                                    updateCategoriesWithDiff(newCats);
                                }
                            }}
                            onMoveItemDown={(itemId, catId) => {
                                const catIndex = categories.findIndex(c => c.id === catId);
                                if (catIndex === -1) return;
                                const items = [...(categories[catIndex].items || [])];
                                const index = items.findIndex(i => i.id === itemId);
                                if (index < items.length - 1) {
                                    [items[index], items[index + 1]] = [items[index + 1], items[index]];
                                    const newCats = [...categories];
                                    newCats[catIndex] = { ...newCats[catIndex], items } as any;
                                    updateCategoriesWithDiff(newCats);
                                }
                            }}
                            onMoveItemToCategory={(itemId, catId) => {
                                if (!canUpdate) return;
                                setMovingItem({ itemId, currentCatId: catId });
                            }}
                            onMoveCategoryUp={(catId) => {
                                const index = categories.findIndex(c => c.id === catId);
                                if (index > 0) {
                                    const newCats = [...categories];
                                    [newCats[index], newCats[index - 1]] = [newCats[index - 1], newCats[index]];
                                    updateCategoriesWithDiff(newCats);
                                }
                            }}
                            onMoveCategoryDown={(catId) => {
                                const index = categories.findIndex(c => c.id === catId);
                                if (index < categories.length - 1) {
                                    const newCats = [...categories];
                                    [newCats[index], newCats[index + 1]] = [newCats[index + 1], newCats[index]];
                                    updateCategoriesWithDiff(newCats);
                                }
                            }}
                        />
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
                        <Utensils className="h-20 w-20 text-muted-foreground mb-6 opacity-10" />
                        <h2 className="text-2xl font-bold text-foreground">Select a Menu</h2>
                        <p className="text-muted-foreground max-w-sm mt-2">
                            Choose a menu from the sidebar or create a new one to manage its structure, categories, and items.
                        </p>
                        {canCreate && (
                            <Button
                                className="mt-8 bg-primary hover:bg-primary/90 shadow-lg px-8 py-6 rounded-xl text-lg"
                                onClick={() => {
                                    setEditingMenu(null);
                                    setModalMode('create');
                                    setIsMenuModalOpen(true);
                                }}
                            >
                                <Plus className="h-5 w-5 mr-2" /> Create First Menu
                            </Button>
                        )}
                    </div>
                )}
            </main>

            {/* Modals */}
            <MenuModal
                isOpen={isMenuModalOpen}
                onClose={() => setIsMenuModalOpen(false)}
                onSubmit={(data) => {
                    if (modalMode === 'create') {
                        createNewMenu(data as any);
                    } else {
                        updateMenu(data as any);
                    }
                    setIsMenuModalOpen(false);
                }}
                menu={editingMenu}
            />

            <CategoryModal
                open={isCategoryModalOpen}
                onClose={() => setIsCategoryModalOpen(false)}
                onConfirm={(data) => {
                    if (modalMode === 'create') {
                        createNewCategory(data);
                    } else {
                        updateCategory({ categoryId: editingCategory.id, data });
                    }
                }}
                category={editingCategory}
            />

            <ItemModal
                open={isItemModalOpen}
                onClose={() => setIsItemModalOpen(false)}
                onConfirm={(data) => {
                    const payload = {
                        name: data.name,
                        description: data.description,
                        price: data.price,
                        allergies: data.allergyIds,
                        images: data.images
                    } as any;

                    if (modalMode === 'create') {
                        createNewItem({ catid: targetCategoryId!, data: payload });
                    } else {
                        updateItem({ categoryId: targetCategoryId!, itemId: editingItem.id, data: payload });
                    }
                }}
                allergies={[]}
                initialData={editingItem}
                businessId={businessId}
                availableItems={[]}
            />

            <Dialog open={movingItem != null} onOpenChange={(open) => !open && setMovingItem(null)}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Info className="h-5 w-5 text-primary" />
                            Move to Category
                        </DialogTitle>
                        <DialogDescription>
                            Select the target category where you want to move this item.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-2 py-4 max-h-[60vh] overflow-y-auto pr-2">
                        {categories.map(cat => (
                            <Button
                                key={cat.id}
                                variant="outline"
                                className={`w-full justify-start h-12 transition-all hover:bg-primary hover:text-primary-foreground ${movingItem?.currentCatId === cat.id ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
                                disabled={movingItem?.currentCatId === cat.id}
                                onClick={() => handleMoveItemToCategory(cat.id)}
                            >
                                <LayoutGrid className="h-4 w-4 mr-2" />
                                {cat.name}
                                {movingItem?.currentCatId === cat.id && (
                                    <span className="ml-auto text-xs italic opacity-70">(Current)</span>
                                )}
                            </Button>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
