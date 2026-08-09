import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TopProductMetric } from "@/models/analytics";

interface AnalyticsTopProductsTableProps {
    topProducts: TopProductMetric[];
    currency: string;
}

export const AnalyticsTopProductsTable: React.FC<AnalyticsTopProductsTableProps> = ({ topProducts, currency }) => {
    return (
        <Card className="shadow-sm">
            <CardHeader>
                <CardTitle>Top Selling Products</CardTitle>
                <CardDescription>Highest performing menu items by revenue</CardDescription>
            </CardHeader>
            <CardContent>
                {topProducts.length === 0 ? (
                    <div className="py-8 text-center text-muted-foreground">
                        No product data available for this period.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-muted-foreground uppercase bg-muted">
                                <tr>
                                    <th className="px-6 py-3 rounded-tl-lg">Item Name</th>
                                    <th className="px-6 py-3">Quantity Sold</th>
                                    <th className="px-6 py-3 text-right">Revenue Generated</th>
                                    <th className="px-6 py-3 text-right">Cost</th>
                                    <th className="px-6 py-3 text-right">Margin</th>
                                    <th className="px-6 py-3 rounded-tr-lg text-right">Margin %</th>
                                </tr>
                            </thead>
                            <tbody>
                                {topProducts.map((product, index) => {
                                    const revenue = Number(product.totalRevenue) || 0;
                                    const cost = Number(product.totalCost) || 0;
                                    const margin = revenue - cost;
                                    const marginPercent = revenue > 0 ? (margin / revenue) * 100 : 0;
                                    return (
                                        <tr
                                            key={product.menuItemId || index}
                                            className="bg-card border-b border-border hover:bg-muted"
                                        >
                                            <td className="px-6 py-4 font-medium text-foreground whitespace-nowrap">
                                                {product.name}
                                            </td>
                                            <td className="px-6 py-4">
                                                {Number(product.totalQuantity)}
                                            </td>
                                            <td className="px-6 py-4 text-right font-medium text-primary">
                                                {currency}{revenue.toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 text-right text-muted-foreground">
                                                {currency}{cost.toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 text-right font-medium">
                                                {currency}{margin.toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 text-right font-medium">
                                                {marginPercent.toFixed(1)}%
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
