import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useStgs } from "@/lib/stgs-store";
import { StatusBadge } from "@/components/StatusBadge";
import { HrReviewModal } from "@/components/HrReviewModal";
import { DeanReviewModal } from "@/components/DeanReviewModal";
import type { Application } from "@/lib/stgs-types";
import {
  User,
  MapPin,
  CalendarDays,
  Building2,
  Inbox,
  ArrowRight,
  ClipboardCheck,
  Users,
  Crown,
} from "lucide-react";

export const Route = createFileRoute("/applications")({
  component: ApplicationsPage,
});

function ApplicationsPage() {
  const { applications, currentRole } = useStgs();
  const [selected, setSelected] = useState<Application | null>(null);

  if (currentRole === "academic") {
    return (
      <div
        className="rounded-2xl border p-8 text-center"
        style={{ background: "var(--color-card)", borderColor: "var(--color-border)" }}
      >
        <p className="text-sm" style={{ color: "var(--color-muted-foreground)" }}>
          Switch to HR or Dean to review applications.
        </p>
      </div>
    );
  }

  const visible =
    currentRole === "dean"
      ? applications.filter((a) => a.status === "pending_dean")
      : applications.filter(
          (a) => a.status === "pending_hr" || a.status === "rejected",
        );

  const current = selected
    ? applications.find((a) => a.id === selected.id) || null
    : null;

  const isHr = currentRole === "hr";
  const RoleIcon = isHr ? Users : Crown;

  return (
    <div className="space-y-6">
      {/* Page header with stats */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="space-y-1">
          <p className="section-label">
            {isHr ? "HR review desk" : "Dean review desk"}
          </p>
          <h2
            className="text-2xl font-bold tracking-tight"
            style={{ color: "var(--color-foreground)" }}
          >
            {isHr ? "Applications — HR Review" : "Applications — Final Approval"}
          </h2>
          <p className="text-sm" style={{ color: "var(--color-muted-foreground)" }}>
            {isHr
              ? "Review and route applications to the Dean, or reject with feedback."
              : "Final approval authority. Accept or reject applications pending your decision."}
          </p>
        </div>

        {/* Stats card */}
        <div
          className="rounded-2xl border px-5 py-4 flex items-center gap-4 shrink-0"
          style={{
            background: "linear-gradient(135deg, oklch(0.96 0.015 258), oklch(0.98 0.008 248))",
            borderColor: "var(--color-border)",
            boxShadow: "0 1px 3px oklch(0.15 0.04 265 / 4%)",
          }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, oklch(0.48 0.20 264 / 15%), oklch(0.52 0.20 275 / 10%))",
              border: "1px solid oklch(0.88 0.08 258)",
            }}
          >
            <RoleIcon className="h-5 w-5" style={{ color: "oklch(0.48 0.20 264)" }} />
          </div>
          <div>
            <p
              className="text-3xl font-bold tracking-tight leading-none"
              style={{ color: "oklch(0.48 0.20 264)" }}
            >
              {visible.filter((a) => a.status !== "rejected").length}
            </p>
            <p className="text-xs mt-0.5 font-medium" style={{ color: "var(--color-muted-foreground)" }}>
              pending review
              {isHr && visible.filter((a) => a.status === "rejected").length > 0 && (
                <span style={{ color: "oklch(0.55 0.23 25)" }}>
                  {" · "}
                  {visible.filter((a) => a.status === "rejected").length} rejected
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Empty state */}
      {visible.length === 0 && (
        <div
          className="rounded-2xl border flex flex-col items-center justify-center py-16 px-8 text-center"
          style={{
            background: "var(--color-card)",
            borderColor: "var(--color-border)",
            borderStyle: "dashed",
          }}
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
            style={{
              background: "linear-gradient(135deg, oklch(0.96 0.015 258), oklch(0.94 0.025 265))",
              border: "1px solid oklch(0.88 0.08 258)",
            }}
          >
            <ClipboardCheck className="h-8 w-8" style={{ color: "oklch(0.48 0.20 264)" }} />
          </div>
          <h3 className="font-semibold text-base mb-1" style={{ color: "var(--color-foreground)" }}>
            All clear!
          </h3>
          <p className="text-sm max-w-xs" style={{ color: "var(--color-muted-foreground)" }}>
            {isHr
              ? "No applications are currently pending HR review."
              : "No applications are pending your final approval."}
          </p>
        </div>
      )}

      {/* Applications list */}
      {visible.length > 0 && (
        <div className="space-y-3">
          {visible.map((app) => (
            <button
              key={app.id}
              onClick={() => setSelected(app)}
              className="w-full text-left group hover-lift"
            >
              <div
                className="rounded-2xl border overflow-hidden transition-all duration-200 group-hover:border-[oklch(0.7_0.15_264)]"
                style={{
                  background: "var(--color-card)",
                  borderColor: "var(--color-border)",
                  boxShadow: "0 1px 3px oklch(0.15 0.04 265 / 4%)",
                }}
              >
                {/* Top stripe */}
                <div
                  className="h-0.5 w-full"
                  style={{
                    background:
                      app.status === "rejected"
                        ? "linear-gradient(90deg, oklch(0.55 0.23 25), oklch(0.65 0.20 30))"
                        : isHr
                        ? "linear-gradient(90deg, oklch(0.65 0.18 72), oklch(0.72 0.18 80))"
                        : "linear-gradient(90deg, oklch(0.48 0.20 264), oklch(0.55 0.22 275))",
                  }}
                />

                <div className="flex items-center gap-4 px-5 py-4">
                  {/* Avatar initials */}
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold text-sm text-white"
                    style={{
                      background: isHr
                        ? "linear-gradient(135deg, oklch(0.65 0.18 72), oklch(0.55 0.16 65))"
                        : "linear-gradient(135deg, oklch(0.48 0.20 264), oklch(0.52 0.20 275))",
                      boxShadow: isHr
                        ? "0 2px 8px oklch(0.65 0.18 72 / 25%)"
                        : "0 2px 8px oklch(0.48 0.20 264 / 25%)",
                    }}
                  >
                    {app.employeeName.split(" ").slice(-1)[0]?.slice(0, 1).toUpperCase() ?? "?"}
                  </div>

                  {/* Main info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate" style={{ color: "var(--color-foreground)" }}>
                      {app.employeeName}
                    </p>
                    <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                      <span
                        className="inline-flex items-center gap-1 text-xs"
                        style={{ color: "var(--color-muted-foreground)" }}
                      >
                        <MapPin className="h-3 w-3" />
                        {app.destination}
                      </span>
                      <span
                        className="inline-flex items-center gap-1 text-xs"
                        style={{ color: "var(--color-muted-foreground)" }}
                      >
                        <CalendarDays className="h-3 w-3" />
                        {app.startDate} → {app.endDate}
                      </span>
                      <span
                        className="inline-flex items-center gap-1 text-xs"
                        style={{ color: "var(--color-muted-foreground)" }}
                      >
                        <Building2 className="h-3 w-3" />
                        {app.department}
                      </span>
                    </div>
                  </div>

                  {/* Ref + status + arrow */}
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={app.status} />
                      <ArrowRight
                        className="h-4 w-4 transition-transform group-hover:translate-x-1"
                        style={{ color: "var(--color-muted-foreground)" }}
                      />
                    </div>
                    <span
                      className="text-[0.65rem] font-mono"
                      style={{ color: "var(--color-muted-foreground)" }}
                    >
                      {app.reference}
                    </span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {currentRole === "hr" && (
        <HrReviewModal app={current} onClose={() => setSelected(null)} />
      )}
      {currentRole === "dean" && (
        <DeanReviewModal app={current} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
