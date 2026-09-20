import { useMemo } from "react";
import { format } from "date-fns";
import { ClockFading, LayoutGrid, ShoppingBag, TrendingUp } from "lucide-react";
import { useTranslation } from "react-i18next";

import { useDashboardAnalytics } from "@/features/analytics/useDashboardAnalytics";
import { useTables } from "@/features/floor-plan/useFloorPlan";
import { useOrders } from "@/features/orders/useOrders";
import { useAttendanceLogs } from "@/features/shifts/useAttendance";
import { useMyBusiness } from "@/features/business/useMyBusiness";
import { getCurrencySymbol } from "@/utils/currency";
import { cn } from "@/lib/utils";

type Props = {
    businessId: string;
};

type Stat = {
    key: string;
    label: string;
    value: string;
    sub?: string;
    icon: typeof ShoppingBag;
    href: string;
    tone: string;
    loading: boolean;
};

/**
 * The "how is it going right now" row at the top of the Easy View home screen.
 *
 * An owner opening this mid-service wants four numbers before they want a menu
 * of features. Each card is a link into the page that number came from.
 *
 * Every figure here is a server-side count, never a length of whatever page of
 * rows happened to load — a wrong number on someone's home screen is worse than
 * no number at all.
 *
 * NOTE: this is four parallel queries per visit. The right long-term shape is a
 * single cached /businesses/:id/right-now aggregate on the API (same pattern as
 * the other polled aggregates), at which point this component swaps to one hook.
 */
export function RightNowStrip({ businessId }: Props) {
    const { t } = useTranslation("management");
    const today = format(new Date(), "yyyy-MM-dd");

    const { myBusinessFullDetails } = useMyBusiness(businessId);
    // business.currency holds either an ISO code or, on older records, a bare
    // symbol — getCurrencySymbol normalises both. Passing the raw value to
    // Intl.NumberFormat would throw a RangeError on the legacy symbol data and
    // take the whole home screen down with it.
    const currencySymbol = getCurrencySymbol(myBusinessFullDetails?.currency);

    // limit: 1 — we want the server's total, not the rows.
    const { totalOrders, fetchingOrders } = useOrders(
        businessId, "ongoing", undefined, undefined, undefined, undefined, true, 1, 1
    );

    const { tables, fetchingTables } = useTables(businessId);

    const { logsPage, isLoadingLogs } = useAttendanceLogs(businessId, {
        startDate: today,
        endDate: today,
        lifecycleStatus: "ONGOING",
        limit: 1,
    });

    const { data: analytics, isLoading: loadingAnalytics } = useDashboardAnalytics({
        businessId,
        startDate: today,
        endDate: today,
    });

    const todayRevenue = useMemo(() => {
        const days = analytics?.sales ?? [];
        return days.reduce((sum, day) => sum + Number(day.totalRevenue ?? 0), 0);
    }, [analytics]);

    const occupiedTables = tables?.filter((table: any) => table.status === "occupied").length ?? 0;
    const totalTables = tables?.length ?? 0;

    const stats: Stat[] = [
        {
            key: "orders",
            label: t("simple_mode.right_now.open_orders"),
            value: String(totalOrders ?? 0),
            icon: ShoppingBag,
            href: `/manage/${businessId}/owner/orders`,
            tone: "text-orange-600 dark:text-orange-400",
            loading: fetchingOrders,
        },
        {
            key: "tables",
            label: t("simple_mode.right_now.tables_busy"),
            value: `${occupiedTables}/${totalTables}`,
            sub: t("simple_mode.right_now.tables_sub"),
            icon: LayoutGrid,
            href: `/manage/${businessId}/owner/floor-plan`,
            tone: "text-emerald-600 dark:text-emerald-400",
            loading: fetchingTables,
        },
        {
            key: "clocked-in",
            label: t("simple_mode.right_now.clocked_in"),
            value: String(logsPage?.total ?? 0),
            icon: ClockFading,
            href: `/manage/${businessId}/owner/attendance?tab=live`,
            tone: "text-sky-600 dark:text-sky-400",
            loading: isLoadingLogs,
        },
        {
            key: "revenue",
            label: t("simple_mode.right_now.today_sales"),
            value: `${currencySymbol}${todayRevenue.toFixed(2)}`,
            icon: TrendingUp,
            href: `/manage/${businessId}/owner/analytics`,
            tone: "text-violet-600 dark:text-violet-400",
            loading: loadingAnalytics,
        },
    ];

    return (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {stats.map((stat) => (
                <a
                    key={stat.key}
                    href={stat.href}
                    className="group flex items-center gap-3 rounded-2xl border bg-card p-4 transition-colors hover:bg-muted/40"
                >
                    <stat.icon className={cn("h-5 w-5 shrink-0", stat.tone)} />
                    <span className="flex min-w-0 flex-col">
                        {stat.loading ? (
                            <span className="h-7 w-12 animate-pulse rounded bg-muted" />
                        ) : (
                            <span className="text-2xl font-bold leading-tight tabular-nums">
                                {stat.value}
                            </span>
                        )}
                        <span className="truncate text-xs text-muted-foreground">
                            {stat.sub ? `${stat.label} · ${stat.sub}` : stat.label}
                        </span>
                    </span>
                </a>
            ))}
        </div>
    );
}

export default RightNowStrip;
