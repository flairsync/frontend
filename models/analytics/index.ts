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

export interface DashboardAnalyticsData {
    sales: DailySalesMetric[];
    topProducts: TopProductMetric[];
    productTotals: ProductTotalsMetric;
    hourlyVisitors: HourlyVisitorMetric[];
    feedback: DailyFeedbackMetric[];
    // Present only when the request opted in via comparePreviousPeriod — folded into
    // this same response so the KPI cards' "vs previous period" deltas don't need a
    // second dashboard round trip.
    previousPeriod?: {
        sales: DailySalesMetric[];
        productTotals: ProductTotalsMetric;
    };
}

export interface ApiResponse<T = any> {
    success: boolean;
    code: string;
    message: string;
    data: T;
}

export type DashboardAnalyticsResponse = ApiResponse<DashboardAnalyticsData>;
