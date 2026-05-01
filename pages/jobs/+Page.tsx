import React, { useState } from "react";
import { Briefcase, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { JobCard } from "@/components/jobs/JobCard";
import { useQuery } from "@tanstack/react-query";
import { fetchPublicJobsApiCall } from "@/features/jobs/service";
import { Job, JobCategory, JobType, JOB_CATEGORY_LABELS, JOB_TYPE_LABELS, PaginatedResponse } from "@/models/Job";
import PublicFeedHeader from "@/components/feed/PublicFeedHeader";
import WebsiteFooter from "@/components/shared/WebsiteFooter";

function getFiltersFromUrl() {
  if (typeof window === "undefined") return { type: "", category: "", location: "", page: 1 };
  const params = new URLSearchParams(window.location.search);
  return {
    type: params.get("type") ?? "",
    category: params.get("category") ?? "",
    location: params.get("location") ?? "",
    page: Number(params.get("page") ?? 1),
  };
}

const JobBoardPage = () => {
  const [filters, setFilters] = useState(getFiltersFromUrl);
  const [locationInput, setLocationInput] = useState(filters.location);

  const { data, isPending: loading } = useQuery<PaginatedResponse<Job>>({
    queryKey: ["public_jobs", filters],
    queryFn: async () => {
      const resp = await fetchPublicJobsApiCall({
        page: filters.page,
        limit: 12,
        type: filters.type as JobType || undefined,
        category: filters.category as JobCategory || undefined,
        location: filters.location || undefined,
      });
      return resp.data.data;
    },
  });

  const jobs = data?.data ?? [];
  const totalPages = data?.pages ?? 1;

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(window.location.search);
    if (value) params.set(key, value);
    else params.delete(key);
    params.set("page", "1");
    window.history.pushState({}, "", `/jobs?${params.toString()}`);
    setFilters(getFiltersFromUrl());
  };

  const handleLocationSearch = () => updateFilter("location", locationInput);

  const setPage = (page: number) => {
    const params = new URLSearchParams(window.location.search);
    params.set("page", String(page));
    window.history.pushState({}, "", `/jobs?${params.toString()}`);
    setFilters(getFiltersFromUrl());
  };

  return (
    <div className="min-h-screen bg-background">
      <PublicFeedHeader />

      <main className="pt-20 pb-20">
        {/* Hero */}
        <div className="bg-card border-b border-border py-10 px-4">
          <div className="max-w-5xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Briefcase className="h-6 w-6 text-primary" />
              <h1 className="text-3xl font-bold">Job Board</h1>
            </div>
            <p className="text-muted-foreground max-w-md mx-auto">
              Find your next opportunity in the restaurant &amp; hospitality industry.
            </p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-8">
          {/* Filters */}
          <div className="bg-card rounded-xl border border-border p-4 mb-6 flex flex-wrap gap-3 items-end">
            <div className="flex flex-col gap-1 min-w-[160px]">
              <label className="text-xs font-medium text-muted-foreground">Employment Type</label>
              <Select
                value={filters.type || "all"}
                onValueChange={(v) => updateFilter("type", v === "all" ? "" : v)}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  {(Object.entries(JOB_TYPE_LABELS) as [JobType, string][]).map(([v, l]) => (
                    <SelectItem key={v} value={v}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1 min-w-[160px]">
              <label className="text-xs font-medium text-muted-foreground">Category</label>
              <Select
                value={filters.category || "all"}
                onValueChange={(v) => updateFilter("category", v === "all" ? "" : v)}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {(Object.entries(JOB_CATEGORY_LABELS) as [JobCategory, string][]).map(([v, l]) => (
                    <SelectItem key={v} value={v}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
              <label className="text-xs font-medium text-muted-foreground">Location</label>
              <div className="flex gap-2">
                <Input
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLocationSearch()}
                  placeholder="City, state..."
                  className="h-9"
                />
                <Button size="sm" variant="outline" onClick={handleLocationSearch} className="h-9 px-3">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {(filters.type || filters.category || filters.location) && (
              <Button
                variant="ghost"
                size="sm"
                className="h-9 text-muted-foreground"
                onClick={() => {
                  setLocationInput("");
                  window.history.pushState({}, "", "/jobs");
                  setFilters({ type: "", category: "", location: "", page: 1 });
                }}
              >
                Clear filters
              </Button>
            )}
          </div>

          {/* Results */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              <p className="text-sm text-muted-foreground">Loading jobs...</p>
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center border-2 border-dashed border-border rounded-2xl p-16 bg-card">
              <Briefcase className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-lg font-semibold mb-1">No open positions found</p>
              <p className="text-sm text-muted-foreground">Try adjusting your filters.</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-4">
                {jobs.length} position{jobs.length !== 1 ? "s" : ""} found
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {jobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                  <Button variant="outline" size="sm" disabled={filters.page <= 1} onClick={() => setPage(filters.page - 1)}>
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {filters.page} of {totalPages}
                  </span>
                  <Button variant="outline" size="sm" disabled={filters.page >= totalPages} onClick={() => setPage(filters.page + 1)}>
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <WebsiteFooter />
    </div>
  );
};

export default JobBoardPage;
