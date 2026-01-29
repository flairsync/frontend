// components/CreateMenuModal.tsx
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Plus, Coffee, Moon, Sun, ForkKnife, IceCream, Beer, Pizza } from "lucide-react";
import { BusinessMenu } from "@/models/business/menu/BusinessMenu";

const allIcons = { Coffee, Moon, Sun, ForkKnife, IceCream, Beer, Pizza };

const daysOfWeek = [
    { value: 0, label: "Sun" },
    { value: 1, label: "Mon" },
    { value: 2, label: "Tue" },
    { value: 3, label: "Wed" },
    { value: 4, label: "Thu" },
    { value: 5, label: "Fri" },
    { value: 6, label: "Sat" },
];

export type MenuPayload = {
    name: string;
    description: string;
    icon: string | null;
    startDate: string | null;
    endDate: string | null;
    startTime: string | null;
    endTime: string | null;
    repeatYearly: boolean;
    repeatDays: number[];
};

type CreateMenuModalProps = {
    onSubmit: (data: MenuPayload) => void;
    isOpen: boolean;
    onClose: () => void;
    menu?: BusinessMenu; // optional for editing
};

export const MenuModal: React.FC<CreateMenuModalProps> = ({ onSubmit, isOpen, onClose, menu }) => {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [icon, setIcon] = useState<string>("Coffee");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [repeatYearly, setRepeatYearly] = useState(false);
    const [repeatDays, setRepeatDays] = useState<number[]>([]);

    // Pre-fill fields when editing
    useEffect(() => {
        if (menu) {
            setName(menu.name || "");
            setDescription(menu.description || "");
            setIcon(menu.icon || "Coffee");
            setStartDate(menu.startDate || "");
            setEndDate(menu.endDate || "");
            setStartTime(menu.startTime || "");
            setEndTime(menu.endTime || "");
            setRepeatYearly(menu.repeatYearly ?? false);
            setRepeatDays(menu.getRepeatDaysAsNumberArray());
        } else {
            // reset for new menu
            setName("");
            setDescription("");
            setIcon("Coffee");
            setStartDate("");
            setEndDate("");
            setStartTime("");
            setEndTime("");
            setRepeatYearly(false);
            setRepeatDays([]);
        }
    }, [menu, isOpen]);

    const toggleDay = (day: number) => {
        setRepeatDays(prev =>
            prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
        );
    };

    const toggleAllDays = () => {
        if (repeatDays.length === 7) setRepeatDays([]);
        else setRepeatDays(daysOfWeek.map(d => d.value));
    };

    const handleSubmit = () => {
        if (!name.trim()) return; // simple validation
        onSubmit({
            name,
            description,
            icon,
            startDate: startDate || null,
            endDate: endDate || null,
            startTime: startTime || null,
            endTime: endTime || null,
            repeatYearly,
            repeatDays,
        });
    };

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(open) => {
                if (!open) onClose();
            }}
        >
            <DialogContent className="sm:max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 rounded-lg">
                <DialogHeader>
                    <DialogTitle>{menu ? "Edit Menu" : "Create New Menu"}</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 mt-2">
                    {/* Name */}
                    <div>
                        <Label>Name</Label>
                        <Input value={name} onChange={e => setName(e.target.value)} placeholder="Menu Name" />
                    </div>

                    {/* Description */}
                    <div>
                        <Label>Description</Label>
                        <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="Optional description" />
                    </div>

                    {/* Icon */}
                    <div>
                        <Label>
                            Icon
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <span className="ml-1 text-zinc-400 cursor-pointer">ℹ️</span>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Pick an icon to represent this menu in the UI.</p>
                                </TooltipContent>
                            </Tooltip>
                        </Label>
                        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mt-1 max-h-40 overflow-y-auto border p-2 rounded-md">
                            {Object.entries(allIcons).map(([key, IconComponent]) => (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => setIcon(key)}
                                    className={`p-2 rounded-md border cursor-pointer hover:bg-indigo-50 dark:hover:bg-zinc-800 ${icon === key
                                        ? "border-indigo-500 bg-indigo-50 dark:bg-zinc-800"
                                        : "border-zinc-300 dark:border-zinc-700"
                                        }`}
                                >
                                    <IconComponent className="h-5 w-5 text-indigo-500" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Active Dates */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <Label>
                                Start Date
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <span className="ml-1 text-zinc-400 cursor-pointer">ℹ️</span>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Leave empty for a menu that is always active.</p>
                                    </TooltipContent>
                                </Tooltip>
                            </Label>
                            <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="mt-1" />
                        </div>

                        <div>
                            <Label>
                                End Date
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <span className="ml-1 text-zinc-400 cursor-pointer">ℹ️</span>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Leave empty for a menu that is always active.</p>
                                    </TooltipContent>
                                </Tooltip>
                            </Label>
                            <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="mt-1" />
                        </div>
                    </div>

                    {/* Active Times */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <Label>
                                Start Time
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <span className="ml-1 text-zinc-400 cursor-pointer">ℹ️</span>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Leave empty for this menu to be active all day.</p>
                                    </TooltipContent>
                                </Tooltip>
                            </Label>
                            <Input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="mt-1" />
                        </div>

                        <div>
                            <Label>
                                End Time
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <span className="ml-1 text-zinc-400 cursor-pointer">ℹ️</span>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Leave empty for this menu to be active all day.</p>
                                    </TooltipContent>
                                </Tooltip>
                            </Label>
                            <Input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="mt-1" />
                        </div>
                    </div>

                    {/* Repeating Settings */}
                    <div>
                        <Label>Repeat</Label>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mt-1">
                            <label className="flex items-center gap-1">
                                <input type="checkbox" checked={repeatYearly} onChange={e => setRepeatYearly(e.target.checked)} />
                                Repeat yearly
                            </label>

                            <Button variant="outline" size="sm" onClick={toggleAllDays}>
                                {repeatDays.length === 7 ? "Unselect all days" : "Select all days"}
                            </Button>
                        </div>

                        <div className="flex flex-wrap gap-2 mt-2">
                            {daysOfWeek.map(day => (
                                <Button
                                    key={day.value}
                                    size="sm"
                                    variant={repeatDays.includes(day.value) ? "default" : "outline"}
                                    onClick={() => toggleDay(day.value)}
                                >
                                    {day.label}
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>

                <DialogFooter className="mt-4">
                    <Button onClick={handleSubmit} className="w-full">
                        {menu ? "Update Menu" : "Create Menu"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
