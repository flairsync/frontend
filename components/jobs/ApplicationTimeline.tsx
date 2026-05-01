import React from "react";
import { format } from "date-fns";
import { CheckCircle2, Clock, FileText, StickyNote } from "lucide-react";
import {
  ApplicationEventSource,
  ApplicationEventType,
  ApplicationStatus,
  EVENT_TYPE_LABELS,
  JobApplicationEvent,
} from "@/models/Job";
import { cn } from "@/lib/utils";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getProDescription(event: JobApplicationEvent): string {
  switch (event.type) {
    case 'submitted': return 'You applied for this position.';
    case 'reviewed': return 'The employer has reviewed your application.';
    case 'shortlisted': return "You've been shortlisted! The employer is interested in your profile.";
    case 'accepted': return "You've been accepted for this position. Congratulations!";
    case 'rejected': return 'The employer has closed your application.';
    case 'resume_added': return event.note ?? 'You updated your resume.';
    default: return '';
  }
}

function getOwnerDescription(event: JobApplicationEvent): string {
  switch (event.source) {
    case 'applicant': return event.note ?? EVENT_TYPE_LABELS[event.type];
    case 'owner': return event.note ?? EVENT_TYPE_LABELS[event.type];
    case 'system': return event.note ?? EVENT_TYPE_LABELS[event.type];
    default: return EVENT_TYPE_LABELS[event.type];
  }
}

function getOwnerSourceLabel(event: JobApplicationEvent): string {
  if (event.source === 'applicant') return 'applicant';
  if (event.source === 'system') return 'Flairsync';
  if (event.triggeredBy) {
    const { firstName, lastName } = event.triggeredBy;
    return [firstName, lastName].filter(Boolean).join(' ') || 'you';
  }
  return 'you';
}

const EVENT_ICON_CLASS: Partial<Record<ApplicationEventType, string>> = {
  submitted: 'bg-blue-100 text-blue-600',
  reviewed: 'bg-purple-100 text-purple-600',
  shortlisted: 'bg-yellow-100 text-yellow-600',
  accepted: 'bg-green-100 text-green-600',
  rejected: 'bg-red-100 text-red-600',
  resume_added: 'bg-zinc-100 text-zinc-600',
  note_updated: 'bg-zinc-100 text-zinc-600',
};

const TERMINAL_STATUSES: ApplicationStatus[] = ['accepted', 'rejected'];

// ─── Professional timeline ────────────────────────────────────────────────────

interface ProTimelineProps {
  events: JobApplicationEvent[];
  currentStatus: ApplicationStatus;
}

export function ProApplicationTimeline({ events, currentStatus }: ProTimelineProps) {
  const visibleEvents = events.filter(
    (e) => e.source !== 'owner' || ['submitted', 'reviewed', 'shortlisted', 'accepted', 'rejected', 'resume_added'].includes(e.type)
  );

  const isTerminal = TERMINAL_STATUSES.includes(currentStatus);

  return (
    <div className="flex flex-col">
      {visibleEvents.map((event, i) => {
        const isLast = i === visibleEvents.length - 1;
        const iconClass = EVENT_ICON_CLASS[event.type] ?? 'bg-zinc-100 text-zinc-600';

        return (
          <div key={event.id} className="flex gap-3">
            {/* Line + dot */}
            <div className="flex flex-col items-center">
              <div className={cn("w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs", iconClass)}>
                {event.type === 'resume_added' ? (
                  <FileText className="h-3.5 w-3.5" />
                ) : (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                )}
              </div>
              {!isLast && <div className="w-px flex-1 bg-border my-1" />}
            </div>

            {/* Content */}
            <div className={cn("pb-5 min-w-0", isLast && "pb-0")}>
              <p className="text-sm font-medium">{EVENT_TYPE_LABELS[event.type]}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{getProDescription(event)}</p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                {format(new Date(event.createdAt), "MMM d, yyyy · h:mm a")}
              </p>
            </div>
          </div>
        );
      })}

      {/* Waiting / closure dot */}
      {!isTerminal ? (
        <div className="flex gap-3 mt-1">
          <div className="flex flex-col items-center">
            <div className="w-7 h-7 rounded-full border-2 border-dashed border-border flex items-center justify-center shrink-0">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
          </div>
          <div className="pb-0 flex items-center">
            <p className="text-xs text-muted-foreground italic">Waiting for next update...</p>
          </div>
        </div>
      ) : currentStatus === 'accepted' ? (
        <div className="mt-3 rounded-lg bg-green-50 border border-green-200 px-3 py-2.5 text-sm text-green-800 font-medium">
          🎉 Congratulations! You've been accepted for this position.
        </div>
      ) : (
        <div className="mt-3 rounded-lg bg-zinc-50 border border-border px-3 py-2.5 text-sm text-muted-foreground">
          This application has been closed.
        </div>
      )}
    </div>
  );
}

// ─── Owner timeline ───────────────────────────────────────────────────────────

interface OwnerTimelineProps {
  events: JobApplicationEvent[];
}

export function OwnerApplicationTimeline({ events }: OwnerTimelineProps) {
  return (
    <div className="flex flex-col">
      {events.map((event, i) => {
        const isLast = i === events.length - 1;
        const iconClass = EVENT_ICON_CLASS[event.type] ?? 'bg-zinc-100 text-zinc-600';
        const sourceLabel = getOwnerSourceLabel(event);

        return (
          <div key={event.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className={cn("w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs", iconClass)}>
                {event.type === 'resume_added' ? (
                  <FileText className="h-3.5 w-3.5" />
                ) : event.type === 'note_updated' ? (
                  <StickyNote className="h-3.5 w-3.5" />
                ) : (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                )}
              </div>
              {!isLast && <div className="w-px flex-1 bg-border my-1" />}
            </div>

            <div className={cn("pb-5 min-w-0", isLast && "pb-0")}>
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-medium">{EVENT_TYPE_LABELS[event.type]}</p>
                <span className="text-xs bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                  {sourceLabel}
                </span>
              </div>
              {event.note && (
                <p className="text-xs text-muted-foreground mt-0.5 italic">"{event.note}"</p>
              )}
              <p className="text-xs text-muted-foreground/60 mt-1">
                {format(new Date(event.createdAt), "MMM d, yyyy · h:mm a")}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
