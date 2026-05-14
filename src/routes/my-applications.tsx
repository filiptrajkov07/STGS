import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { useStgs } from "@/lib/stgs-store";
import { StatusBadge } from "@/components/StatusBadge";
import { ApplicationModal } from "@/components/ApplicationModal";
import type { Application } from "@/lib/stgs-types";

export const Route = createFileRoute("/my-applications")({
  component: MyApplicationsPage,
});

function MyApplicationsPage() {
  const { applications, currentRole } = useStgs();
  const [selected, setSelected] = useState<Application | null>(null);

  if (currentRole !== "academic") {
    return (
      <Card className="p-6">
        <p>This page is only available to Academic users.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          Academic workspace
        </p>
        <h2 className="text-2xl font-semibold">My Applications</h2>
      </div>
      <div className="space-y-2">
        {applications.length === 0 && (
          <Card className="p-6 text-sm text-muted-foreground">
            No applications yet. Use the Apply tab to submit one.
          </Card>
        )}
        {applications.map((app) => {
          // sync with latest store version
          return (
            <button
              key={app.id}
              onClick={() => setSelected(app)}
              className="w-full text-left"
            >
              <Card className="p-4 hover:border-primary/60 transition-colors">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold">{app.destination}</p>
                    <p className="text-xs text-muted-foreground">
                      {app.reference} · {app.startDate} → {app.endDate}
                    </p>
                  </div>
                  <StatusBadge status={app.status} />
                </div>
              </Card>
            </button>
          );
        })}
      </div>
      <ApplicationModal
        app={
          selected
            ? applications.find((a) => a.id === selected.id) || null
            : null
        }
        onClose={() => setSelected(null)}
      />
    </div>
  );
}
