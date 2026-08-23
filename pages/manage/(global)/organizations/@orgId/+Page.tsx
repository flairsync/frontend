import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { usePageContext } from "vike-react/usePageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Building2, Store, X, TrendingUp, DollarSign, PackageX, MapPinned, Search } from "lucide-react";
import { useOrganizationDetail } from "@/features/organizations/useOrganizationDetail";
import { useOrganizationDashboard } from "@/features/organizations/useOrganizationDashboard";
import { useJoinRequests } from "@/features/join-requests/useJoinRequests";
import { InviteBusinessDialog } from "@/components/management/organizations/InviteBusinessDialog";
import { InviteRegionDialog } from "@/components/management/organizations/InviteRegionDialog";
import { RequestsPanel } from "@/components/management/organizations/RequestsPanel";
import { BranchesMap } from "@/components/management/organizations/BranchesMap";

const formatMoney = (n: number) => `$${(n ?? 0).toFixed(2)}`;

const OrganizationDetailPage = () => {
    const { t } = useTranslation("management");
    const { routeParams } = usePageContext();
    const orgId = routeParams.orgId as string;

    const { organization, businesses, regions, loadingOrganization, refreshOrganization } = useOrganizationDetail(orgId);
    const { unlink, isUnlinking } = useJoinRequests();

    const directBusinesses = businesses.filter((b) => !b.regionId);
    const businessesByRegion = new Map<string, typeof businesses>();
    businesses.forEach((b) => {
        if (!b.regionId) return;
        businessesByRegion.set(b.regionId, [...(businessesByRegion.get(b.regionId) ?? []), b]);
    });

    const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
    const [inviteRegionDialogOpen, setInviteRegionDialogOpen] = useState(false);

    const { start, end } = useMemo(() => {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);
        return {
            start: startDate.toISOString().split("T")[0],
            end: endDate.toISOString().split("T")[0],
        };
    }, []);

    const { dashboard, loadingDashboard } = useOrganizationDashboard(orgId, start, end);

    if (loadingOrganization && !organization) {
        return (
            <div className="p-6 w-full flex flex-col items-center justify-center py-20 gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="text-sm text-muted-foreground font-medium">{t("organization_detail_page.loading")}</p>
            </div>
        );
    }

    return (
        <div className="p-6 w-full space-y-6">
            <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold">{organization?.name}</h1>
                    <p className="text-muted-foreground text-sm">{t("organization_detail_page.subtitle", { count: businesses.length })}</p>
                </div>
            </div>

            <RequestsPanel entityType="ORGANIZATION" entityId={orgId} />

            {/* Rollup totals */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">{t("organization_detail_page.total_sales")}</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatMoney(dashboard?.totals.sales ?? 0)}</div>
                        <p className="text-xs text-muted-foreground">{t("organization_detail_page.orders_count", { count: dashboard?.totals.orderCount ?? 0 })}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">{t("organization_detail_page.labor_cost")}</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatMoney(dashboard?.totals.laborCost ?? 0)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">{t("organization_detail_page.low_stock_alerts")}</CardTitle>
                        <PackageX className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{dashboard?.totals.lowStockCount ?? 0}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Per-branch breakdown */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">{t("organization_detail_page.per_branch_breakdown")}</CardTitle>
                </CardHeader>
                <CardContent>
                    {loadingDashboard ? (
                        <p className="text-sm text-muted-foreground py-6 text-center">{t("organization_detail_page.loading_dashboard")}</p>
                    ) : dashboard && dashboard.businesses.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{t("organization_detail_page.col_branch")}</TableHead>
                                    <TableHead className="text-right">{t("organization_detail_page.col_sales")}</TableHead>
                                    <TableHead className="text-right">{t("organization_detail_page.col_orders")}</TableHead>
                                    <TableHead className="text-right">{t("organization_detail_page.col_labor_cost")}</TableHead>
                                    <TableHead className="text-right">{t("organization_detail_page.col_low_stock")}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {dashboard.businesses.map((row) => (
                                    <TableRow key={row.businessId}>
                                        <TableCell className="font-medium">
                                            <a href={`/manage/${row.businessId}/owner/dashboard`} className="hover:text-primary">
                                                {row.name}
                                            </a>
                                        </TableCell>
                                        <TableCell className="text-right">{formatMoney(row.sales)}</TableCell>
                                        <TableCell className="text-right">{row.orderCount}</TableCell>
                                        <TableCell className="text-right">{formatMoney(row.laborCost)}</TableCell>
                                        <TableCell className="text-right">{row.lowStockCount}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <p className="text-sm text-muted-foreground py-6 text-center">
                            {t("organization_detail_page.empty_breakdown")}
                        </p>
                    )}
                </CardContent>
            </Card>

            {businesses.some((b) => b.location) && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">{t("organization_detail_page.map")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <BranchesMap businesses={businesses} />
                    </CardContent>
                </Card>
            )}

            {/* Regions management */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <MapPinned className="h-4 w-4" /> {t("organization_detail_page.regions")}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Button variant="outline" onClick={() => setInviteRegionDialogOpen(true)}>
                            <Search className="h-4 w-4 mr-1.5" /> {t("organization_detail_page.find_region_to_invite")}
                        </Button>
                        <p className="text-xs text-muted-foreground mt-2">
                            {t("organization_detail_page.link_region_hint")}
                        </p>
                    </div>

                    <div className="space-y-3">
                        {regions.map((region) => {
                            const regionBusinesses = businessesByRegion.get(region.id) ?? [];
                            return (
                                <div key={region.id} className="border border-border rounded-lg p-3">
                                    <div className="flex items-center justify-between">
                                        <a
                                            href={`/manage/regions/${region.id}`}
                                            className="flex items-center gap-2 text-sm font-semibold hover:text-primary"
                                        >
                                            <MapPinned className="h-4 w-4" /> {region.name}
                                        </a>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-muted-foreground hover:text-destructive"
                                            disabled={isUnlinking}
                                            onClick={() =>
                                                unlink({ childType: "REGION", childId: region.id }, { onSettled: () => refreshOrganization() })
                                            }
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <div className="mt-2 pl-6 border-l-2 border-muted space-y-1.5">
                                        {regionBusinesses.length > 0 ? (
                                            regionBusinesses.map((b) => (
                                                <a
                                                    key={b.id}
                                                    href={`/manage/${b.id}/owner/dashboard`}
                                                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
                                                >
                                                    <Store className="h-3.5 w-3.5" />
                                                    {b.name}
                                                    <span className="text-xs">{[b.city, b.state].filter(Boolean).join(", ")}</span>
                                                </a>
                                            ))
                                        ) : (
                                            <p className="text-xs text-muted-foreground">{t("organization_detail_page.no_branches_in_region")}</p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                        {regions.length === 0 && (
                            <p className="text-sm text-muted-foreground flex items-center gap-2 py-2">
                                <MapPinned className="h-4 w-4" /> {t("organization_detail_page.no_regions_linked")}
                            </p>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Direct branches — not part of any region */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">{t("organization_detail_page.branches")}</CardTitle>
                    <p className="text-xs text-muted-foreground">{t("organization_detail_page.branches_subtitle")}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Button variant="outline" onClick={() => setInviteDialogOpen(true)}>
                            <Search className="h-4 w-4 mr-1.5" /> {t("organization_detail_page.find_business_to_invite")}
                        </Button>
                        <p className="text-xs text-muted-foreground mt-2">
                            {t("organization_detail_page.invite_business_hint")}
                        </p>
                    </div>

                    <div className="space-y-2">
                        {directBusinesses.map((b) => (
                            <div key={b.id} className="flex items-center justify-between border border-border rounded-lg p-3">
                                <a href={`/manage/${b.id}/owner/dashboard`} className="flex items-center gap-3 min-w-0 hover:text-primary">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={b.logo || undefined} alt={b.name} />
                                        <AvatarFallback className="bg-blue-50 text-blue-600 font-bold">
                                            {b.name.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="text-sm font-medium">{b.name}</p>
                                        <p className="text-xs text-muted-foreground">{[b.city, b.state].filter(Boolean).join(", ") || "—"}</p>
                                    </div>
                                </a>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-muted-foreground hover:text-destructive"
                                    disabled={isUnlinking}
                                    onClick={() => unlink({ childType: "BUSINESS", childId: b.id }, { onSettled: () => refreshOrganization() })}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                        {directBusinesses.length === 0 && (
                            <p className="text-sm text-muted-foreground flex items-center gap-2 py-2">
                                <Store className="h-4 w-4" /> {t("organization_detail_page.no_direct_branches")}
                            </p>
                        )}
                    </div>
                </CardContent>
            </Card>

            <InviteBusinessDialog
                open={inviteDialogOpen}
                onOpenChange={setInviteDialogOpen}
                parentType="ORGANIZATION"
                parentId={orgId}
                onLinked={refreshOrganization}
            />
            <InviteRegionDialog
                open={inviteRegionDialogOpen}
                onOpenChange={setInviteRegionDialogOpen}
                organizationId={orgId}
                onLinked={refreshOrganization}
            />
        </div>
    );
};

export default OrganizationDetailPage;
