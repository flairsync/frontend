import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  kitchenStationService,
  type KitchenStation,
} from "@/features/station/service";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Pencil, Trash2, UtensilsCrossed, GripVertical, Loader2,
} from "lucide-react";
import { toast } from "sonner";

// ─── Kitchen Station Card ─────────────────────────────────────────────────────

interface KitchenStationCardProps {
  ks: KitchenStation;
  businessId: string;
  onDelete: (ks: KitchenStation) => void;
}

export function KitchenStationCard({ ks, businessId, onDelete }: KitchenStationCardProps) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(ks.name);
  const qc = useQueryClient();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: ks.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const { mutate: save, isPending } = useMutation({
    mutationFn: () => kitchenStationService.update(businessId, ks.id, { name }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["kitchen-stations", businessId] });
      setEditing(false);
      toast.success("Kitchen station renamed.");
    },
    onError: () => toast.error("Failed to rename."),
  });

  const statusColor: Record<KitchenStation["status"], string> = {
    ready: "bg-green-500/10 text-green-600 border-green-500/20",
    getting_ready: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    broken: "bg-destructive/10 text-destructive border-destructive/20",
    offline: "bg-muted text-muted-foreground border-border",
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-3 px-4 py-3 rounded-xl border bg-card hover:bg-accent/30 transition-colors group">
      <button
        className="flex-shrink-0 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground touch-none"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="w-4 h-4" />
      </button>

      <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
        <UtensilsCrossed className="w-4 h-4 text-amber-600" />
      </div>

      <div className="flex-1 min-w-0">
        {editing ? (
          <div className="flex items-center gap-2">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-7 text-sm font-bold flex-1"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") save();
                if (e.key === "Escape") { setEditing(false); setName(ks.name); }
              }}
            />
            <Button size="sm" className="h-7 px-2 text-xs" onClick={() => save()} disabled={isPending}>
              {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : "Save"}
            </Button>
          </div>
        ) : (
          <p className="text-sm font-bold truncate">{ks.name}</p>
        )}
        <Badge
          variant="outline"
          className={`text-[10px] font-bold uppercase tracking-wide mt-0.5 ${statusColor[ks.status]}`}
        >
          {ks.status.replace("_", " ")}
        </Badge>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-foreground"
          onClick={() => setEditing(true)}
        >
          <Pencil className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-destructive/50 hover:text-destructive"
          onClick={() => onDelete(ks)}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}
