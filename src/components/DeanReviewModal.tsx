import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useStgs } from "@/lib/stgs-store";
import type { Application } from "@/lib/stgs-types";
import { StatusBadge } from "./StatusBadge";
import { WorkflowTimeline } from "./WorkflowTimeline";
import { AuditTrail } from "./AuditTrail";
import { InvitationLetterViewer } from "./InvitationLetterViewer";
import {
  FileText,
  Crown,
  MapPin,
  User,
  Building2,
  CalendarDays,
  Hotel,
  Plane,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Clock,
  Info,
} from "lucide-react";

function ModalSection({
  icon,
  title,
  badge,
  children,
  accent,
}: {
  icon: React.ReactNode;
  title: string;
  badge?: React.ReactNode;
  children: React.ReactNode;
  accent?: string;
}) {
  return (
    <div
      className="rounded-2xl border overflow-hidden"
      style={{
        background: "var(--color-card)",
        borderColor: accent ? `${accent}40` : "var(--color-border)",
        boxShadow: "0 1px 3px oklch(0.15 0.04 265 / 4%)",
      }}
    >
      <div
        className="flex items-center justify-between px-5 py-3.5 border-b"
        style={{
          background: accent
            ? `linear-gradient(135deg, ${accent}10, ${accent}05)`
            : "linear-gradient(135deg, oklch(0.97 0.010 258), oklch(0.99 0.005 248))",
          borderColor: accent ? `${accent}25` : "var(--color-border)",
        }}
      >
        <div className="flex items-center gap-2.5">
          <span style={{ color: accent || "oklch(0.48 0.20 264)" }}>{icon}</span>
          <h3 className="text-sm font-semibold" style={{ color: "var(--color-foreground)" }}>
            {title}
          </h3>
        </div>
        {badge}
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}

function DetailItem({ label, value, icon }: { label: string; value: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <div>
      <p className="text-[0.65rem] font-semibold uppercase tracking-wider mb-0.5" style={{ color: "var(--color-muted-foreground)" }}>
        {label}
      </p>
      <div className="flex items-center gap-1.5 text-sm font-medium" style={{ color: "var(--color-foreground)" }}>
        {icon && <span style={{ color: "var(--color-muted-foreground)" }}>{icon}</span>}
        {value}
      </div>
    </div>
  );
}

export function DeanReviewModal({
  app,
  onClose,
}: {
  app: Application | null;
  onClose: () => void;
}) {
  const { deanApprove, deanReject, eventsFor } = useStgs();
  const [reason, setReason] = useState("");
  const [showReason, setShowReason] = useState(false);
  const [showInvitationLetter, setShowInvitationLetter] = useState(false);

  if (!app) return null;
  const events = eventsFor(app.id);
  const readonly = app.status !== "pending_dean";

  return (
    <Dialog open={!!app} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className="max-w-2xl max-h-[92vh] overflow-y-auto p-0 gap-0"
        style={{
          background: "var(--color-background)",
          border: "1px solid var(--color-border)",
          borderRadius: "1.25rem",
          boxShadow:
            "0 20px 60px oklch(0.15 0.04 265 / 20%), 0 4px 16px oklch(0.15 0.04 265 / 10%)",
        }}
      >
        {/* Header */}
        <div
          className="sticky top-0 z-10 px-6 py-5 border-b"
          style={{
            background: "linear-gradient(135deg, oklch(0.38 0.16 285), oklch(0.30 0.14 275))",
            borderColor: "oklch(0.38 0.16 285 / 40%)",
          }}
        >
          <DialogHeader>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Crown className="h-3.5 w-3.5" style={{ color: "oklch(0.85 0.12 285)" }} />
                  <p
                    className="text-[0.65rem] font-semibold uppercase tracking-[0.18em]"
                    style={{ color: "oklch(0.85 0.12 285)" }}
                  >
                    Dean's Final Review · {app.reference}
                  </p>
                </div>
                <DialogTitle className="text-xl font-bold text-white tracking-tight">
                  {app.destination}
                </DialogTitle>
                <p className="text-sm mt-0.5" style={{ color: "oklch(0.88 0.10 282)" }}>
                  {app.employeeName} · {app.department}
                </p>
              </div>
              <div className="mt-1">
                <StatusBadge status={app.status} />
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="p-5 space-y-4">
          {/* Application details */}
          <ModalSection
            icon={<MapPin className="h-4 w-4" />}
            title="Application Summary"
            badge={
              <button
                onClick={() => setShowInvitationLetter(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-colors hover:opacity-80"
                style={{
                  background: "oklch(0.94 0.04 265)",
                  color: "oklch(0.4 0.15 265)",
                  border: "1px solid oklch(0.88 0.08 258)",
                }}
              >
                <FileText className="h-3 w-3" />
                Invitation Letter
              </button>
            }
          >
            <div className="space-y-4">
              <WorkflowTimeline status={app.status} />

              <div
                className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 border-t"
                style={{ borderColor: "var(--color-border)" }}
              >
                <DetailItem
                  label="Employee"
                  value={app.employeeName}
                  icon={<User className="h-3.5 w-3.5" />}
                />
                <DetailItem
                  label="Department"
                  value={app.department}
                  icon={<Building2 className="h-3.5 w-3.5" />}
                />
                <DetailItem label="Academic role" value={app.academicRole} />
                <DetailItem
                  label="Travel dates"
                  value={`${app.startDate} → ${app.endDate}`}
                  icon={<CalendarDays className="h-3.5 w-3.5" />}
                />
                <DetailItem
                  label="Hotel"
                  value={`${app.hotelStars} stars`}
                  icon={<Hotel className="h-3.5 w-3.5" />}
                />
                <DetailItem
                  label="Flight class"
                  value={app.flightClass}
                  icon={<Plane className="h-3.5 w-3.5" />}
                />
              </div>

              {/* HR overrides summary */}
              <div
                className="rounded-xl border px-4 py-3"
                style={{
                  background: Object.keys(app.overrides).length
                    ? "oklch(0.97 0.08 75)"
                    : "var(--color-muted)",
                  borderColor: Object.keys(app.overrides).length
                    ? "oklch(0.90 0.10 75)"
                    : "var(--color-border)",
                }}
              >
                <p
                  className="text-xs font-semibold uppercase tracking-wider mb-1"
                  style={{
                    color: Object.keys(app.overrides).length
                      ? "oklch(0.42 0.14 72)"
                      : "var(--color-muted-foreground)",
                  }}
                >
                  HR Policy Overrides
                </p>
                <p
                  className="text-sm"
                  style={{
                    color: Object.keys(app.overrides).length
                      ? "oklch(0.38 0.14 72)"
                      : "var(--color-muted-foreground)",
                  }}
                >
                  {Object.keys(app.overrides).length
                    ? `${app.overrides.maxHotelStars ?? "—"}★ hotel · ${app.overrides.allowedFlightClass ?? "—"} · €${app.overrides.perDiemAmount ?? "—"}/day`
                    : "Default global policy applied — no HR overrides"}
                </p>
              </div>

              {/* Purpose */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--color-muted-foreground)" }}>
                  Academic purpose
                </p>
                <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "var(--color-foreground)" }}>
                  {app.purpose}
                </p>
              </div>

              {/* Read-only notice */}
              <div
                className="flex items-center gap-2 rounded-lg px-3 py-2"
                style={{ background: "var(--color-muted)" }}
              >
                <Info className="h-3.5 w-3.5 shrink-0" style={{ color: "var(--color-muted-foreground)" }} />
                <p className="text-xs italic" style={{ color: "var(--color-muted-foreground)" }}>
                  All fields are read-only. The Dean may only Accept or Reject.
                </p>
              </div>
            </div>
          </ModalSection>

          {/* Rejection notice for already-rejected */}
          {readonly && app.rejectionReason && (
            <div
              className="flex items-start gap-3 rounded-2xl border px-5 py-4"
              style={{
                background: "oklch(0.97 0.06 25)",
                borderColor: "oklch(0.90 0.10 25)",
              }}
            >
              <XCircle className="h-4 w-4 shrink-0 mt-0.5" style={{ color: "oklch(0.55 0.23 25)" }} />
              <div>
                <p className="text-sm font-semibold" style={{ color: "oklch(0.40 0.18 25)" }}>
                  Rejection reason
                </p>
                <p className="text-sm mt-0.5" style={{ color: "oklch(0.45 0.15 25)" }}>
                  {app.rejectionReason}
                </p>
              </div>
            </div>
          )}

          {/* Decision */}
          {!readonly && (
            <ModalSection
              icon={<Crown className="h-4 w-4" />}
              title="Final Decision"
              accent="oklch(0.38 0.16 285)"
            >
              {!showReason ? (
                <div className="space-y-3">
                  <p className="text-sm" style={{ color: "var(--color-muted-foreground)" }}>
                    This is the final approval stage. Your decision is binding and cannot be reversed.
                  </p>
                  <div className="flex gap-2.5">
                    <Button
                      onClick={() => {
                        deanApprove(app.id);
                        onClose();
                      }}
                      className="gap-2 flex-1 sm:flex-none"
                      style={{
                        background: "linear-gradient(135deg, oklch(0.48 0.18 148), oklch(0.55 0.18 155))",
                        border: "none",
                        color: "white",
                        fontWeight: 600,
                        boxShadow: "0 2px 8px oklch(0.48 0.18 148 / 30%)",
                      }}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Accept & Approve
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowReason(true)}
                      className="gap-2 flex-1 sm:flex-none"
                      style={{
                        border: "1px solid oklch(0.90 0.10 25)",
                        color: "oklch(0.45 0.18 25)",
                      }}
                    >
                      <XCircle className="h-4 w-4" />
                      Reject
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-muted-foreground)" }}>
                      Rejection reason{" "}
                      <span style={{ color: "oklch(0.55 0.23 25)" }}>(required)</span>
                    </Label>
                    <Textarea
                      rows={3}
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Provide a clear reason for rejection..."
                      className="resize-none"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      disabled={reason.trim().length < 5}
                      onClick={() => {
                        deanReject(app.id, reason.trim());
                        onClose();
                      }}
                      className="gap-2"
                      style={{
                        background: "oklch(0.55 0.23 25)",
                        border: "none",
                        color: "white",
                        fontWeight: 600,
                      }}
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      Confirm rejection
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowReason(false)}
                      className="gap-2"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </ModalSection>
          )}

          {/* Audit trail */}
          <ModalSection
            icon={<Clock className="h-4 w-4" />}
            title="Activity Log"
            badge={
              <span
                className="text-[0.65rem] font-semibold uppercase tracking-wider"
                style={{ color: "var(--color-muted-foreground)" }}
              >
                {events.length} event{events.length !== 1 ? "s" : ""}
              </span>
            }
          >
            <AuditTrail events={events} />
          </ModalSection>
        </div>

        <InvitationLetterViewer
          fileName={app.invitationLetter}
          isOpen={showInvitationLetter}
          onClose={() => setShowInvitationLetter(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
