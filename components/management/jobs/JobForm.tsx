import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation("management");
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
    if (form.title.trim().length < 3) errs.title = t("job_form.title_error_min");
    if (form.title.trim().length > 100) errs.title = t("job_form.title_error_max");
    if (form.description.trim().length < 20) errs.description = t("job_form.description_error");
    if (!form.type) errs.type = t("job_form.type_error");
    if (!form.category) errs.category = t("job_form.category_error");
    if (form.closesAt && new Date(form.closesAt) <= new Date()) {
      errs.closesAt = t("job_form.deadline_error");
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
        <label className="text-sm font-medium text-foreground">
          {t("job_form.title_label")} <span className="text-destructive">*</span>
        </label>
        <Input
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
          placeholder={t("job_form.title_placeholder")}
          disabled={isSubmitting}
        />
        {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
      </div>

      {/* Type + Category */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground">
            {t("job_form.employment_type_label")} <span className="text-destructive">*</span>
          </label>
          <Select value={form.type} onValueChange={(v) => set("type", v)} disabled={isSubmitting}>
            <SelectTrigger>
              <SelectValue placeholder={t("job_form.select_type_placeholder")} />
            </SelectTrigger>
            <SelectContent>
              {(Object.entries(JOB_TYPE_LABELS) as [JobType, string][]).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.type && <p className="text-xs text-destructive">{errors.type}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground">
            {t("job_form.category_label")} <span className="text-destructive">*</span>
          </label>
          <Select value={form.category} onValueChange={(v) => set("category", v)} disabled={isSubmitting}>
            <SelectTrigger>
              <SelectValue placeholder={t("job_form.select_category_placeholder")} />
            </SelectTrigger>
            <SelectContent>
              {(Object.entries(JOB_CATEGORY_LABELS) as [JobCategory, string][]).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.category && <p className="text-xs text-destructive">{errors.category}</p>}
        </div>
      </div>

      {/* Description */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-foreground">
          {t("job_form.description_label")} <span className="text-destructive">*</span>
        </label>
        <textarea
          className="w-full rounded-lg border border-border bg-muted/50 text-foreground px-3 py-2.5 text-sm resize-y min-h-[140px] focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition"
          placeholder={t("job_form.description_placeholder")}
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          disabled={isSubmitting}
        />
        {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
      </div>

      {/* Location + Salary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground">{t("job_form.location_label")}</label>
          <Input
            value={form.location}
            onChange={(e) => set("location", e.target.value)}
            placeholder={t("job_form.location_placeholder")}
            disabled={isSubmitting}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground">{t("job_form.salary_range_label")}</label>
          <Input
            value={form.salaryRange}
            onChange={(e) => set("salaryRange", e.target.value)}
            placeholder={t("job_form.salary_range_placeholder")}
            disabled={isSubmitting}
          />
        </div>
      </div>

      {/* Deadline */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-foreground">{t("job_form.deadline_label")}</label>
        <Input
          type="date"
          value={form.closesAt}
          onChange={(e) => set("closesAt", e.target.value)}
          disabled={isSubmitting}
          className="max-w-xs bg-background text-foreground"
        />
        {errors.closesAt && <p className="text-xs text-destructive">{errors.closesAt}</p>}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <Button
          variant="outline"
          onClick={handleDraft}
          disabled={isSubmitting}
        >
          {isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
          {t("job_form.save_as_draft")}
        </Button>
        <Button
          onClick={handlePublish}
          disabled={isSubmitting}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          {isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
          {job ? t("job_form.save_changes") : t("job_form.publish_job")}
        </Button>
      </div>
    </div>
  );
}
