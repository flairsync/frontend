import React, { useState } from 'react';
import { usePageContext } from 'vike-react/usePageContext';
import { useBusinessManagementItems, useMarketplaceMutations } from '@/features/marketplace/useMarketplace';
import { MarketplaceItem } from '@/models/MarketplaceItem';
import { MarketplaceItemModal } from '@/components/management/marketplace/MarketplaceItemModal';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { ConfirmAction } from '@/components/shared/ConfirmAction';
import { Plus, Pencil, Trash2, Loader2, PackageOpen } from 'lucide-react';

function formatPrice(price: number, currency: string) {
    try {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(price);
    } catch {
        return `${currency} ${price.toFixed(2)}`;
    }
}

function InlineStockEditor({ item, businessId }: { item: MarketplaceItem; businessId: string }) {
    const { updateStock } = useMarketplaceMutations(businessId);
    const [editing, setEditing] = useState(false);
    const [value, setValue] = useState(String(item.stock));

    function commit() {
        const n = parseInt(value);
        if (!isNaN(n) && n >= 0 && n !== item.stock) {
            updateStock.mutate({ id: item.id, stock: n });
        }
        setEditing(false);
    }

    if (!editing) {
        return (
            <button
                className="text-sm font-medium underline-offset-2 hover:underline cursor-pointer"
                onClick={() => { setValue(String(item.stock)); setEditing(true); }}
            >
                {item.stock}
            </button>
        );
    }

    return (
        <Input
            autoFocus
            type="number"
            min="0"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setEditing(false); }}
            className="h-7 w-20 text-xs px-2"
        />
    );
}

const BusinessOwnerMarketplaceManagement: React.FC = () => {
    const { routeParams } = usePageContext();
    const businessId = routeParams.id as string;

    const { data: items = [], isLoading } = useBusinessManagementItems(businessId);
    const { updateItem, deleteItem } = useMarketplaceMutations(businessId);

    const [modalOpen, setModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<MarketplaceItem | null>(null);

    function openCreate() {
        setEditingItem(null);
        setModalOpen(true);
    }

    function openEdit(item: MarketplaceItem) {
        setEditingItem(item);
        setModalOpen(true);
    }

    return (
        <div className="p-6 space-y-6 max-w-6xl">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold">Marketplace</h2>
                    <p className="text-sm text-muted-foreground">Manage your shop items — merch, products, and more.</p>
                </div>
                <Button onClick={openCreate} className="gap-2">
                    <Plus className="w-4 h-4" />
                    New item
                </Button>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
                    <PackageOpen className="w-12 h-12 text-muted-foreground opacity-30" />
                    <p className="text-muted-foreground">No items yet. Create your first item to start selling.</p>
                    <Button onClick={openCreate} variant="outline" className="gap-2">
                        <Plus className="w-4 h-4" /> Create item
                    </Button>
                </div>
            ) : (
                <div className="rounded-xl border border-white/5 overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-secondary/10 hover:bg-secondary/10">
                                <TableHead className="w-14"></TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Stock</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {items.map((item) => (
                                <TableRow key={item.id} className="group">
                                    <TableCell>
                                        {item.images.length > 0 ? (
                                            <img
                                                src={item.images[0]}
                                                alt={item.name}
                                                className="w-10 h-10 rounded-lg object-cover"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 rounded-lg bg-secondary/30 flex items-center justify-center text-lg">
                                                📦
                                            </div>
                                        )}
                                    </TableCell>

                                    <TableCell>
                                        <div className="font-medium text-sm">{item.name}</div>
                                        {item.description && (
                                            <div className="text-[11px] text-muted-foreground line-clamp-1">{item.description}</div>
                                        )}
                                    </TableCell>

                                    <TableCell className="text-sm font-medium">
                                        {formatPrice(item.price, item.currency || 'USD')}
                                    </TableCell>

                                    <TableCell>
                                        <InlineStockEditor item={item} businessId={businessId} />
                                    </TableCell>

                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Switch
                                                checked={item.isActive}
                                                onCheckedChange={(v) =>
                                                    updateItem.mutate({ id: item.id, data: { isActive: v } })
                                                }
                                            />
                                            <Badge
                                                variant={item.isActive ? 'default' : 'secondary'}
                                                className="text-[10px]"
                                            >
                                                {item.isActive ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </div>
                                    </TableCell>

                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => openEdit(item)}
                                            >
                                                <Pencil className="w-3.5 h-3.5" />
                                            </Button>
                                            <ConfirmAction
                                                title="Delete item"
                                                description={`"${item.name}" will be permanently removed.`}
                                                onConfirm={() => deleteItem.mutate(item.id)}
                                            >
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-destructive hover:text-destructive"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </Button>
                                            </ConfirmAction>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}

            <MarketplaceItemModal
                businessId={businessId}
                item={editingItem}
                open={modalOpen}
                onClose={() => setModalOpen(false)}
            />
        </div>
    );
};

export { BusinessOwnerMarketplaceManagement as Page };
