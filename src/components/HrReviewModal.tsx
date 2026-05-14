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
import { Card } from "@/components/ui/card";
import { useStgs } from "@/lib/stgs-store";
import type { Application, FlightClass } from "@/lib/stgs-types";
import { validateApplicationAgainstPolicy } from "@/lib/policy-validator";
import { StatusBadge } from "./StatusBadge";
import { WorkflowTimeline } from "./WorkflowTimeline";
import { AlertTriangle } from "lucide-react";

export function HrReviewModal({
  app,
  onClose,
}: {
  app: Application | null;
  onClose: () => void;
}) {
  const { rules, hrApprove, hrReject, updateOverrides, eventsFor } = useStgs();
  const [maxHotelStars, setMaxHotelStars] = useState(rules.maxHotelStars);
  const [allowedFlightClass, setAllowedFlightClass] = useState<FlightClass>(
    rules.allowedFlightClass,
  );
  const [perDiemAmount, setPerDiemAmount] = useState(rules.perDiemAmount);
  const [breakfastDeduction, setBreakfastDeduction] = useState(
    rules.breakfastDeduction,
  );
  const [reason, setReason] = useState("");
  const [showReason, setShowReason] = useState(false);

  useEffect(() => {
    if (!app) return;
    setMaxHotelStars(app.overrides.maxHotelStars ?? rules.maxHotelStars);
    setAllowedFlightClass(
      app.overrides.allowedFlightClass ?? rules.allowedFlightClass,
    );
    setPerDiemAmount(app.overrides.perDiemAmount ?? rules.perDiemAmount);
    setBreakfastDeduction(
      app.overrides.breakfastDeduction ?? rules.breakfastDeduction,
    );
    setReason("");
    setShowReason(false);
  }, [app, rules]);

  if (!app) return null;
  const events = eventsFor(app.id);
  const overrides = {
    maxHotelStars,
    allowedFlightClass,
    perDiemAmount,
    breakfastDeduction,
  };
  const readonly = app.status !== "pending_hr";

  // Calculate validation results based on current override values
  const appWithCurrentOverrides = { ...app, overrides };
  const validation = validateApplicationAgainstPolicy(
    appWithCurrentOverrides,
    rules,
  );

  return (
    <Dialog open={!!app} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                {app.reference}
              </p>
              <DialogTitle>{app.destination}</DialogTitle>
            </div>
            <StatusBadge status={app.status} />
          </div>
        </DialogHeader>

        <Card className="p-4 space-y-2 text-sm">
          <WorkflowTimeline status={app.status} />
          <p>
            <strong>{app.employeeName}</strong> — {app.department} (
            {app.academicRole})
          </p>
          <p>
            <strong>Travel:</strong> {app.startDate} → {app.endDate}
          </p>
          <p>
            <strong>Requested:</strong> {app.hotelStars}★ hotel ·{" "}
            {app.flightClass}
          </p>
          <p>
            <strong>Invitation letter:</strong>{" "}
            {app.invitationLetter || "Not attached"}
          </p>
          <p className="text-muted-foreground">{app.purpose}</p>
        </Card>

        <Card className="p-4 space-y-3">
          <h3 className="font-semibold">Per-application rule overrides</h3>
          <p className="text-xs text-muted-foreground">
            Adjust rules just for this application. Defaults come from global
            HR Settings.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label>Max hotel stars</Label>
              <Input
                type="number"
                min={1}
                max={5}
                value={maxHotelStars}
                disabled={readonly}
                onChange={(e) => setMaxHotelStars(Number(e.target.value))}
              />
            </div>
            <div>
              <Label>Allowed flight class</Label>
              <Select
                value={allowedFlightClass}
                disabled={readonly}
                onValueChange={(v) =>
                  setAllowedFlightClass(v as FlightClass)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Economy">Economy</SelectItem>
                  <SelectItem value="Premium Economy">
                    Premium Economy
                  </SelectItem>
                  <SelectItem value="Business">Business</SelectItem>
                  <SelectItem value="First Class">First Class</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Per diem (EUR/day)</Label>
              <Input
                type="number"
                min={0}
                value={perDiemAmount}
                disabled={readonly}
                onChange={(e) => setPerDiemAmount(Number(e.target.value))}
              />
            </div>
            <div>
              <Label>Breakfast deduction (%)</Label>
              <Input
                type="number"
                min={0}
                max={100}
                value={breakfastDeduction}
                disabled={readonly}
                onChange={(e) => setBreakfastDeduction(Number(e.target.value))}
              />
            </div>
          </div>
          {!readonly && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateOverrides(app.id, overrides)}
            >
              Save overrides
            </Button>
          )}
        </Card>

        {!validation.valid && !readonly && (
          <Card className="p-4 space-y-3 border-destructive/50 bg-destructive/5">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-6 w-6 text-destructive shrink-0 mt-0.5" />
              <div className="space-y-2">
                <h3 className="font-semibold text-destructive">Policy Violations Detected</h3>
                <p className="text-sm text-muted-foreground">
                  The current settings violate configured travel policies. If you approve with these overrides, the application will be automatically rejected:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm text-destructive">
                  {validation.violations.map((v, idx) => (
                    <li key={idx}>{v}</li>
                  ))}
                </ul>
                <p className="text-sm font-medium text-muted-foreground mt-2">
                  Adjust the policy overrides above to resolve these violations before approving.
                </p>
              </div>
            </div>
          </Card>
        )}

        {!readonly && (
          <Card className="p-4 space-y-3">
            <h3 className="font-semibold">Decision</h3>
            {!showReason ? (
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    hrApprove(app.id, overrides);
                    onClose();
                  }}
                >
                  Approve & route to Dean
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setShowReason(true)}
                >
                  Reject
                </Button>
              </div>
            ) : (
              <>
                <Label>Rejection reason (required)</Label>
                <Textarea
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Explain why the application is rejected"
                />
                <div className="flex gap-2">
                  <Button
                    variant="destructive"
                    disabled={reason.trim().length < 5}
                    onClick={() => {
                      hrReject(app.id, reason.trim());
                      onClose();
                    }}
                  >
                    Confirm rejection
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowReason(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </>
            )}
          </Card>
        )}

        <Card className="p-4 space-y-1 max-h-40 overflow-y-auto text-xs">
          <h3 className="font-semibold text-sm mb-2">Audit trail</h3>
          {events.map((e) => (
            <div key={e.id} className="border-l-2 border-primary/40 pl-2">
              <p className="font-medium">
                {e.action}{" "}
                <span className="text-muted-foreground">({e.actorRole})</span>
              </p>
              {e.note && <p className="text-muted-foreground">{e.note}</p>}
              <p className="text-muted-foreground">
                {new Date(e.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </Card>
      </DialogContent>
    </Dialog>
  );
}
