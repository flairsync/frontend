import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  categoryRuleService,
  type KitchenStation,
  type CategoryRule,
} from "@/features/station/service";
import { useBusinessMenus } from "@/features/business/menu/useBusinessMenus";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowRightLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

// ─── Category Routing Panel ───────────────────────────────────────────────────

interface CategoryRoutingPanelProps {
  businessId: string;
  kitchenStations: KitchenStation[];
}

export function CategoryRoutingPanel({ businessId, kitchenStations }: CategoryRoutingPanelProps) {
  const qc = useQueryClient();
  const { businessAllCategories } = useBusinessMenus(businessId);

  const { data: rules = [], isLoading: rulesLoading } = useQuery({
    queryKey: ["category-rules", businessId],
    queryFn: () => categoryRuleService.list(businessId).then((r) => r.data.data),
  });

  const { mutate: assignRule, isPending: isAssigning } = useMutation({
    mutationFn: ({ categoryId, kitchenStationId }: { categoryId: string; kitchenStationId: string }) =>
      categoryRuleService.upsert(businessId, categoryId, kitchenStationId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["category-rules", businessId] });
    },
    onError: () => toast.error("Failed to assign category rule."),
  });

  const { mutate: removeRule } = useMutation({
    mutationFn: (ruleId: string) => categoryRuleService.remove(businessId, ruleId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["category-rules", businessId] });
    },
    onError: () => toast.error("Failed to remove category rule."),
  });

  const ruleMap = useMemo(
    () => new Map((rules ?? []).map((r: CategoryRule) => [r.categoryId, r])),
    [rules],
  );

  const categories = businessAllCategories ?? [];
  const loading = rulesLoading || !businessAllCategories;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <ArrowRightLeft className="w-4 h-4 text-primary" />
          Category Routing
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Automatically route order items to a kitchen station based on their menu category.
        </p>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-6 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground text-sm border border-dashed rounded-xl">
            No menu categories found. Add categories to your menus first.
          </div>
        ) : (
          <div className="divide-y">
            {categories.map((cat) => {
              const rule = ruleMap.get(cat.id);
              return (
                <div key={cat.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <p className="flex-1 text-sm font-medium truncate">{cat.name}</p>
                  <Select
                    value={rule?.kitchenStationId ?? "none"}
                    onValueChange={(v) => {
                      if (v === "none") {
                        if (rule) removeRule(rule.id);
                      } else {
                        assignRule({ categoryId: cat.id, kitchenStationId: v });
                      }
                    }}
                    disabled={isAssigning}
                  >
                    <SelectTrigger className="h-8 w-48 text-xs">
                      <SelectValue placeholder="Not mapped" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">
                        <span className="text-muted-foreground">Not mapped</span>
                      </SelectItem>
                      {kitchenStations.map((ks) => (
                        <SelectItem key={ks.id} value={ks.id}>
                          {ks.name}
                          {!ks.active && (
                            <span className="ml-1 text-muted-foreground">(inactive)</span>
                          )}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
