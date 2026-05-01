import React, { useState } from "react";
import { usePageContext } from "vike-react/usePageContext";
import { format } from "date-fns";
import {
  ArrowLeft,
  Mail,
  FileText,
  Link,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useOwnerApplicationDetail } from "@/features/jobs/useJobs";
import {
  APPLICATION_STATUS_COLORS,
  APPLICATION_STATUS_OWNER_LABELS,
  ApplicationStatus,
} from "@/models/Job";
import { OwnerApplicationTimeline } from "@/components/jobs/ApplicationTimeline";
import { cn } from "@/lib/utils";

const STATUS_BADGE_CLASSES: Record<string, string> = {
  gray: "bg-zinc-100 text-zinc-700",
  blue: "bg-blue-100 text-blue-700",
  yellow: "bg-yellow-100 text-yellow-700",
  green: "bg-green-100 text-green-700",
  red: "bg-red-100 text-red-700",
};

const OwnerApplicationDetailPage = () => {
  const { routeParams } = usePageContext() as any;
  const businessId = routeParams.id;
  const jobId = routeParams.jobId;
  const appId = routeParams.appId;

  const { application, loadingApplication, isError, updateStatus, updatingStatus } =
    useOwnerApplicationDetail(businessId, jobId, appId);

  const [editingNote, setEditingNote] = useState(false);
  const [noteValue, setNoteValue] = useState("");
  const [acceptConfirmOpen, setAcceptConfirmOpen] = useState(false);

  const profile = application?.professionalProfile;
  const initials = profile
    ? `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}`.toUpperCase()
    : "?";

  const colorKey = application ? APPLICATION_STATUS_COLORS[application.status] : "gray";
  const badgeClass = STATUS_BADGE_CLASSES[colorKey] ?? STATUS_BADGE_CLASSES.gray;

  const handleStatusUpdate = (status: ApplicationStatus, ownerNote?: string) => {
    updateStatus({ status, ownerNote });
  };

  const handleSaveNote = () => {
    if (!application) return;
    updateStatus(
      { status: application.status, ownerNote: noteValue },
      {
        onSuccess: () => setEditingNote(false),
      }
    );
  };

  if (loadingApplication) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (isError || !application) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh] gap-3 text-center">
        <p className="text-lg font-semibold">Application not found</p>
        <a
          href={`/manage/${businessId}/owner/jobs/${jobId}/applications`}
          className="text-primary hover:underline text-sm flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to applicants
        </a>
      </div>
    );
  }

  return (
    <>
      <div className="p-6 w-full max-w-5xl">
        {/* Back link */}
        <a
          href={`/manage/${businessId}/owner/jobs/${jobId}/applications`}
          className="text-sm text-zinc-500 hover:text-zinc-800 flex items-center gap-1 mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to applicants
        </a>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column — applicant details */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            {/* Applicant card */}
            <div className="bg-card rounded-xl border border-border p-5">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 shrink-0">
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">
                      {profile?.displayName ?? `${profile?.firstName} ${profile?.lastName}`}
                    </p>
                    {profile?.workEmail && (
                      <a
                        href={`mailto:${profile.workEmail}`}
                        className="text-sm text-primary hover:underline flex items-center gap-1"
                      >
                        <Mail className="h-3.5 w-3.5" />
                        {profile.workEmail}
                      </a>
                    )}
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Applied on {format(new Date(application.createdAt), "MMM d, yyyy")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className={cn("text-xs font-medium px-2.5 py-1 rounded-full", badgeClass)}>
                    {APPLICATION_STATUS_OWNER_LABELS[application.status]}
                  </span>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" disabled={updatingStatus}>
                        {updatingStatus ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          "Actions"
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleStatusUpdate("reviewed")}>
                        Mark as Reviewed
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleStatusUpdate("shortlisted")}>
                        Shortlist
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setAcceptConfirmOpen(true)}
                        className="text-green-700"
                      >
                        Accept
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleStatusUpdate("rejected")}
                        className="text-destructive"
                      >
                        Reject
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => {
                          setNoteValue(application.ownerNote ?? "");
                          setEditingNote(true);
                        }}
                      >
                        {application.ownerNote ? "Edit Note" : "Add Note"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>

            {/* Resume */}
            <div className="bg-card rounded-xl border border-border p-5">
              <h2 className="text-sm font-semibold mb-3">Resume</h2>
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
                  View Resume
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              ) : (
                <p className="text-sm text-muted-foreground">No resume provided.</p>
              )}
            </div>

            {/* Cover letter */}
            {application.coverLetter && (
              <div className="bg-card rounded-xl border border-border p-5">
                <h2 className="text-sm font-semibold mb-3">Cover Letter</h2>
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{application.coverLetter}</p>
              </div>
            )}

            {/* Owner note */}
            <div className="bg-card rounded-xl border border-border p-5">
              <h2 className="text-sm font-semibold mb-3">Internal Note</h2>

              {editingNote ? (
                <div className="flex flex-col gap-2">
                  <textarea
                    className="w-full rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
                    rows={3}
                    placeholder="Add an internal note..."
                    value={noteValue}
                    onChange={(e) => setNoteValue(e.target.value)}
                    disabled={updatingStatus}
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleSaveNote} disabled={updatingStatus}>
                      {updatingStatus ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Save"}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingNote(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : application.ownerNote ? (
                <div className="flex flex-col gap-2">
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {application.ownerNote}
                  </p>
                  <button
                    onClick={() => {
                      setNoteValue(application.ownerNote ?? "");
                      setEditingNote(true);
                    }}
                    className="text-xs text-primary hover:underline self-start"
                  >
                    Edit note
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setNoteValue("");
                    setEditingNote(true);
                  }}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  + Add a note
                </button>
              )}
            </div>
          </div>

          {/* Right column — timeline */}
          <div className="bg-card rounded-xl border border-border p-5 h-fit">
            <h2 className="text-sm font-semibold mb-4">Activity Timeline</h2>
            {application.events && application.events.length > 0 ? (
              <OwnerApplicationTimeline events={application.events} />
            ) : (
              <p className="text-sm text-muted-foreground">No activity yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Accept confirmation */}
      <AlertDialog open={acceptConfirmOpen} onOpenChange={setAcceptConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Accept this applicant?</AlertDialogTitle>
            <AlertDialogDescription>
              {profile?.displayName ?? profile?.firstName} will see their status updated to "Accepted".
              This is a meaningful action — confirm before proceeding.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-green-600 hover:bg-green-700"
              onClick={() => {
                handleStatusUpdate("accepted");
                setAcceptConfirmOpen(false);
              }}
            >
              Accept Applicant
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default OwnerApplicationDetailPage;
