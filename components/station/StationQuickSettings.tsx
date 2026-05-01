import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Settings, Monitor, ChefHat, Building2, Cpu } from "lucide-react";
import { getOrCreateDeviceUuid } from "@/features/station/useStationAuth";
import { cn } from "@/lib/utils";
import type { StationInfo } from "@/models/Station";

interface Props {
    station: StationInfo;
}

export default function StationQuickSettings({ station }: Props) {
    const deviceId = getOrCreateDeviceUuid();
    const StationType = station.type === "kds" ? ChefHat : Monitor;

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10">
                    <Settings className="w-5 h-5" />
                </Button>
            </SheetTrigger>

            <SheetContent side="right" className="w-80 p-0 flex flex-col">
                <SheetHeader className="px-6 pt-6 pb-4 border-b border-border">
                    <SheetTitle className="flex items-center gap-2">
                        <Settings className="w-4 h-4 text-primary" />
                        Station Settings
                    </SheetTitle>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-6">
                    {/* Station identity */}
                    <div className="flex flex-col gap-3">
                        <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                            This Device
                        </Label>
                        <div className="bg-muted/40 rounded-xl border border-border p-4 flex flex-col gap-3">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                                    <StationType className="w-4 h-4 text-primary" />
                                </div>
                                <div className="leading-none">
                                    <p className="text-sm font-bold">{station.name}</p>
                                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5">
                                        {station.type === "kds" ? "Kitchen Display" : "POS Terminal"}
                                    </p>
                                </div>
                            </div>
                            <Separator />
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Building2 className="w-3.5 h-3.5 flex-shrink-0" />
                                <span className="text-xs font-bold">{station.business.name}</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground/60">
                                <Cpu className="w-3.5 h-3.5 flex-shrink-0" />
                                <span className="text-[10px] font-mono">{deviceId.slice(0, 18)}…</span>
                            </div>
                        </div>
                    </div>

                    {/* Mode switcher */}
                    <div className="flex flex-col gap-3">
                        <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                            Switch Mode
                        </Label>
                        <div className="flex flex-col gap-2">
                            <a
                                href="/station/pos"
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-sm font-bold",
                                    station.type === "pos"
                                        ? "border-primary bg-primary/10 text-primary"
                                        : "border-border bg-muted/30 text-muted-foreground hover:text-foreground hover:bg-muted",
                                )}
                            >
                                <Monitor className="w-4 h-4" />
                                POS Terminal
                                {station.type === "pos" && (
                                    <span className="ml-auto text-[9px] font-black uppercase tracking-widest opacity-70">
                                        Active
                                    </span>
                                )}
                            </a>
                            <a
                                href="/station/kds"
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-sm font-bold",
                                    station.type === "kds"
                                        ? "border-amber-500/60 bg-amber-500/10 text-amber-500"
                                        : "border-border bg-muted/30 text-muted-foreground hover:text-foreground hover:bg-muted",
                                )}
                            >
                                <ChefHat className="w-4 h-4" />
                                Kitchen Display (KDS)
                                {station.type === "kds" && (
                                    <span className="ml-auto text-[9px] font-black uppercase tracking-widest opacity-70">
                                        Active
                                    </span>
                                )}
                            </a>
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
