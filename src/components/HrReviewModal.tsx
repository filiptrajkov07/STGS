import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStgs } from "@/lib/stgs-store";
import type { Application, FlightClass } from "@/lib/stgs-types";
import { validateApplicationAgainstPolicy } from "@/lib/policy-validator";
import { StatusBadge } from "./StatusBadge";
import { WorkflowTimeline } from "./WorkflowTimeline";
import { AuditTrail } from "./AuditTrail";
import { InvitationLetterViewer } from "./InvitationLetterViewer";
import {
  AlertTriangle,
  FileText,
  Hotel,
  Plane,
  Coins,
  Coffee,
  Users,
  MapPin,
  CheckCircle2,
  XCircle,
  RotateCcw,
  RotateCw,
  Save,
  Clock,
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

function OverrideField({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-muted-foreground)" }}>
        <span style={{ color: "oklch(0.52 0.10 258)" }}>{icon}</span>
        {label}
      </Label>
      {children}
    </div>
  );
}

export function HrReviewModal({
  app,
  onClose,
}: {
  app: Application | null;
  onClose: () => void;
}) {
  const { rules, hrApprove, hrReject, hrReopen, updateOverrides, eventsFor } = useStgs();
  const [maxHotelStars, setMaxHotelStars] = useState(rules.maxHotelStars);
  const [allowedFlightClass, setAllowedFlightClass] = useState<FlightClass>(rules.allowedFlightClass);
  const [perDiemAmount, setPerDiemAmount] = useState(rules.perDiemAmount);
  const [breakfastDeduction, setBreakfastDeduction] = useState(rules.breakfastDeduction);
  const [reason, setReason] = useState("");
  const [showReason, setShowReason] = useState(false);
  const [showInvitationLetter, setShowInvitationLetter] = useState(false);

  useEffect(() => {
    if (!app) return;
    setMaxHotelStars(app.overrides.maxHotelStars ?? rules.maxHotelStars);
    setAllowedFlightClass(app.overrides.allowedFlightClass ?? rules.allowedFlightClass);
    setPerDiemAmount(app.overrides.perDiemAmount ?? rules.perDiemAmount);
    setBreakfastDeduction(app.overrides.breakfastDeduction ?? rules.breakfastDeduction);
    setReason("");
    setShowReason(false);
  }, [app, rules]);

  if (!app) return null;
  const events = eventsFor(app.id);
  const overrides = { maxHotelStars, allowedFlightClass, perDiemAmount, breakfastDeduction };
  const readonly = app.status !== "pending_hr";
  const validation = validateApplicationAgainstPolicy({ ...app, overrides }, rules);

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
            background: "linear-gradient(135deg, oklch(0.55 0.15 72), oklch(0.48 0.16 65))",
            borderColor: "oklch(0.55 0.15 72 / 40%)",
          }}
        >
          <DialogHeader>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Users className="h-3.5 w-3.5" style={{ color: "oklch(0.90 0.10 75)" }} />
                  <p
                    className="text-[0.65rem] font-semibold uppercase tracking-[0.18em]"
                    style={{ color: "oklch(0.90 0.10 75)" }}
                  >
                    HR Review · {app.reference}
                  </p>
                </div>
                <DialogTitle className="text-xl font-bold text-white tracking-tight">
                  {app.destination}
                </DialogTitle>
                <p className="text-sm mt-0.5" style={{ color: "oklch(0.92 0.08 75)" }}>
                  {app.employeeName} · {app.department} · {app.academicRole}
                </p>
              </div>
              <div className="mt-1">
                <StatusBadge status={app.status} />
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="p-5 space-y-4">
          {/* Application info */}
          <ModalSection
            icon={<MapPin className="h-4 w-4" />}
            title="Application Details"
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
            <div className="space-y-3">
              <WorkflowTimeline status={app.status} />
              <div className="pt-3 border-t space-y-2" style={{ borderColor: "var(--color-border)" }}>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider mb-0.5" style={{ color: "var(--color-muted-foreground)" }}>Travel dates</p>
                    <p style={{ color: "var(--color-foreground)" }}>{app.startDate} → {app.endDate}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider mb-0.5" style={{ color: "var(--color-muted-foreground)" }}>Requested</p>
                    <p style={{ color: "var(--color-foreground)" }}>{app.hotelStars}★ hotel · {app.flightClass}</p>
                  </div>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: "var(--color-muted-foreground)" }}>
                  {app.purpose}
                </p>
              </div>
            </div>
          </ModalSection>

          {/* Policy overrides */}
          <ModalSection
            icon={<Save className="h-4 w-4" />}
            title="Per-Application Policy Overrides"
            badge={
              <span
                className="text-[0.65rem] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
                style={{
                  background: "oklch(0.97 0.08 75)",
                  color: "oklch(0.42 0.14 72)",
                }}
              >
                Customizable
              </span>
            }
          >
            <div className="space-y-4">
              <p className="text-xs" style={{ color: "var(--color-muted-foreground)" }}>
                Adjust rules for this specific application. Defaults are inherited from global HR Settings.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <OverrideField label="Max hotel stars" icon={<Hotel className="h-3 w-3" />}>
                  <Input
                    type="number"
                    min={1}
                    max={5}
                    value={maxHotelStars}
                    disabled={readonly}
                    onChange={(e) => setMaxHotelStars(Number(e.target.value))}
                    className="h-9"
                  />
                </OverrideField>
                <OverrideField label="Allowed flight class" icon={<Plane className="h-3 w-3" />}>
                  <Select
                    value={allowedFlightClass}
                    disabled={readonly}
                    onValueChange={(v) => setAllowedFlightClass(v as FlightClass)}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Economy">Economy</SelectItem>

                      <SelectItem value="Business">Business</SelectItem>
                      <SelectItem value="First Class">First Class</SelectItem>
                    </SelectContent>
                  </Select>
                </OverrideField>
                <OverrideField label="Per diem (EUR/day)" icon={<Coins className="h-3 w-3" />}>
                  <Input
                    type="number"
                    min={0}
                    value={perDiemAmount}
                    disabled={readonly}
                    onChange={(e) => setPerDiemAmount(Number(e.target.value))}
                    className="h-9"
                  />
                </OverrideField>
                <OverrideField label="Breakfast deduction (%)" icon={<Coffee className="h-3 w-3" />}>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={breakfastDeduction}
                    disabled={readonly}
                    onChange={(e) => setBreakfastDeduction(Number(e.target.value))}
                    className="h-9"
                  />
                </OverrideField>
              </div>
              {!readonly && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateOverrides(app.id, overrides)}
                  className="gap-2"
                >
                  <Save className="h-3.5 w-3.5" />
                  Save overrides
                </Button>
              )}
            </div>
          </ModalSection>

          {/* Policy violations */}
          {!validation.valid && !readonly && (
            <div
              className="rounded-2xl border px-5 py-4 space-y-3"
              style={{
                background: "oklch(0.97 0.06 25)",
                borderColor: "oklch(0.90 0.10 25)",
              }}
            >
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="h-4 w-4 shrink-0" style={{ color: "oklch(0.55 0.23 25)" }} />
                <h3 className="text-sm font-semibold" style={{ color: "oklch(0.38 0.18 25)" }}>
                  Policy Violations Detected
                </h3>
              </div>
              <p className="text-xs" style={{ color: "oklch(0.45 0.15 25)" }}>
                Approving with current settings will trigger an automatic rejection. Adjust overrides to resolve:
              </p>
              <ul className="space-y-1">
                {validation.violations.map((v, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs" style={{ color: "oklch(0.42 0.18 25)" }}>
                    <span className="mt-0.5">•</span>
                    {v}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Decision */}
          {!readonly && (
            <ModalSection
              icon={<CheckCircle2 className="h-4 w-4" />}
              title="Decision"
              accent="oklch(0.55 0.15 72)"
            >
              {!showReason ? (
                <div className="flex gap-2.5">
                  <Button
                    onClick={() => {
                      hrApprove(app.id, overrides);
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
                    Approve & Route to Dean
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
              ) : (
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-muted-foreground)" }}>
                      Rejection reason <span style={{ color: "oklch(0.55 0.23 25)" }}>(required)</span>
                    </Label>
                    <Textarea
                      rows={3}
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Explain why this application is being rejected..."
                      className="resize-none"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      disabled={reason.trim().length < 5}
                      onClick={() => {
                        hrReject(app.id, reason.trim());
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

          {/* Rejected application — reopen action */}
          {app.status === "rejected" && (
            <div
              className="rounded-2xl border overflow-hidden"
              style={{
                background: "var(--color-card)",
                borderColor: "oklch(0.90 0.10 25)",
                boxShadow: "0 1px 3px oklch(0.55 0.23 25 / 8%)",
              }}
            >
              <div
                className="px-5 py-3.5 border-b flex items-center gap-2.5"
                style={{
                  background: "linear-gradient(135deg, oklch(0.97 0.06 25), oklch(0.98 0.04 30))",
                  borderColor: "oklch(0.90 0.10 25)",
                }}
              >
                <XCircle className="h-4 w-4" style={{ color: "oklch(0.55 0.23 25)" }} />
                <h3 className="text-sm font-semibold" style={{ color: "oklch(0.38 0.18 25)" }}>
                  Application Rejected
                </h3>
              </div>
              <div className="px-5 py-4 space-y-4">
                {app.rejectionReason && (
                  <div>
                    <p
                      className="text-[0.65rem] font-semibold uppercase tracking-wider mb-1"
                      style={{ color: "var(--color-muted-foreground)" }}
                    >
                      Rejection reason
                    </p>
                    <p
                      className="text-sm leading-relaxed whitespace-pre-wrap rounded-xl border px-3 py-2.5"
                      style={{
                        background: "oklch(0.98 0.03 25)",
                        borderColor: "oklch(0.92 0.06 25)",
                        color: "oklch(0.40 0.15 25)",
                      }}
                    >
                      {app.rejectionReason}
                    </p>
                  </div>
                )}

                <div
                  className="flex items-center justify-between gap-3 rounded-xl border px-4 py-3"
                  style={{
                    background: "oklch(0.97 0.010 258)",
                    borderColor: "var(--color-border)",
                    borderStyle: "dashed",
                  }}
                >
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "var(--color-foreground)" }}>
                      Reopen this application?
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--color-muted-foreground)" }}>
                      HR can move it back to pending review and clear the rejection reason.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      hrReopen(app.id);
                      onClose();
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all hover:opacity-90 hover:scale-105"
                    style={{
                      background: "linear-gradient(135deg, oklch(0.48 0.20 264), oklch(0.52 0.20 275))",
                      color: "white",
                      boxShadow: "0 2px 8px oklch(0.48 0.20 264 / 30%)",
                    }}
                  >
                    <RotateCw className="h-3.5 w-3.5" />
                    Reopen Application
                  </button>
                </div>
              </div>
            </div>
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
