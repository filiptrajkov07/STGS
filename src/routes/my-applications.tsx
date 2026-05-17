import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useStgs } from "@/lib/stgs-store";
import { StatusBadge } from "@/components/StatusBadge";
import { ApplicationModal } from "@/components/ApplicationModal";
import type { Application } from "@/lib/stgs-types";
import {
  FileText,
  PlaneTakeoff,
  CalendarDays,
  ArrowRight,
  Inbox,
} from "lucide-react";

export const Route = createFileRoute("/my-applications")({
  component: MyApplicationsPage,
});

function MyApplicationsPage() {
  const { applications, currentRole } = useStgs();
  const [selected, setSelected] = useState<Application | null>(null);

  if (currentRole !== "academic") {
    return (
      <div
        className="rounded-2xl border p-8 text-center"
        style={{ background: "var(--color-card)", borderColor: "var(--color-border)" }}
      >
        <p className="text-sm" style={{ color: "var(--color-muted-foreground)" }}>
          This page is only available to Academic users.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-end justify-between gap-4">
        <div className="space-y-1">
          <p className="section-label">Academic workspace</p>
          <h2
            className="text-2xl font-bold tracking-tight"
            style={{ color: "var(--color-foreground)" }}
          >
            My Applications
          </h2>
          <p className="text-sm" style={{ color: "var(--color-muted-foreground)" }}>
            {applications.length === 0
              ? "No applications submitted yet."
              : `${applications.length} application${applications.length !== 1 ? "s" : ""} total`}
          </p>
        </div>
        <Link
          to="/apply"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 hover:-translate-y-0.5"
          style={{
            background: "linear-gradient(135deg, oklch(0.48 0.20 264), oklch(0.52 0.20 275))",
            boxShadow: "0 2px 12px oklch(0.48 0.20 264 / 30%)",
          }}
        >
          <PlaneTakeoff className="h-4 w-4" />
          New Application
        </Link>
      </div>

      {/* Empty state */}
      {applications.length === 0 && (
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
            <Inbox className="h-8 w-8" style={{ color: "oklch(0.48 0.20 264)" }} />
          </div>
          <h3 className="font-semibold text-base mb-1" style={{ color: "var(--color-foreground)" }}>
            No applications yet
          </h3>
          <p className="text-sm max-w-xs mb-5" style={{ color: "var(--color-muted-foreground)" }}>
            Submit your first travel grant application to get started. It will appear here for tracking.
          </p>
          <Link
            to="/apply"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
            style={{
              background: "linear-gradient(135deg, oklch(0.48 0.20 264), oklch(0.52 0.20 275))",
              boxShadow: "0 2px 12px oklch(0.48 0.20 264 / 30%)",
            }}
          >
            Apply now
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      {/* Applications list */}
      {applications.length > 0 && (
        <div className="space-y-3">
          {applications.map((app) => (
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
                {/* Status stripe */}
                <div
                  className="h-0.5 w-full"
                  style={{
                    background:
                      app.status === "approved" || app.status === "submitted"
                        ? "linear-gradient(90deg, oklch(0.58 0.18 148), oklch(0.65 0.18 155))"
                        : app.status === "rejected"
                        ? "linear-gradient(90deg, oklch(0.55 0.23 25), oklch(0.65 0.20 30))"
                        : app.status === "pending_dean"
                        ? "linear-gradient(90deg, oklch(0.48 0.20 264), oklch(0.55 0.22 275))"
                        : app.status === "pending_hr"
                        ? "linear-gradient(90deg, oklch(0.65 0.18 72), oklch(0.72 0.18 80))"
                        : "linear-gradient(90deg, oklch(0.75 0.06 258), oklch(0.82 0.06 260))",
                  }}
                />

                <div className="flex items-center gap-4 px-5 py-4">
                  {/* Icon */}
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{
                      background: "linear-gradient(135deg, oklch(0.96 0.015 258), oklch(0.94 0.025 265))",
                      border: "1px solid oklch(0.88 0.08 258)",
                    }}
                  >
                    <PlaneTakeoff className="h-4.5 w-4.5" style={{ color: "oklch(0.48 0.20 264)", width: "1.1rem", height: "1.1rem" }} />
                  </div>

                  {/* Main info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-semibold text-sm truncate" style={{ color: "var(--color-foreground)" }}>
                        {app.destination}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span
                        className="inline-flex items-center gap-1 text-xs font-mono"
                        style={{ color: "var(--color-muted-foreground)" }}
                      >
                        <FileText className="h-3 w-3" />
                        {app.reference}
                      </span>
                      <span
                        className="inline-flex items-center gap-1 text-xs"
                        style={{ color: "var(--color-muted-foreground)" }}
                      >
                        <CalendarDays className="h-3 w-3" />
                        {app.startDate} → {app.endDate}
                      </span>
                    </div>
                  </div>

                  {/* Status & arrow */}
                  <div className="flex items-center gap-3 shrink-0">
                    <StatusBadge status={app.status} />
                    <ArrowRight
                      className="h-4 w-4 transition-transform group-hover:translate-x-1"
                      style={{ color: "var(--color-muted-foreground)" }}
                    />
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

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
