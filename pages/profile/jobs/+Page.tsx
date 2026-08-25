import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ApplicationsTab } from "@/components/profile/jobs/ApplicationsTab";
import { InvitationsTab } from "@/components/profile/jobs/InvitationsTab";
import { cn } from "@/lib/utils";

// ─── Page ─────────────────────────────────────────────────────────────────────

type Tab = "applications" | "invitations";

const JobsPage = () => {
  const { t } = useTranslation("profile");
  const [activeTab, setActiveTab] = useState<Tab>("applications");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("my_jobs.tabs_page.title")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Top-level tabs */}
        <div className="flex gap-1 bg-muted rounded-lg p-1 w-fit">
          {(["applications", "invitations"] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-colors",
                activeTab === tab
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab === "applications" ? t("my_jobs.tabs_page.tab_applications") : t("my_jobs.tabs_page.tab_invitations")}
            </button>
          ))}
        </div>

        {activeTab === "applications" ? <ApplicationsTab /> : <InvitationsTab />}
      </CardContent>
    </Card>
  );
};

export default JobsPage;
