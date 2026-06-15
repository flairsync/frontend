import React from "react";
import { formatDistanceToNow, differenceInDays } from "date-fns";
import { MapPin, DollarSign, Users, Clock, AlertTriangle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Job, JOB_CATEGORY_LABELS, JOB_TYPE_LABELS } from "@/models/Job";
import { cn } from "@/lib/utils";

interface JobCardProps {
  job: Job;
}

export function JobCard({ job }: JobCardProps) {
  const isClosingSoon =
    job.closesAt != null && differenceInDays(new Date(job.closesAt), new Date()) <= 3;

  const locationLabel =
    job.location ?? job.business?.city ?? null;

  return (
    <a href={`/jobs/${job.slug}`} className="block group">
      <Card className="hover:shadow-md transition-all border border-zinc-200 group-hover:border-blue-200 h-full">
        <CardContent className="p-5 flex flex-col gap-3 h-full">
          {/* Header */}
          <div className="flex items-start gap-3">
            <Avatar className="h-11 w-11 border border-zinc-100 shadow-sm shrink-0">
              <AvatarImage src={job.business?.logo} alt={job.business?.name} />
              <AvatarFallback className="bg-blue-50 text-blue-600 font-bold text-sm">
                {job.business?.name?.charAt(0)?.toUpperCase() ?? "?"}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-xs text-zinc-500 truncate">{job.business?.name}</p>
              <h3 className="font-semibold text-zinc-900 group-hover:text-blue-600 transition-colors leading-tight">
                {job.title}
              </h3>
            </div>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="secondary" className="text-xs">
              {JOB_TYPE_LABELS[job.type]}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {JOB_CATEGORY_LABELS[job.category]}
            </Badge>
          </div>

          {/* Meta */}
          <div className="flex flex-col gap-1 text-xs text-zinc-500">
            {locationLabel && (
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                {locationLabel}
              </span>
            )}
            {job.salaryRange && (
              <span className="flex items-center gap-1.5">
                <DollarSign className="h-3.5 w-3.5 shrink-0" />
                {job.salaryRange}
              </span>
            )}
          </div>

          {/* Footer */}
          <div className="mt-auto flex items-center justify-between text-xs text-zinc-400 pt-2 border-t border-zinc-50">
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {job.applicationCount} applicant{job.applicationCount !== 1 ? "s" : ""}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
            </span>
          </div>

          {isClosingSoon && (
            <div className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 rounded-md px-2.5 py-1.5">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
              Closes on {new Date(job.closesAt!).toLocaleDateString()}
            </div>
          )}
        </CardContent>
      </Card>
    </a>
  );
}
