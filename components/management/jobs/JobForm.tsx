import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Job,
  JobCategory,
  JobType,
  JOB_CATEGORY_LABELS,
  JOB_TYPE_LABELS,
} from "@/models/Job";
import { CreateJobDto, UpdateJobDto } from "@/features/jobs/service";

interface JobFormProps {
  job?: Job;
  defaultLocation?: string;
  onSubmitDraft: (data: CreateJobDto | UpdateJobDto) => void;
  onSubmitPublish: (data: CreateJobDto | UpdateJobDto) => void;
  isSubmitting: boolean;
}

const EMPTY_FORM = {
  title: "",
  description: "",
  type: "" as JobType | "",
  category: "" as JobCategory | "",
  location: "",
  salaryRange: "",
  closesAt: "",
};

export function JobForm({
  job,
  defaultLocation = "",
  onSubmitDraft,
  onSubmitPublish,
  isSubmitting,
}: JobFormProps) {
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (job) {
      setForm({
        title: job.title,
        description: job.description,
        type: job.type,
        category: job.category,
        location: job.location ?? "",
        salaryRange: job.salaryRange ?? "",
        closesAt: job.closesAt ? job.closesAt.split("T")[0] : "",
      });
    } else if (defaultLocation) {
      setForm((prev) => ({ ...prev, location: defaultLocation }));
    }
  }, [job, defaultLocation]);

  const set = (key: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (form.title.trim().length < 3) errs.title = "Title must be at least 3 characters.";
    if (form.title.trim().length > 100) errs.title = "Title must be under 100 characters.";
    if (form.description.trim().length < 20) errs.description = "Description must be at least 20 characters.";
    if (!form.type) errs.type = "Employment type is required.";
    if (!form.category) errs.category = "Category is required.";
    if (form.closesAt && new Date(form.closesAt) <= new Date()) {
      errs.closesAt = "Application deadline must be in the future.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const buildPayload = (status: "draft" | "open"): CreateJobDto => ({
    title: form.title.trim(),
    description: form.description.trim(),
    type: form.type as JobType,
    category: form.category as JobCategory,
    location: form.location.trim() || undefined,
    salaryRange: form.salaryRange.trim() || undefined,
    closesAt: form.closesAt ? new Date(form.closesAt).toISOString() : null,
    status,
  });

  const handleDraft = () => {
    if (!validate()) return;
    onSubmitDraft(buildPayload("draft"));
  };

  const handlePublish = () => {
    if (!validate()) return;
    onSubmitPublish(buildPayload("open"));
  };

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      {/* Title */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-zinc-700">
          Job Title <span className="text-red-500">*</span>
        </label>
        <Input
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
          placeholder="e.g. Head Server"
          disabled={isSubmitting}
        />
        {errors.title && <p className="text-xs text-red-600">{errors.title}</p>}
      </div>

      {/* Type + Category */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-zinc-700">
            Employment Type <span className="text-red-500">*</span>
          </label>
          <Select value={form.type} onValueChange={(v) => set("type", v)} disabled={isSubmitting}>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {(Object.entries(JOB_TYPE_LABELS) as [JobType, string][]).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.type && <p className="text-xs text-red-600">{errors.type}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-zinc-700">
            Category / Role <span className="text-red-500">*</span>
          </label>
          <Select value={form.category} onValueChange={(v) => set("category", v)} disabled={isSubmitting}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {(Object.entries(JOB_CATEGORY_LABELS) as [JobCategory, string][]).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.category && <p className="text-xs text-red-600">{errors.category}</p>}
        </div>
      </div>

      {/* Description */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-zinc-700">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm resize-y min-h-[140px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          placeholder="Describe the role, requirements, and what you're looking for..."
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          disabled={isSubmitting}
        />
        {errors.description && <p className="text-xs text-red-600">{errors.description}</p>}
      </div>

      {/* Location + Salary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-zinc-700">Location</label>
          <Input
            value={form.location}
            onChange={(e) => set("location", e.target.value)}
            placeholder="e.g. Downtown, New York"
            disabled={isSubmitting}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-zinc-700">Salary Range</label>
          <Input
            value={form.salaryRange}
            onChange={(e) => set("salaryRange", e.target.value)}
            placeholder='e.g. "$15-18/hr" or "Negotiable"'
            disabled={isSubmitting}
          />
        </div>
      </div>

      {/* Deadline */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-zinc-700">Application Deadline</label>
        <Input
          type="date"
          value={form.closesAt}
          onChange={(e) => set("closesAt", e.target.value)}
          disabled={isSubmitting}
          className="max-w-xs"
        />
        {errors.closesAt && <p className="text-xs text-red-600">{errors.closesAt}</p>}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <Button
          variant="outline"
          onClick={handleDraft}
          disabled={isSubmitting}
        >
          {isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
          Save as Draft
        </Button>
        <Button
          onClick={handlePublish}
          disabled={isSubmitting}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
          {job ? "Save Changes" : "Publish Job"}
        </Button>
      </div>
    </div>
  );
}
