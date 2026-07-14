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
}

export interface HourlyVisitorMetric {
    hour: number; // 0-23
    visitorCount: string | number;
    reservationCount: string | number;
}

export interface DashboardAnalyticsData {
    sales: DailySalesMetric[];
    topProducts: TopProductMetric[];
    hourlyVisitors: HourlyVisitorMetric[];
}

export interface ApiResponse<T = any> {
    success: boolean;
    code: string;
    message: string;
    data: T;
}

export type DashboardAnalyticsResponse = ApiResponse<DashboardAnalyticsData>;
