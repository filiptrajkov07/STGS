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
import { Card } from "@/components/ui/card";
import { useStgs } from "@/lib/stgs-store";
import type { Application } from "@/lib/stgs-types";
import { StatusBadge } from "./StatusBadge";
import { WorkflowTimeline } from "./WorkflowTimeline";

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

  if (!app) return null;
  const events = eventsFor(app.id);
  const readonly = app.status !== "pending_dean";

  const detail = (label: string, value: React.ReactNode) => (
    <div>
      <p className="text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="text-sm">{value}</p>
    </div>
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

        <Card className="p-4 space-y-3">
          <WorkflowTimeline status={app.status} />
          <div className="grid grid-cols-2 gap-3">
            {detail("Employee", app.employeeName)}
            {detail("Department", app.department)}
            {detail("Academic role", app.academicRole)}
            {detail("Destination", app.destination)}
            {detail("Start date", app.startDate)}
            {detail("End date", app.endDate)}
            {detail("Hotel", `${app.hotelStars} stars`)}
            {detail("Flight class", app.flightClass)}
            {detail(
              "Invitation letter",
              app.invitationLetter || "Not attached",
            )}
            {detail(
              "HR overrides",
              Object.keys(app.overrides).length
                ? `${app.overrides.maxHotelStars ?? "—"}★ · ${app.overrides.allowedFlightClass ?? "—"} · €${app.overrides.perDiemAmount ?? "—"}/day`
                : "Defaults applied",
            )}
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Academic purpose
            </p>
            <p className="text-sm whitespace-pre-wrap">{app.purpose}</p>
          </div>
          <p className="text-xs italic text-muted-foreground">
            All fields are read-only. Dean can only Accept or Reject.
          </p>
        </Card>

        {!readonly && (
          <Card className="p-4 space-y-3">
            <h3 className="font-semibold">Final decision</h3>
            {!showReason ? (
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    deanApprove(app.id);
                    onClose();
                  }}
                >
                  Accept
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
                <Label>
                  Rejection reason{" "}
                  <span className="text-destructive">(required)</span>
                </Label>
                <Textarea
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Provide a clear reason for rejection"
                />
                <div className="flex gap-2">
                  <Button
                    variant="destructive"
                    disabled={reason.trim().length < 5}
                    onClick={() => {
                      deanReject(app.id, reason.trim());
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

        {readonly && app.rejectionReason && (
          <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm">
            <p className="font-semibold text-destructive">Rejection reason</p>
            <p>{app.rejectionReason}</p>
          </div>
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
