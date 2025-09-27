import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, Search } from "lucide-react";

// Types
interface InventoryItem {
    id: number;
    name: string;
    quantity: number;
    unit: string;
    updatedAt: string;
}

const BusinessOwnerInventoryManagement: React.FC = () => {
    const [inventory, setInventory] = useState<InventoryItem[]>([
        { id: 1, name: "Coffee Beans", quantity: 25, unit: "kg", updatedAt: "2025-09-25" },
        { id: 2, name: "Milk", quantity: 40, unit: "liters", updatedAt: "2025-09-26" },
        { id: 3, name: "Croissants", quantity: 120, unit: "count", updatedAt: "2025-09-26" },
    ]);

    const [search, setSearch] = useState("");
    const [open, setOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
    const [formData, setFormData] = useState({ name: "", quantity: 0, unit: "count" });

    const handleSave = () => {
        if (editingItem) {
            setInventory((prev) =>
                prev.map((item) =>
                    item.id === editingItem.id ? { ...editingItem, ...formData, updatedAt: new Date().toISOString().split("T")[0] } : item
                )
            );
        } else {
            const newItem: InventoryItem = {
                id: Date.now(),
                name: formData.name,
                quantity: formData.quantity,
                unit: formData.unit,
                updatedAt: new Date().toISOString().split("T")[0],
            };
            setInventory((prev) => [...prev, newItem]);
        }
        setOpen(false);
        setEditingItem(null);
        setFormData({ name: "", quantity: 0, unit: "count" });
    };

    const handleEdit = (item: InventoryItem) => {
        setEditingItem(item);
        setFormData({ name: item.name, quantity: item.quantity, unit: item.unit });
        setOpen(true);
    };

    const handleDelete = (id: number) => {
        setInventory((prev) => prev.filter((item) => item.id !== id));
    };

    const filteredInventory = inventory.filter((item) => item.name.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="p-6 space-y-6">
            <Card>
                <CardHeader className="flex justify-between items-center">
                    <CardTitle>Inventory Management</CardTitle>
                    <div className="flex space-x-2">
                        <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search items..."
                                className="pl-8"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <Dialog open={open} onOpenChange={setOpen}>
                            <DialogTrigger asChild>
                                <Button className="gap-2">
                                    <Plus className="w-4 h-4" /> Add Item
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>{editingItem ? "Edit Item" : "Add Item"}</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <Input
                                        placeholder="Item name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                    <Input
                                        type="number"
                                        placeholder="Quantity"
                                        value={formData.quantity}
                                        onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                                    />
                                    <Select
                                        value={formData.unit}
                                        onValueChange={(val) => setFormData({ ...formData, unit: val })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select unit" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="kg">Kilograms</SelectItem>
                                            <SelectItem value="grams">Grams</SelectItem>
                                            <SelectItem value="liters">Liters</SelectItem>
                                            <SelectItem value="ml">Milliliters</SelectItem>
                                            <SelectItem value="count">Count</SelectItem>
                                            <SelectItem value="packs">Packs</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button onClick={handleSave}>{editingItem ? "Update" : "Save"}</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Quantity</TableHead>
                                <TableHead>Unit</TableHead>
                                <TableHead>Last Updated</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredInventory.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell>{item.name}</TableCell>
                                    <TableCell>{item.quantity}</TableCell>
                                    <TableCell>{item.unit}</TableCell>
                                    <TableCell>{item.updatedAt}</TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button size="icon" variant="ghost" onClick={() => handleEdit(item)}>
                                            <Pencil className="w-4 h-4" />
                                        </Button>
                                        <Button size="icon" variant="destructive" onClick={() => handleDelete(item.id)}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {filteredInventory.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-gray-500">
                                        No items found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

export default BusinessOwnerInventoryManagement;
