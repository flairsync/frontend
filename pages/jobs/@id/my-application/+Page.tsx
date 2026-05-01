import React, { useRef, useState } from "react";
import { usePageContext } from "vike-react/usePageContext";
import { format } from "date-fns";
import {
  ArrowLeft,
  Briefcase,
  FileText,
  Link,
  ExternalLink,
  Upload,
  X,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useMyApplicationDetail } from "@/features/jobs/useMyApplications";
import {
  APPLICATION_STATUS_COLORS,
  APPLICATION_STATUS_LABELS,
  JOB_CATEGORY_LABELS,
  JOB_TYPE_LABELS,
} from "@/models/Job";
import { ProApplicationTimeline } from "@/components/jobs/ApplicationTimeline";
import PublicFeedHeader from "@/components/feed/PublicFeedHeader";
import WebsiteFooter from "@/components/shared/WebsiteFooter";
import { cn } from "@/lib/utils";

const STATUS_BADGE_CLASSES: Record<string, string> = {
  gray: "bg-zinc-100 text-zinc-700",
  blue: "bg-blue-100 text-blue-700",
  yellow: "bg-yellow-100 text-yellow-700",
  green: "bg-green-100 text-green-700",
  red: "bg-red-100 text-red-700",
};

type ResumeEditMode = "none" | "url" | "file";

const MyApplicationDetailPage = () => {
  const { routeParams } = usePageContext() as any;
  const jobId = routeParams.id;

  const {
    application,
    loadingApplication,
    isError,
    uploadResumeFile,
    uploadingResume,
    setResumeUrl,
    settingResumeUrl,
  } = useMyApplicationDetail(jobId);

  const [resumeEditMode, setResumeEditMode] = useState<ResumeEditMode>("none");
  const [urlInput, setUrlInput] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (file && file.type !== "application/pdf") return;
    setSelectedFile(file);
  };

  const handleSaveUrl = () => {
    if (!urlInput.trim()) return;
    setResumeUrl(urlInput.trim(), {
      onSuccess: () => {
        setResumeEditMode("none");
        setUrlInput("");
      },
    });
  };

  const handleSaveFile = () => {
    if (!selectedFile) return;
    uploadResumeFile(selectedFile, {
      onSuccess: () => {
        setResumeEditMode("none");
        setSelectedFile(null);
      },
    });
  };

  const cancelEdit = () => {
    setResumeEditMode("none");
    setUrlInput("");
    setSelectedFile(null);
  };

  if (loadingApplication) {
    return (
      <div className="min-h-screen bg-background">
        <PublicFeedHeader />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
        <WebsiteFooter />
      </div>
    );
  }

  if (isError || !application) {
    return (
      <div className="min-h-screen bg-background">
        <PublicFeedHeader />
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
          <Briefcase className="h-10 w-10 text-muted-foreground/40" />
          <h1 className="text-xl font-bold">Application not found</h1>
          <p className="text-muted-foreground text-sm max-w-sm">
            We couldn't find this application. It may have been removed.
          </p>
          <a href="/jobs/my-applications" className="text-primary hover:underline text-sm flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" />
            Back to my applications
          </a>
        </div>
        <WebsiteFooter />
      </div>
    );
  }

  const job = application.job;
  const colorKey = APPLICATION_STATUS_COLORS[application.status];
  const badgeClass = STATUS_BADGE_CLASSES[colorKey] ?? STATUS_BADGE_CLASSES.gray;
  const isBusy = uploadingResume || settingResumeUrl;

  return (
    <div className="min-h-screen bg-background">
      <PublicFeedHeader />

      <main className="pt-20 pb-20">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <a
            href="/jobs/my-applications"
            className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            My Applications
          </a>

          <div className="flex flex-col gap-6">
            {/* Job header card */}
            <div className="bg-card rounded-xl border border-border p-5">
              <div className="flex items-start gap-4">
                <Avatar className="h-12 w-12 border border-border shrink-0">
                  <AvatarImage src={job?.business?.logo} alt={job?.business?.name} />
                  <AvatarFallback className="bg-primary/10 text-primary font-bold">
                    {job?.business?.name?.charAt(0)?.toUpperCase() ?? "?"}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground">{job?.business?.name}</p>
                  <h1 className="text-xl font-bold leading-snug">{job?.title ?? "Job position"}</h1>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {job?.type && <Badge variant="secondary" className="text-xs">{JOB_TYPE_LABELS[job.type]}</Badge>}
                    {job?.category && <Badge variant="outline" className="text-xs">{JOB_CATEGORY_LABELS[job.category]}</Badge>}
                  </div>
                </div>

                <span className={cn("text-xs font-medium px-2.5 py-1 rounded-full shrink-0", badgeClass)}>
                  {APPLICATION_STATUS_LABELS[application.status]}
                </span>
              </div>

              <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                <span>Applied on {format(new Date(application.createdAt), "MMM d, yyyy")}</span>
                {job?.slug && (
                  <a
                    href={`/jobs/${job.slug}`}
                    className="flex items-center gap-1 text-primary hover:underline"
                  >
                    View job <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>

            {/* Resume section */}
            <div className="bg-card rounded-xl border border-border p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold">Resume</h2>
                {resumeEditMode === "none" && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs gap-1"
                      onClick={() => setResumeEditMode("url")}
                    >
                      <Link className="h-3 w-3" /> Paste link
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs gap-1"
                      onClick={() => setResumeEditMode("file")}
                    >
                      <Upload className="h-3 w-3" /> Upload PDF
                    </Button>
                  </div>
                )}
              </div>

              {application.resumeUrl ? (
                <a
                  href={application.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  {application.resumeType === "file" ? (
                    <FileText className="h-4 w-4" />
                  ) : (
                    <Link className="h-4 w-4" />
                  )}
                  View current resume
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              ) : (
                resumeEditMode === "none" && (
                  <p className="text-sm text-muted-foreground">No resume added yet.</p>
                )
              )}

              {resumeEditMode === "url" && (
                <div className="flex flex-col gap-2 mt-2">
                  <Input
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://linkedin.com/in/your-profile"
                    className="h-8 text-sm"
                    autoFocus
                    disabled={isBusy}
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleSaveUrl} disabled={isBusy || !urlInput.trim()}>
                      {settingResumeUrl ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Save"}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={cancelEdit} disabled={isBusy}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {resumeEditMode === "file" && (
                <div className="flex flex-col gap-2 mt-2">
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isBusy}
                    >
                      Choose PDF
                    </Button>
                    {selectedFile ? (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <FileText className="h-3.5 w-3.5 text-primary" />
                        <span className="truncate max-w-[180px]">{selectedFile.name}</span>
                        <button onClick={() => setSelectedFile(null)} className="hover:text-foreground">
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">PDF only, max 5 MB</span>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="application/pdf"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleSaveFile} disabled={isBusy || !selectedFile}>
                      {uploadingResume ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Upload"}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={cancelEdit} disabled={isBusy}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Cover letter */}
            {application.coverLetter && (
              <div className="bg-card rounded-xl border border-border p-5">
                <h2 className="text-sm font-semibold mb-3">Cover Letter</h2>
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{application.coverLetter}</p>
              </div>
            )}

            {/* Timeline */}
            {application.events && application.events.length > 0 && (
              <div className="bg-card rounded-xl border border-border p-5">
                <h2 className="text-sm font-semibold mb-4">Application Timeline</h2>
                <ProApplicationTimeline
                  events={application.events}
                  currentStatus={application.status}
                />
              </div>
            )}
          </div>
        </div>
      </main>

      <WebsiteFooter />
    </div>
  );
};

export default MyApplicationDetailPage;
