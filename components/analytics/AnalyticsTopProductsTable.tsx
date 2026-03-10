import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TopProductMetric } from "@/models/analytics";

interface AnalyticsTopProductsTableProps {
    topProducts: TopProductMetric[];
}

export const AnalyticsTopProductsTable: React.FC<AnalyticsTopProductsTableProps> = ({ topProducts }) => {
    return (
        <Card className="shadow-sm">
            <CardHeader>
                <CardTitle>Top Selling Products</CardTitle>
                <CardDescription>Highest performing menu items by revenue</CardDescription>
            </CardHeader>
            <CardContent>
                {topProducts.length === 0 ? (
                    <div className="py-8 text-center text-zinc-500">
                        No product data available for this period.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-zinc-700 uppercase bg-zinc-50 dark:bg-zinc-800 dark:text-zinc-400">
                                <tr>
                                    <th className="px-6 py-3 rounded-tl-lg">Item Name</th>
                                    <th className="px-6 py-3">Quantity Sold</th>
                                    <th className="px-6 py-3 rounded-tr-lg text-right">Revenue Generated</th>
                                </tr>
                            </thead>
                            <tbody>
                                {topProducts.map((product, index) => (
                                    <tr
                                        key={product.menuItemId || index}
                                        className="bg-white border-b dark:bg-zinc-950 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                                    >
                                        <td className="px-6 py-4 font-medium text-zinc-900 whitespace-nowrap dark:text-white">
                                            {product.name}
                                        </td>
                                        <td className="px-6 py-4">
                                            {Number(product.totalQuantity)}
                                        </td>
                                        <td className="px-6 py-4 text-right font-medium text-primary">
                                            ${Number(product.totalRevenue).toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
