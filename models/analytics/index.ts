export interface DailySalesMetric {
    id: string;
    businessId: string;
    date: string; // YYYY-MM-DD
    totalRevenue: string | number; // Note: TypeORM decimals often return as strings
    totalTax: string | number;
    totalTips: string | number;
    orderCount: number;
    takeawayCount: number;
    dineInCount: number;
    deliveryCount: number;
}

export interface TopProductMetric {
    menuItemId: string;
    name: string;
    totalQuantity: string | number;
    totalRevenue: string | number;
    totalCost: string | number;
}

export interface ProductTotalsMetric {
    totalRevenue: string | number;
    totalCost: string | number;
}

export interface HourlyVisitorMetric {
    hour: number; // 0-23
    visitorCount: string | number;
    reservationCount: string | number;
    orderCount: string | number;
}

export interface DailyFeedbackMetric {
    id: string;
    businessId: string;
    date: string; // YYYY-MM-DD
    responseCount: number;
    overallRatingSum: number;
    foodRatingSum: number;
    foodRatingCount: number;
    serviceRatingSum: number;
    serviceRatingCount: number;
    ambianceRatingSum: number;
    ambianceRatingCount: number;
    valueRatingSum: number;
    valueRatingCount: number;
    npsResponseCount: number;
    npsPromoters: number;
    npsPassives: number;
    npsDetractors: number;
}

export interface LaborEmployeeBreakdown {
    employmentId: string;
    employeeName: string;
    totalHours: number;
    overtimeHours: number;
    totalPay: number;
    shareOfLaborPercent: number;
}

// Period totals, not a daily series: the backend computes overtime by bucketing attendance
// into calendar weeks before allocating it, so there is deliberately no per-day labor figure
// to chart alongside the daily sales line.
export interface LaborSummary {
    totalLaborCost: number;
    regularPay: number;
    overtimePay: number;
    paidLeavePay: number;
    workedHours: number;
    overtimeHours: number;
    paidLeaveHours: number;
    staffCount: number;
    byEmployee: LaborEmployeeBreakdown[];
}

// Computed server-side. The sales-derived figures here duplicate what AnalyticsKpiCards
// already works out locally, but the labor ones cannot be derived on the client at all —
// it never receives attendance or pay-rate data — so those are read straight off this block.
export interface DashboardKpis {
    totalRevenue: number;
    totalOrders: number;
    totalTips: number;
    aov: number;
    totalCost: number;
    grossMargin: number;
    grossMarginPercent: number;
    totalLaborCost: number;
    laborPercent: number;
    laborHours: number;
    overtimeHours: number;
    salesPerLaborHour: number;
    primeCost: number;
    primeCostPercent: number;
}

export interface DashboardAnalyticsData {
    sales: DailySalesMetric[];
    topProducts: TopProductMetric[];
    productTotals: ProductTotalsMetric;
    hourlyVisitors: HourlyVisitorMetric[];
    feedback: DailyFeedbackMetric[];
    labor: LaborSummary;
    kpis: DashboardKpis;
    // Present only when the request opted in via comparePreviousPeriod — folded into
    // this same response so the KPI cards' "vs previous period" deltas don't need a
    // second dashboard round trip.
    previousPeriod?: {
        sales: DailySalesMetric[];
        productTotals: ProductTotalsMetric;
        labor: LaborSummary;
        kpis: DashboardKpis;
    };
}

export interface ApiResponse<T = any> {
    success: boolean;
    code: string;
    message: string;
    data: T;
}

export type DashboardAnalyticsResponse = ApiResponse<DashboardAnalyticsData>;
