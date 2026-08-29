import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { usePageContext } from "vike-react/usePageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MapPinned, Store, X, TrendingUp, DollarSign, PackageX, Building2, Search } from "lucide-react";
import { useRegionDetail } from "@/features/regions/useRegionDetail";
import { useRegionDashboard } from "@/features/regions/useRegionDashboard";
import { useJoinRequests } from "@/features/join-requests/useJoinRequests";
import { InviteBusinessDialog } from "@/components/management/organizations/InviteBusinessDialog";
import { JoinOrganizationDialog } from "@/components/management/organizations/JoinOrganizationDialog";
import { RequestsPanel } from "@/components/management/organizations/RequestsPanel";
import { BranchesMap } from "@/components/management/organizations/BranchesMap";
import { UnlinkBusinessDialog } from "@/components/management/organizations/UnlinkBusinessDialog";

const formatMoney = (n: number) => `$${(n ?? 0).toFixed(2)}`;

const RegionDetailPage = () => {
    const { t } = useTranslation("management");
    const { routeParams } = usePageContext();
    const regionId = routeParams.regionId as string;

    const { region, businesses, organizationName, loadingRegion, refreshRegion } = useRegionDetail(regionId);
    const { unlink, isUnlinking, requestLeave, isRequestingLeave, outgoing } = useJoinRequests();

    const pendingLeaveRequest = outgoing.find(
        (r) => r.childType === "REGION" && r.childId === regionId && r.action === "UNLINK" && r.status === "PENDING",
    );

    const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
    const [joinOrgDialogOpen, setJoinOrgDialogOpen] = useState(false);
    const [unlinkTarget, setUnlinkTarget] = useState<{ id: string; name: string } | null>(null);

    const { start, end } = useMemo(() => {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);
        return {
            start: startDate.toISOString().split("T")[0],
            end: endDate.toISOString().split("T")[0],
        };
    }, []);

    const { dashboard, loadingDashboard } = useRegionDashboard(regionId, start, end);

    if (loadingRegion && !region) {
        return (
            <div className="p-6 w-full flex flex-col items-center justify-center py-20 gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="text-sm text-muted-foreground font-medium">{t("region_detail_page.loading")}</p>
            </div>
        );
    }

    return (
        <div className="p-6 w-full space-y-6">
            <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <MapPinned className="h-5 w-5 text-primary" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold">{region?.name}</h1>
                    <p className="text-muted-foreground text-sm">
                        {t("organization_detail_page.subtitle", { count: businesses.length })}
                    </p>
                </div>
            </div>

            <RequestsPanel entityType="REGION" entityId={regionId} />

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
                            {t("region_detail_page.empty_breakdown")}
                        </p>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">{t("organization_detail_page.branches")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <BranchesMap businesses={businesses} />

                    <div>
                        <Button variant="outline" onClick={() => setInviteDialogOpen(true)}>
                            <Search className="h-4 w-4 mr-1.5" /> {t("organization_detail_page.find_business_to_invite")}
                        </Button>
                        <p className="text-xs text-muted-foreground mt-2">
                            {t("organization_detail_page.invite_business_hint")}
                        </p>
                    </div>

                    <div className="space-y-2">
                        {businesses.map((b) => (
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
                                    onClick={() => setUnlinkTarget({ id: b.id, name: b.name })}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                        {businesses.length === 0 && (
                            <p className="text-sm text-muted-foreground flex items-center gap-2 py-2">
                                <Store className="h-4 w-4" /> {t("organization_detail_page.no_branches_in_region")}
                            </p>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <Building2 className="h-4 w-4" /> {t("region_detail_page.organization")}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {region?.organizationId ? (
                        <div className="flex items-center justify-between border border-border rounded-lg p-3">
                            <div className="flex items-center gap-2">
                                <Badge>{t("settings_page.organization_region.linked")}</Badge>
                                <span className="text-sm text-muted-foreground">{organizationName ?? t("region_detail_page.organization")}</span>
                            </div>
                            {pendingLeaveRequest ? (
                                <Badge variant="outline" className="text-muted-foreground">
                                    {t("settings_page.organization_region.leave_pending")}
                                </Badge>
                            ) : (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-muted-foreground hover:text-destructive"
                                    disabled={isRequestingLeave}
                                    onClick={() =>
                                        requestLeave({ childType: "REGION", childId: regionId }, { onSettled: () => refreshRegion() })
                                    }
                                >
                                    {t("settings_page.organization_region.request_to_leave")}
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div>
                            <Button variant="outline" onClick={() => setJoinOrgDialogOpen(true)}>
                                <Search className="h-4 w-4 mr-1.5" /> {t("region_detail_page.find_organization_to_join")}
                            </Button>
                            <p className="text-xs text-muted-foreground mt-2">
                                {t("region_detail_page.join_organization_hint")}
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            <InviteBusinessDialog
                open={inviteDialogOpen}
                onOpenChange={setInviteDialogOpen}
                parentType="REGION"
                parentId={regionId}
                onLinked={refreshRegion}
            />
            <JoinOrganizationDialog
                open={joinOrgDialogOpen}
                onOpenChange={setJoinOrgDialogOpen}
                regionId={regionId}
                onLinked={refreshRegion}
            />
            <UnlinkBusinessDialog
                open={!!unlinkTarget}
                businessName={unlinkTarget?.name ?? ""}
                isSubmitting={isUnlinking}
                onOpenChange={(open) => !open && setUnlinkTarget(null)}
                onConfirm={(newOwnerEmail) => {
                    if (!unlinkTarget) return;
                    unlink(
                        { childType: "BUSINESS", childId: unlinkTarget.id, newOwnerEmail },
                        { onSuccess: () => setUnlinkTarget(null), onSettled: () => refreshRegion() },
                    );
                }}
            />
        </div>
    );
};

export default RegionDetailPage;
