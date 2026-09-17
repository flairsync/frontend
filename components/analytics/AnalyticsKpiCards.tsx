import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DailySalesMetric, DailyFeedbackMetric, ProductTotalsMetric, DashboardKpis } from "@/models/analytics";
import { DollarSign, ShoppingBag, TrendingUp, HandCoins, ArrowUp, ArrowDown, Star, Smile, PiggyBank, Users, Timer, Layers } from "lucide-react";

interface AnalyticsKpiCardsProps {
    sales: DailySalesMetric[];
    previousSales?: DailySalesMetric[];
    feedback?: DailyFeedbackMetric[];
    productTotals?: ProductTotalsMetric;
    previousProductTotals?: ProductTotalsMetric;
    // Server-computed. Only the labor figures are read from here — everything else stays
    // derived locally from `sales`/`productTotals` as before. The split isn't arbitrary:
    // labor cost depends on attendance records and pay rates the client never receives,
    // so it cannot be computed here at all.
    kpis?: DashboardKpis;
    previousKpis?: DashboardKpis;
    currency?: string;
}

// Item-level revenue/cost (not order-level totalRevenue, which includes tax/tips and
// isn't comparable to ingredient cost) — mirrors AnalyticsService.computeKpis on the backend.
function computeMargin(productTotals?: ProductTotalsMetric) {
    const revenue = Number(productTotals?.totalRevenue || 0);
    const cost = Number(productTotals?.totalCost || 0);
    const margin = revenue - cost;
    return { margin, marginPercent: revenue > 0 ? (margin / revenue) * 100 : 0 };
}

function summarizeFeedback(feedback: DailyFeedbackMetric[]) {
    let responseCount = 0;
    let overallRatingSum = 0;
    let npsResponseCount = 0;
    let npsPromoters = 0;
    let npsDetractors = 0;

    feedback.forEach((day) => {
        responseCount += Number(day.responseCount || 0);
        overallRatingSum += Number(day.overallRatingSum || 0);
        npsResponseCount += Number(day.npsResponseCount || 0);
        npsPromoters += Number(day.npsPromoters || 0);
        npsDetractors += Number(day.npsDetractors || 0);
    });

    const avgRating = responseCount > 0 ? overallRatingSum / responseCount : null;
    const nps = npsResponseCount > 0
        ? Math.round(((npsPromoters - npsDetractors) / npsResponseCount) * 100)
        : null;

    return { responseCount, avgRating, nps };
}

function sumTotals(sales: DailySalesMetric[]) {
    let rev = 0;
    let orders = 0;
    let tips = 0;

    sales.forEach((day) => {
        rev += Number(day.totalRevenue || 0);
        orders += Number(day.orderCount || 0);
        tips += Number(day.totalTips || 0);
    });

    return {
        totalRevenue: rev,
        totalOrders: orders,
        aov: orders > 0 ? rev / orders : 0,
        totalTips: tips,
    };
}

// null = no comparable previous data (e.g. previous period had zero activity) — shown as "New" instead of a %.
function percentChange(current: number, previous: number): number | null {
    if (previous <= 0) return current > 0 ? null : 0;
    return ((current - previous) / previous) * 100;
}

