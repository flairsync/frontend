import React, { useRef, useState } from "react";
import { Loader2, Link, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Job } from "@/models/Job";
import { useApplyToJob } from "@/features/jobs/useMyApplications";
import { uploadResumeFileApiCall } from "@/features/jobs/service";
import { cn } from "@/lib/utils";

type ResumeMode = 'none' | 'url' | 'file';

interface ApplyModalProps {
  job: Job;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ApplyModal({ job, open, onOpenChange, onSuccess }: ApplyModalProps) {
  const [coverLetter, setCoverLetter] = useState("");
  const [resumeMode, setResumeMode] = useState<ResumeMode>('none');
  const [resumeUrl, setResumeUrl] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { applyToJob, applying, applyErrorMessage } = useApplyToJob(job.id);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (file && file.type !== 'application/pdf') {
      return;
    }
    setResumeFile(file);
  };

  const handleSubmit = () => {
    const payload: { coverLetter?: string; resumeUrl?: string } = {};
    if (coverLetter.trim()) payload.coverLetter = coverLetter.trim();
    if (resumeMode === 'url' && resumeUrl.trim()) payload.resumeUrl = resumeUrl.trim();

    applyToJob(payload, {
      onSuccess: async (resp: any) => {
        // If a file was selected, upload it now after the application is created
        if (resumeMode === 'file' && resumeFile) {
          try {
            await uploadResumeFileApiCall(job.id, resumeFile);
          } catch {
            // Don't block success — resume can be added later
          }
        }
        onOpenChange(false);
        resetForm();
        onSuccess?.();
      },
    });
  };

  const resetForm = () => {
    setCoverLetter("");
    setResumeMode('none');
    setResumeUrl("");
    setResumeFile(null);
  };

  const handleClose = (value: boolean) => {
    if (!applying) {
      onOpenChange(value);
      if (!value) resetForm();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-base leading-snug">
            Apply for: <span className="text-primary">{job.title}</span>
            {job.business && (
              <span className="text-muted-foreground font-normal"> at {job.business.name}</span>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-1">
          {/* Cover letter */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">
              Cover Letter <span className="font-normal text-muted-foreground">(optional)</span>
            </label>
            <textarea
              className="w-full rounded-lg border border-border bg-muted/30 px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
              rows={5}
              placeholder="Tell them why you're a good fit..."
              maxLength={2000}
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              disabled={applying}
            />
            <p className="text-xs text-muted-foreground text-right">{coverLetter.length} / 2000</p>
          </div>

          {/* Resume */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">
              Resume <span className="font-normal text-muted-foreground">(optional)</span>
            </label>

            <div className="flex flex-col gap-2 rounded-lg border border-border p-3 bg-muted/20">
              {/* Option: URL */}
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="radio"
                  name="resumeMode"
                  className="mt-0.5 accent-primary"
                  checked={resumeMode === 'url'}
                  onChange={() => setResumeMode('url')}
                  disabled={applying}
                />
                <div className="flex flex-col gap-1 flex-1">
                  <span className="text-sm font-medium flex items-center gap-1.5">
                    <Link className="h-3.5 w-3.5" /> Paste a link
                  </span>
                  {resumeMode === 'url' && (
                    <Input
                      value={resumeUrl}
                      onChange={(e) => setResumeUrl(e.target.value)}
                      placeholder="https://linkedin.com/in/your-profile"
                      className="h-8 text-sm mt-1"
                      disabled={applying}
                      autoFocus
                    />
                  )}
                </div>
              </label>

              {/* Option: File */}
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="radio"
                  name="resumeMode"
                  className="mt-0.5 accent-primary"
                  checked={resumeMode === 'file'}
                  onChange={() => setResumeMode('file')}
                  disabled={applying}
                />
                <div className="flex flex-col gap-1 flex-1">
                  <span className="text-sm font-medium flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5" /> Upload a PDF
                  </span>
                  {resumeMode === 'file' && (
                    <div className="flex items-center gap-2 mt-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={applying}
                      >
                        Choose file
                      </Button>
                      {resumeFile ? (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <FileText className="h-3.5 w-3.5 text-primary" />
                          <span className="truncate max-w-[160px]">{resumeFile.name}</span>
                          <button
                            onClick={() => setResumeFile(null)}
                            className="text-muted-foreground hover:text-foreground"
                          >
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
                  )}
                </div>
              </label>
            </div>
          </div>

          {applyErrorMessage && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2.5 text-sm text-destructive">
              {applyErrorMessage}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleClose(false)} disabled={applying}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={applying} className="min-w-[160px]">
            {applying ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Application"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
