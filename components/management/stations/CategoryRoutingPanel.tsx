import { useMemo } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation("management");
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
    onError: () => toast.error(t("stations_page.category_routing.assign_failed_toast")),
  });

  const { mutate: removeRule } = useMutation({
    mutationFn: (ruleId: string) => categoryRuleService.remove(businessId, ruleId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["category-rules", businessId] });
    },
    onError: () => toast.error(t("stations_page.category_routing.remove_failed_toast")),
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
          {t("stations_page.category_routing.title")}
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          {t("stations_page.category_routing.description")}
        </p>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-6 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground text-sm border border-dashed rounded-xl">
            {t("stations_page.category_routing.empty")}
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
                      <SelectValue placeholder={t("stations_page.category_routing.not_mapped")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">
                        <span className="text-muted-foreground">{t("stations_page.category_routing.not_mapped")}</span>
                      </SelectItem>
                      {kitchenStations.map((ks) => (
                        <SelectItem key={ks.id} value={ks.id}>
                          {ks.name}
                          {!ks.active && (
                            <span className="ml-1 text-muted-foreground">{t("station_card.inactive_suffix")}</span>
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