const DeltaBadge: React.FC<{ delta: number | null }> = ({ delta }) => {
    if (delta === null) {
        return <span className="text-xs font-medium text-muted-foreground">New</span>;
    }
    if (delta === 0) {
        return <span className="text-xs font-medium text-muted-foreground">No change</span>;
    }
    const isUp = delta > 0;
    const Icon = isUp ? ArrowUp : ArrowDown;
    return (
        <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${isUp ? "text-green-600" : "text-red-600"}`}>
            <Icon className="h-3 w-3" />
            {Math.abs(delta).toFixed(1)}%
        </span>
    );
};

export const AnalyticsKpiCards: React.FC<AnalyticsKpiCardsProps> = ({ sales, previousSales, feedback, productTotals, previousProductTotals, kpis, previousKpis, currency = "$" }) => {
    const { t } = useTranslation("management");
    const current = useMemo(() => sumTotals(sales), [sales]);
    const previous = useMemo(() => (previousSales ? sumTotals(previousSales) : null), [previousSales]);
    const feedbackSummary = useMemo(() => (feedback ? summarizeFeedback(feedback) : null), [feedback]);
    const margin = useMemo(() => computeMargin(productTotals), [productTotals]);
    const previousMargin = useMemo(
        () => (previousProductTotals ? computeMargin(previousProductTotals) : null),
        [previousProductTotals],
    );

    const formatCurrency = (val: number) => `${currency}${val.toFixed(2)}`;

    // Labor is only meaningful once somebody has validated attendance in the period —
    // otherwise every figure is zero and three empty cards just add noise.
    const hasLabor = !!kpis && kpis.laborHours > 0;

    const stats = [
        {
            key: "revenue",
            label: t("analytics.kpi.total_revenue"),
            value: formatCurrency(current.totalRevenue),
            delta: previous ? percentChange(current.totalRevenue, previous.totalRevenue) : undefined,
            icon: DollarSign,
        },
        {
            key: "orders",
            label: t("analytics.kpi.total_orders"),
            value: current.totalOrders.toString(),
            delta: previous ? percentChange(current.totalOrders, previous.totalOrders) : undefined,
            icon: ShoppingBag,
        },
        {
            key: "aov",
            label: t("analytics.kpi.avg_order_value"),
            value: formatCurrency(current.aov),
            delta: previous ? percentChange(current.aov, previous.aov) : undefined,
            icon: TrendingUp,
        },
        {
            key: "tips",
            label: t("analytics.kpi.total_tips"),
            value: formatCurrency(current.totalTips),
            delta: previous ? percentChange(current.totalTips, previous.totalTips) : undefined,
            icon: HandCoins,
        },
        ...(productTotals
            ? [
                {
                    key: "grossMargin",
                    label: t("analytics.kpi.gross_margin"),
                    value: `${formatCurrency(margin.margin)} (${margin.marginPercent.toFixed(1)}%)`,
                    delta: previousMargin ? percentChange(margin.margin, previousMargin.margin) : undefined,
                    icon: PiggyBank,
                },
            ]
            : []),
        ...(hasLabor && kpis
            ? [
                {
                    key: "laborCost",
                    label: t("analytics.kpi.labor_cost"),
                    value: `${formatCurrency(kpis.totalLaborCost)} (${kpis.laborPercent.toFixed(1)}%)`,
                    // Delta tracks the cost, not the percentage: a percentage-point move
                    // expressed as a percentage change reads as nonsense to an owner.
                    delta: previousKpis ? percentChange(kpis.totalLaborCost, previousKpis.totalLaborCost) : undefined,
                    icon: Users,
                },
                {
                    key: "salesPerLaborHour",
                    label: t("analytics.kpi.sales_per_labor_hour"),
                    value: formatCurrency(kpis.salesPerLaborHour),
                    delta: previousKpis ? percentChange(kpis.salesPerLaborHour, previousKpis.salesPerLaborHour) : undefined,
                    icon: Timer,
                },
                {
                    key: "primeCost",
                    label: t("analytics.kpi.prime_cost"),
                    value: `${formatCurrency(kpis.primeCost)} (${kpis.primeCostPercent.toFixed(1)}%)`,
                    delta: previousKpis ? percentChange(kpis.primeCost, previousKpis.primeCost) : undefined,
                    icon: Layers,
                },
            ]
            : []),
        ...(feedbackSummary
            ? [
                {
                    key: "avgRating",
                    label: t("analytics.kpi.avg_rating"),
                    value: feedbackSummary.avgRating !== null ? `${feedbackSummary.avgRating.toFixed(1)} / 5` : "—",
                    delta: undefined,
                    icon: Star,
                },
                {
                    key: "nps",
                    label: t("analytics.kpi.nps_score"),
                    value: feedbackSummary.nps !== null ? String(feedbackSummary.nps) : "—",
                    delta: undefined,
                    icon: Smile,
                },
            ]
            : []),
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                    <Card key={stat.key} className="p-4 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                {stat.label}
                            </CardTitle>
                            <Icon className="h-4 w-4 text-primary" />
                        </CardHeader>
                        <CardContent className="flex items-end justify-between gap-2">
                            <div className="text-2xl font-bold text-foreground">
                                {stat.value}
                            </div>
                            {stat.delta !== undefined && (
                                <div className="pb-0.5" title="vs previous period">
                                    <DeltaBadge delta={stat.delta} />
                                </div>
                            )}
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
};
