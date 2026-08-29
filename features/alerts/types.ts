export type AlertSeverity = "warning" | "critical";

export type AlertCategory = "floor_plan" | "menu";

export interface BusinessAlert {
    key: string;
    category: AlertCategory;
    severity: AlertSeverity;
    title: string;
    message: string;
    ctaLabel: string;
    ctaPath: string;
}
