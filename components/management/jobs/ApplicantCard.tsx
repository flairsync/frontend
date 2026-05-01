import React, { useState } from "react";
import { format } from "date-fns";
import { ChevronDown, ChevronUp, Mail, Loader2, FileText, ExternalLink, Link } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import {
  APPLICATION_STATUS_COLORS,
  APPLICATION_STATUS_OWNER_LABELS,
  ApplicationStatus,
  JobApplication,
} from "@/models/Job";
import { cn } from "@/lib/utils";

const STATUS_BADGE_CLASSES: Record<string, string> = {
  gray: "bg-zinc-100 text-zinc-700",
  blue: "bg-blue-100 text-blue-700",
  yellow: "bg-yellow-100 text-yellow-700",
  green: "bg-green-100 text-green-700",
  red: "bg-red-100 text-red-700",
};

interface ApplicantCardProps {
  application: JobApplication;
  businessId: string;
  jobId: string;
  onUpdateStatus: (applicationId: string, status: ApplicationStatus, ownerNote?: string) => void;
  isUpdating?: boolean;
}

export function ApplicantCard({
  application,
  businessId,
  jobId,
  onUpdateStatus,
  isUpdating,
}: ApplicantCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [editingNote, setEditingNote] = useState(false);
  const [noteValue, setNoteValue] = useState(application.ownerNote ?? "");
  const [acceptConfirmOpen, setAcceptConfirmOpen] = useState(false);

  const profile = application.professionalProfile;
  const initials = profile
    ? `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}`.toUpperCase()
    : "?";

  const colorKey = APPLICATION_STATUS_COLORS[application.status];
  const badgeClass = STATUS_BADGE_CLASSES[colorKey] ?? STATUS_BADGE_CLASSES.gray;

  const coverPreview =
    application.coverLetter && application.coverLetter.length > 100 && !expanded
      ? application.coverLetter.slice(0, 100) + "..."
      : application.coverLetter;

  const handleSaveNote = () => {
    onUpdateStatus(application.id, application.status, noteValue);
    setEditingNote(false);
  };

  const detailUrl = `/manage/${businessId}/owner/jobs/${jobId}/applications/${application.id}`;

  return (
    <>
      <Card className="border border-border">
        <CardContent className="p-4 flex flex-col gap-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <Avatar className="h-10 w-10 shrink-0">
                <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="font-semibold text-sm truncate">
                  {profile?.displayName ?? `${profile?.firstName} ${profile?.lastName}`}
                </p>
                {profile?.workEmail && (
                  <a
                    href={`mailto:${profile.workEmail}`}
                    className="text-xs text-primary hover:underline flex items-center gap-1 truncate"
                  >
                    <Mail className="h-3 w-3 shrink-0" />
                    {profile.workEmail}
                  </a>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className={cn("text-xs font-medium px-2 py-1 rounded-full", badgeClass)}>
                {APPLICATION_STATUS_OWNER_LABELS[application.status]}
              </span>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8" disabled={isUpdating}>
                    {isUpdating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Actions"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onUpdateStatus(application.id, "reviewed")}>
                    Mark as Reviewed
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onUpdateStatus(application.id, "shortlisted")}>
                    Shortlist
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setAcceptConfirmOpen(true)} className="text-green-700">
                    Accept
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onUpdateStatus(application.id, "rejected")}
                    className="text-destructive"
                  >
                    Reject
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setEditingNote(true)}>
                    {application.ownerNote ? "Edit Note" : "Add Note"}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { window.location.href = detailUrl; }}>
                    View Full Application →
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Applied date + resume indicator */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Applied on {format(new Date(application.createdAt), "MMM d, yyyy")}</span>
            {application.resumeUrl ? (
              <a
                href={application.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-primary hover:underline"
              >
                {application.resumeType === 'file' ? (
                  <FileText className="h-3.5 w-3.5" />
                ) : (
                  <Link className="h-3.5 w-3.5" />
                )}
                View Resume
                <ExternalLink className="h-3 w-3" />
              </a>
            ) : (
              <span className="text-muted-foreground/60">No resume</span>
            )}
          </div>

          {/* Cover letter */}
          {application.coverLetter && (
            <div className="flex flex-col gap-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Cover Letter
              </p>
              <p className="text-sm whitespace-pre-wrap">{coverPreview}</p>
              {application.coverLetter.length > 100 && (
                <button
                  className="text-xs text-primary hover:underline self-start"
                  onClick={() => setExpanded((p) => !p)}
                >
                  {expanded ? (
                    <span className="flex items-center gap-0.5">
                      <ChevronUp className="h-3.5 w-3.5" /> Show less
                    </span>
                  ) : (
                    <span className="flex items-center gap-0.5">
                      <ChevronDown className="h-3.5 w-3.5" /> Read more
                    </span>
                  )}
                </button>
              )}
            </div>
          )}

          {/* Owner note */}
          {application.ownerNote && !editingNote && (
            <div className="bg-muted/50 border border-border rounded-lg px-3 py-2 text-xs text-muted-foreground">
              <span className="font-medium block mb-0.5">Your note</span>
              {application.ownerNote}
            </div>
          )}

          {editingNote && (
            <div className="flex flex-col gap-2">
              <textarea
                className="w-full rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
                rows={3}
                placeholder="Add an internal note..."
                value={noteValue}
                onChange={(e) => setNoteValue(e.target.value)}
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSaveNote} disabled={isUpdating}>
                  Save Note
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setEditingNote(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Detail link */}
          <a
            href={detailUrl}
            className="text-xs text-primary hover:underline self-start"
          >
            View full application →
          </a>
        </CardContent>
      </Card>

      {/* Accept confirmation */}
      <AlertDialog open={acceptConfirmOpen} onOpenChange={setAcceptConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Accept this applicant?</AlertDialogTitle>
            <AlertDialogDescription>
              {profile?.displayName ?? profile?.firstName} will see their status updated to "Accepted". This is a meaningful action — confirm before proceeding.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-green-600 hover:bg-green-700"
              onClick={() => {
                onUpdateStatus(application.id, "accepted");
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
}
