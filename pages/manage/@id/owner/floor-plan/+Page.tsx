import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { usePageContext } from "vike-react/usePageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, Layers, Grid2X2 } from "lucide-react";
import { useFloors, useTables } from "@/features/floor-plan/useFloorPlan";
import { FloorPlanDesigner } from "@/features/floor-plan/components/FloorPlanDesigner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { ConfirmAction } from "@/components/shared/ConfirmAction";
import { BatchCreateTableModal } from "@/components/management/floor-plan/BatchCreateTableModal";

const FloorPlanPage: React.FC = () => {
    const { t } = useTranslation();
    const { routeParams } = usePageContext();
    const businessId = routeParams.id;

    const {
        floors,
        fetchingFloors,
        createFloor,
        updateFloor,
        deleteFloor
    } = useFloors(businessId);

    const {
        tables,
        fetchingTables,
        createTable,
        updateTable,
        deleteTable
    } = useTables(businessId);

    // State
    const [floorModalOpen, setFloorModalOpen] = useState(false);
    const [tableModalOpen, setTableModalOpen] = useState(false);
    const [editingFloor, setEditingFloor] = useState<any>(null);
    const [editingTable, setEditingTable] = useState<any>(null);
    const [batchModalOpen, setBatchModalOpen] = useState(false);

    const {
        batchCreateTables,
        isBatchCreatingTables
    } = useTables(businessId);

    const [floorForm, setFloorForm] = useState({ name: "", description: "", order: 0 });
    const [tableForm, setTableForm] = useState({
        name: "",
        capacity: 2,
        floorId: "",
        position: { x: 0, y: 0, shape: "circle" as "circle" | "square" | "rectangle" }
    });

    // Handlers
    const handleOpenCreateFloor = () => {
        setEditingFloor(null);
        setFloorForm({ name: "", description: "", order: floors?.length || 0 });
        setFloorModalOpen(true);
    };

    const handleEditFloor = (floor: any) => {
        setEditingFloor(floor);
        setFloorForm({ name: floor.name, description: floor.description || "", order: floor.order });
        setFloorModalOpen(true);
    };

    const handleSaveFloor = async () => {
        if (editingFloor) {
            updateFloor({ floorId: editingFloor.id, data: floorForm });
        } else {
            createFloor(floorForm);
        }
        setFloorModalOpen(false);
    };

    const handleOpenCreateTable = () => {
        setEditingTable(null);
        setTableForm({
            name: "",
            capacity: 2,
            floorId: floors?.[0]?.id || "",
            position: { x: 0, y: 0, shape: "circle" }
        });
        setTableModalOpen(true);
    };

    const handleEditTable = (table: any) => {
        setEditingTable(table);
        setTableForm({
            name: table.name,
            capacity: table.capacity,
            floorId: table.floorId,
            position: table.position || { x: 0, y: 0, shape: "circle" }
        });
        setTableModalOpen(true);
    };

    const handleSaveTable = async () => {
        if (editingTable) {
            updateTable({ tableId: editingTable.id, data: tableForm });
        } else {
            createTable(tableForm);
        }
        setTableModalOpen(false);
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">{t("floor_plan.title")}</h1>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleOpenCreateFloor} className="gap-2">
                        <Layers className="w-4 h-4" />
                        {t("floor_plan.add_floor")}
                    </Button>
                    <Button onClick={handleOpenCreateTable} className="gap-2">
                        <Grid2X2 className="w-4 h-4" />
                        {t("floor_plan.add_table")}
                    </Button>
                    <Button variant="outline" onClick={() => setBatchModalOpen(true)} className="gap-2">
                        <Grid2X2 className="w-4 h-4" />
                        Batch Create
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="floors" className="w-full">
                <TabsList>
                    <TabsTrigger value="floors">{t("floor_plan.floors")}</TabsTrigger>
                    <TabsTrigger value="tables">{t("floor_plan.tables")}</TabsTrigger>
                    <TabsTrigger value="designer">Designer (Beta)</TabsTrigger>
                </TabsList>

                <TabsContent value="designer" className="pt-4">
                    <FloorPlanDesigner />
                </TabsContent>

                <TabsContent value="floors">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t("floor_plan.floors")}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>{t("inventory_management.table.name")}</TableHead>
                                        <TableHead>{t("inventory_management.form.description")}</TableHead>
                                        <TableHead className="text-right">{t("shared.actions.all")}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {fetchingFloors ? (
                                        <TableRow><TableCell colSpan={3} className="text-center">Loading...</TableCell></TableRow>
                                    ) : floors?.length === 0 ? (
                                        <TableRow><TableCell colSpan={3} className="text-center">No floors found.</TableCell></TableRow>
                                    ) : (
                                        floors?.map((floor: any) => (
                                            <TableRow key={floor.id}>
                                                <TableCell className="font-medium">{floor.name}</TableCell>
                                                <TableCell>{floor.description || "-"}</TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button size="icon" variant="ghost" onClick={() => handleEditFloor(floor)}>
                                                            <Pencil className="w-4 h-4" />
                                                        </Button>
                                                        <ConfirmAction onConfirm={() => deleteFloor(floor.id)}>
                                                            <Button size="icon" variant="ghost" className="text-destructive">
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </ConfirmAction>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="tables">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t("floor_plan.tables")}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Number</TableHead>
                                        <TableHead>{t("inventory_management.table.name")}</TableHead>
                                        <TableHead>{t("floor_plan.capacity")}</TableHead>
                                        <TableHead>{t("floor_plan.title")}</TableHead>
                                        <TableHead className="text-right">{t("shared.actions.all")}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {fetchingTables ? (
                                        <TableRow><TableCell colSpan={5} className="text-center">Loading...</TableCell></TableRow>
                                    ) : tables?.length === 0 ? (
                                        <TableRow><TableCell colSpan={5} className="text-center">No tables found.</TableCell></TableRow>
                                    ) : (
                                        tables?.map((table: any) => (
                                            <TableRow key={table.id}>
                                                <TableCell>{table.number || "-"}</TableCell>
                                                <TableCell className="font-medium">{table.name}</TableCell>
                                                <TableCell>{table.capacity}</TableCell>
                                                <TableCell>{floors?.find((f: any) => f.id === table.floorId)?.name || "-"}</TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button size="icon" variant="ghost" onClick={() => handleEditTable(table)}>
                                                            <Pencil className="w-4 h-4" />
                                                        </Button>
                                                        <ConfirmAction onConfirm={() => deleteTable(table.id)}>
                                                            <Button size="icon" variant="ghost" className="text-destructive">
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </ConfirmAction>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Floor Modal */}
            <Dialog open={floorModalOpen} onOpenChange={setFloorModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingFloor ? t("floor_plan.edit_floor") : t("floor_plan.add_floor")}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>{t("inventory_management.table.name")}</Label>
                            <Input value={floorForm.name} onChange={(e) => setFloorForm({ ...floorForm, name: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label>{t("inventory_management.form.description")}</Label>
                            <Input value={floorForm.description} onChange={(e) => setFloorForm({ ...floorForm, description: e.target.value })} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setFloorModalOpen(false)}>{t("shared.actions.cancel")}</Button>
                        <Button onClick={handleSaveFloor}>{t("shared.actions.save")}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Table Modal */}
            <Dialog open={tableModalOpen} onOpenChange={setTableModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingTable ? t("floor_plan.edit_table") : t("floor_plan.add_table")}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>{t("inventory_management.table.name")}</Label>
                            <Input value={tableForm.name} onChange={(e) => setTableForm({ ...tableForm, name: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label>{t("floor_plan.capacity")}</Label>
                            <Input type="number" value={tableForm.capacity} onChange={(e) => setTableForm({ ...tableForm, capacity: Number(e.target.value) })} />
                        </div>
                        <div className="space-y-2">
                            <Label>{t("floor_plan.title")}</Label>
                            <Select value={tableForm.floorId} onValueChange={(val) => setTableForm({ ...tableForm, floorId: val })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Floor" />
                                </SelectTrigger>
                                <SelectContent>
                                    {floors?.map((f: any) => (
                                        <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>{t("floor_plan.shape")}</Label>
                                <Select value={tableForm.position.shape} onValueChange={(val: any) => setTableForm({ ...tableForm, position: { ...tableForm.position, shape: val } })}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="circle">Circle</SelectItem>
                                        <SelectItem value="square">Square</SelectItem>
                                        <SelectItem value="rectangle">Rectangle</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setTableModalOpen(false)}>{t("shared.actions.cancel")}</Button>
                        <Button onClick={handleSaveTable}>{t("shared.actions.save")}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <BatchCreateTableModal
                isOpen={batchModalOpen}
                onClose={() => setBatchModalOpen(false)}
                floors={floors || []}
                existingTables={tables || []}
                onBatchCreate={batchCreateTables}
                isCreating={isBatchCreatingTables}
            />
        </div>
    );
};

export default FloorPlanPage;
