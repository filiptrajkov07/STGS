import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { useStgs } from "@/lib/stgs-store";
import { StatusBadge } from "@/components/StatusBadge";
import { HrReviewModal } from "@/components/HrReviewModal";
import { DeanReviewModal } from "@/components/DeanReviewModal";
import type { Application } from "@/lib/stgs-types";

export const Route = createFileRoute("/applications")({
  component: ApplicationsPage,
});

function ApplicationsPage() {
  const { applications, currentRole } = useStgs();
  const [selected, setSelected] = useState<Application | null>(null);

  if (currentRole === "academic") {
    return (
      <Card className="p-6">
        <p>Switch to HR or Dean to review applications.</p>
      </Card>
    );
  }

  const visible =
    currentRole === "dean"
      ? applications.filter(
          (a) =>
            a.status === "pending_dean" ||
            a.status === "approved" ||
            a.status === "rejected",
        )
      : applications;

  const heading =
    currentRole === "dean" ? "Applications (final approval)" : "Applications";

  const current = selected
    ? applications.find((a) => a.id === selected.id) || null
    : null;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          {currentRole === "hr" ? "HR review desk" : "Dean review desk"}
        </p>
        <h2 className="text-2xl font-semibold">{heading}</h2>
      </div>
      <div className="space-y-2">
        {visible.length === 0 && (
          <Card className="p-6 text-sm text-muted-foreground">
            No applications to review.
          </Card>
        )}
        {visible.map((app) => (
          <button
            key={app.id}
            onClick={() => setSelected(app)}
            className="w-full text-left"
          >
            <Card className="p-4 hover:border-primary/60 transition-colors">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">
                    {app.employeeName} — {app.destination}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {app.reference} · {app.startDate} → {app.endDate} ·{" "}
                    {app.department}
                  </p>
                </div>
                <StatusBadge status={app.status} />
              </div>
            </Card>
          </button>
        ))}
      </div>
      {currentRole === "hr" && (
        <HrReviewModal app={current} onClose={() => setSelected(null)} />
      )}
      {currentRole === "dean" && (
        <DeanReviewModal app={current} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
