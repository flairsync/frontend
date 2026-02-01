import { BusinessMenuCategory } from "@/models/business/menu/BusinessMenuCategory";
import { MenuChanges } from "@/features/business/menu/service";

// =========================
//    Helpers
// ========================= 

export const snapshotCategories = (categories: BusinessMenuCategory[]) => {
    return categories.map((cat, catOrder) => ({
        id: cat.id,
        order: catOrder,
        items: (cat.items ?? []).map((item, itemOrder) => ({
            id: item.id,
            order: itemOrder,
            categoryId: cat.id,
        })),
    }));
};

export const diffCategories = (
    initial: ReturnType<typeof snapshotCategories>,
    current: BusinessMenuCategory[]
): MenuChanges => {
    const changes: MenuChanges = {
        categoryOrderChanges: [],
        itemOrderChanges: [],
        itemParentChanges: [],
    };

    /* ===== CATEGORY ORDER ===== */
    current.forEach((cat, index) => {
        const original = initial.find(c => c.id === cat.id);
        if (original && original.order !== index) {
            changes.categoryOrderChanges.push({ id: cat.id, order: index });
        }
    });

    /* ===== ITEMS ===== */
    current.forEach(cat => {
        cat.items?.forEach((item, index) => {
            const originalCat = initial.find(c =>
                c.items.some(i => i.id === item.id)
            );
            const originalItem = originalCat?.items.find(i => i.id === item.id);

            if (!originalItem || !originalCat) return;

            // Parent change
            if (originalCat.id !== cat.id) {
                changes.itemParentChanges.push({
                    itemId: item.id,
                    fromCategoryId: originalCat.id,
                    toCategoryId: cat.id,
                });
            }

            // Order change (only compare within current category)
            if (
                originalCat.id === cat.id &&
                originalItem.order !== index
            ) {
                changes.itemOrderChanges.push({
                    id: item.id,
                    order: index,
                });
            }

            // If moved category, always send new order
            if (originalCat.id !== cat.id) {
                changes.itemOrderChanges.push({
                    id: item.id,
                    order: index,
                });
            }
        });
    });

    return changes;
};
