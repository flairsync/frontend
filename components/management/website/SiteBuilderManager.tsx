import React, { useEffect, useState } from "react";
import { usePageContext } from "vike-react/usePageContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, Eye, EyeOff, Globe, Pencil, Plus, Trash2 } from "lucide-react";
import { usePermissions } from "@/features/auth/usePermissions";
import { useSitePages, useSitePage } from "@/features/site-builder/useSiteBuilder";
import { ConfirmAction } from "@/components/shared/ConfirmAction";
import SiteBuilderDesigner from "@/features/site-builder/components/SiteBuilderDesigner";
import SiteBuilderPreview from "@/features/site-builder/components/SiteBuilderPreview";
import { SitePageContent } from "@/features/site-builder/types";

const SLUG_REGEX = /^[a-z0-9-]+$/;

/**
 * Owner + staff share the same website builder surface — access is gated purely by
 * the WEBSITE permission (read/update), so there's no owner-only vs. staff-only
 * behavior to fork here. Mounted by both pages/manage/@id/owner/website and
 * pages/manage/@id/staff/website.
 */
const SiteBuilderManager: React.FC = () => {
    const { routeParams } = usePageContext();
    const businessId = routeParams.id;

    const { hasPermission, isLoading: loadingPermissions } = usePermissions(businessId);
    const canRead = hasPermission("WEBSITE", "read");
    const canUpdate = hasPermission("WEBSITE", "update");

    const {
        pages,
        fetchingPages,
        createPage,
        isCreatingPage,
        deletePage,
        publishPage,
        unpublishPage,
    } = useSitePages(businessId);

    const [editingPageId, setEditingPageId] = useState<string | null>(null);
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [newPageForm, setNewPageForm] = useState({ slug: "", title: "" });

    const { page, fetchingPage, saveDraft, isSavingDraft } = useSitePage(businessId, editingPageId || undefined);
    const [content, setContent] = useState<SitePageContent>({ sections: [] });
    const [previewOpen, setPreviewOpen] = useState(false);

    useEffect(() => {
        if (page) setContent(page.draftContent || { sections: [] });
    }, [page?.id]);

    const handleCreatePage = () => {
        if (!SLUG_REGEX.test(newPageForm.slug) || !newPageForm.title.trim()) return;
        createPage(newPageForm);
        setCreateModalOpen(false);
        setNewPageForm({ slug: "", title: "" });
    };

    if (loadingPermissions) {
        return <div className="p-8 text-muted-foreground">Loading...</div>;
    }

    if (!canRead) {
        return (
            <div className="p-8 text-center text-muted-foreground">
                You don't have permission to view the website builder.
            </div>
        );
    }

    if (editingPageId) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" onClick={() => setEditingPageId(null)}>
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight">{page?.title || "Loading..."}</h1>
                            <p className="text-xs text-muted-foreground">/{page?.slug}</p>
                        </div>
                        {page?.isPublished && <Badge>Published</Badge>}
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setPreviewOpen(true)}>
                            <Eye className="w-4 h-4 mr-1" /> Preview
                        </Button>
                        <Button
                            variant="outline"
                            disabled={!canUpdate || isSavingDraft}
                            onClick={() => saveDraft(content)}
                        >
                            Save Draft
                        </Button>
                        {page?.isPublished ? (
                            <Button variant="outline" disabled={!canUpdate} onClick={() => unpublishPage(page.id)}>
                                <EyeOff className="w-4 h-4 mr-1" /> Unpublish
                            </Button>
                        ) : (
                            <Button disabled={!canUpdate} onClick={() => page && publishPage(page.id)}>
                                <Globe className="w-4 h-4 mr-1" /> Publish
                            </Button>
                        )}
                    </div>
                </div>

                <Separator />

                {fetchingPage ? (
                    <div className="text-muted-foreground">Loading page...</div>
                ) : (
                    <SiteBuilderDesigner content={content} onContentChange={setContent} />
                )}

                <SiteBuilderPreview
                    open={previewOpen}
                    onClose={() => setPreviewOpen(false)}
                    businessId={businessId}
                    content={content}
                    pageTitle={page?.title}
                />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Website</h1>
                <Button disabled={!canUpdate} onClick={() => setCreateModalOpen(true)} className="gap-2">
                    <Plus className="w-4 h-4" /> New Page
                </Button>
            </div>

            <Separator />

            {fetchingPages ? (
                <div className="text-muted-foreground">Loading pages...</div>
            ) : !pages || pages.length === 0 ? (
                <div className="py-16 text-center text-muted-foreground border border-dashed border-border rounded-xl">
                    No pages yet. Create your first page to start building your website.
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {pages.map((p) => (
                        <Card key={p.id} className="rounded-xl">
                            <CardHeader>
                                <div className="flex items-start justify-between gap-2">
                                    <CardTitle className="text-base">{p.title}</CardTitle>
                                    {p.isPublished ? <Badge>Published</Badge> : <Badge variant="secondary">Draft</Badge>}
                                </div>
                                <p className="text-xs text-muted-foreground">/{p.slug}</p>
                            </CardHeader>
                            <CardContent className="flex justify-end gap-2">
                                <Button size="icon" variant="ghost" onClick={() => setEditingPageId(p.id)}>
                                    <Pencil className="w-4 h-4" />
                                </Button>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    disabled={!canUpdate}
                                    onClick={() => (p.isPublished ? unpublishPage(p.id) : publishPage(p.id))}
                                >
                                    {p.isPublished ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </Button>
                                <ConfirmAction onConfirm={() => deletePage(p.id)}>
                                    <Button size="icon" variant="ghost" className="text-destructive" disabled={!canUpdate}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </ConfirmAction>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>New Page</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Title</Label>
                            <Input
                                value={newPageForm.title}
                                onChange={(e) => setNewPageForm({ ...newPageForm, title: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Slug</Label>
                            <Input
                                value={newPageForm.slug}
                                onChange={(e) => setNewPageForm({ ...newPageForm, slug: e.target.value.toLowerCase() })}
                                placeholder="home"
                            />
                            {newPageForm.slug && !SLUG_REGEX.test(newPageForm.slug) && (
                                <p className="text-xs text-destructive">Lowercase letters, numbers and hyphens only.</p>
                            )}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCreateModalOpen(false)}>Cancel</Button>
                        <Button
                            disabled={isCreatingPage || !SLUG_REGEX.test(newPageForm.slug) || !newPageForm.title.trim()}
                            onClick={handleCreatePage}
                        >
                            Create
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default SiteBuilderManager;
