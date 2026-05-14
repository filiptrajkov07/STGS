import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { useStgs } from "@/lib/stgs-store";
import type { Application } from "@/lib/stgs-types";
import { StatusBadge } from "./StatusBadge";
import { WorkflowTimeline } from "./WorkflowTimeline";
import { AlertTriangle, CheckCircle, Clock } from "lucide-react";

export function ApplicationModal({
  app,
  onClose,
}: {
  app: Application | null;
  onClose: () => void;
}) {
  const { addReceipt, receiptsFor, eventsFor, finalizeReceipts } = useStgs();
  const [merchant, setMerchant] = useState("Hotel Mitte");
  const [amount, setAmount] = useState("420");
  const [currency, setCurrency] = useState<"EUR" | "MKD" | "USD">("EUR");
  const [category, setCategory] = useState<
    "Hotel" | "Flight" | "Food" | "Other"
  >("Hotel");
  const [date, setDate] = useState("");
  const [fileName, setFileName] = useState("");
  const [breakfastIncluded, setBreakfastIncluded] = useState(false);
  const [duplicateFlag, setDuplicateFlag] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
    expired: boolean;
  } | null>(null);

  // Calculate 48-hour deadline and time remaining
  useEffect(() => {
    if (!app?.deanApprovedAt) {
      setTimeRemaining(null);
      return;
    }

    const calculateTimeRemaining = () => {
      const approvedTime = new Date(app.deanApprovedAt!).getTime();
      const deadlineTime = approvedTime + 48 * 60 * 60 * 1000; // 48 hours later
      const now = new Date().getTime();
      const remaining = deadlineTime - now;

      if (remaining <= 0) {
        setTimeRemaining({
          hours: 0,
          minutes: 0,
          seconds: 0,
          expired: true,
        });
        return;
      }

      const hours = Math.floor(remaining / (60 * 60 * 1000));
      const minutes = Math.floor(
        (remaining % (60 * 60 * 1000)) / (60 * 1000),
      );
      const seconds = Math.floor((remaining % (60 * 1000)) / 1000);

      setTimeRemaining({
        hours,
        minutes,
        seconds,
        expired: false,
      });
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);
    return () => clearInterval(interval);
  }, [app?.deanApprovedAt]);

  if (!app) return null;
  const receipts = receiptsFor(app.id);
  const events = eventsFor(app.id);

  const onSubmit = () => {
    setDuplicateFlag(false);
    const result = addReceipt({
      applicationId: app.id,
      merchant,
      amount: Number(amount),
      currency,
      category,
      date: date || app.startDate,
      fileName: fileName || "receipt.pdf",
      breakfastIncluded,
    });
    if (!result.ok) {
      setDuplicateFlag(true);
      return;
    }
    setMerchant("");
    setAmount("");
    setFileName("");
  };

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

        {duplicateFlag && (
          <div className="rounded-md border-2 border-destructive bg-destructive/10 text-destructive p-4 flex items-center gap-3">
            <AlertTriangle className="h-8 w-8 shrink-0" />
            <div>
              <p className="text-lg font-bold uppercase tracking-wide">
                Duplicate receipt detected
              </p>
              <p className="text-sm">
                A receipt with the same merchant, amount, and date already
                exists for this application.
              </p>
            </div>
          </div>
        )}

        {app.status === "rejected" && app.rejectionReason && (
          <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm">
            <p className="font-semibold text-destructive">Rejection reason</p>
            <p>{app.rejectionReason}</p>
          </div>
        )}

        <Card className="p-4 space-y-3">
          <h3 className="font-semibold">Workflow</h3>
          <WorkflowTimeline status={app.status} />
          <div className="text-sm text-muted-foreground">
            <p>
              <strong>Employee:</strong> {app.employeeName} — {app.department}
            </p>
            <p>
              <strong>Travel:</strong> {app.startDate} → {app.endDate}
            </p>
            <p>
              <strong>Hotel:</strong> {app.hotelStars}★ ·{" "}
              <strong>Flight:</strong> {app.flightClass}
            </p>
          </div>
          <div className="space-y-1 max-h-40 overflow-y-auto text-xs">
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
          </div>
        </Card>

        <Card className="p-4 space-y-3">
          <h3 className="font-semibold">Receipts</h3>

          {app.status === "approved" && app.deanApprovedAt && (
            <div
              className={`rounded-md border p-3 flex items-center gap-3 ${
                timeRemaining?.expired
                  ? "border-destructive/50 bg-destructive/5"
                  : timeRemaining?.hours === 0 && timeRemaining?.minutes < 30
                    ? "border-orange-200 bg-orange-50"
                    : "border-blue-200 bg-blue-50"
              }`}
            >
              <Clock className={`h-5 w-5 shrink-0 ${
                timeRemaining?.expired ? "text-destructive" : "text-blue-600"
              }`} />
              <div className="text-sm flex-1">
                <p className="font-semibold">
                  {timeRemaining?.expired ? "Deadline expired" : "48-hour deadline"}
                </p>
                {timeRemaining && !timeRemaining.expired && (
                  <p className="text-xs">
                    Time remaining: <strong>{timeRemaining.hours}h {timeRemaining.minutes}m {timeRemaining.seconds}s</strong>
                  </p>
                )}
                {timeRemaining?.expired && (
                  <p className="text-xs">
                    The 48-hour window for receipt submission has passed.
                  </p>
                )}
              </div>
            </div>
          )}

          {app.status !== "approved" && (
            <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm">
              <p className="font-semibold text-amber-900">Upload not available</p>
              <p className="text-amber-800">
                Receipts can only be uploaded after the application has been fully approved by both HR and the Dean.
              </p>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label>Merchant</Label>
              <Input
                value={merchant}
                onChange={(e) => setMerchant(e.target.value)}
                disabled={app.status !== "approved"}
              />
            </div>
            <div>
              <Label>Amount</Label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={app.status !== "approved"}
              />
            </div>
            <div>
              <Label>Currency</Label>
              <Select
                value={currency}
                onValueChange={(v) => setCurrency(v as typeof currency)}
                disabled={app.status !== "approved"}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="MKD">MKD</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Category</Label>
              <Select
                value={category}
                onValueChange={(v) => setCategory(v as typeof category)}
                disabled={app.status !== "approved"}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Hotel">Hotel</SelectItem>
                  <SelectItem value="Flight">Flight</SelectItem>
                  <SelectItem value="Food">Food</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Date</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                disabled={app.status !== "approved"}
              />
            </div>
            <div>
              <Label>File</Label>
              <Input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) =>
                  setFileName(e.target.files?.[0]?.name || "receipt.pdf")
                }
                disabled={app.status !== "approved"}
              />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={breakfastIncluded}
              onCheckedChange={(v) => setBreakfastIncluded(!!v)}
              disabled={app.status !== "approved"}
            />
            Breakfast included on this receipt
          </label>
          <Button onClick={onSubmit} disabled={app.status !== "approved"}>Add receipt</Button>
          <div className="space-y-1">
            {receipts.length === 0 && (
              <p className="text-sm text-muted-foreground">No receipts yet.</p>
            )}
            {receipts.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between text-sm border rounded-md px-3 py-2"
              >
                <div>
                  <p className="font-medium">
                    {r.merchant}{" "}
                    <span className="text-muted-foreground">
                      ({r.category})
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {r.date} · {r.fileName}
                  </p>
                </div>
                <span className="font-mono text-sm">
                  {r.currency} {r.amount.toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          {app.status === "approved" && !app.receiptsSubmittedAt && (
            <div className="pt-3 border-t">
              <Button
                onClick={() => {
                  finalizeReceipts(app.id);
                  onClose();
                }}
                disabled={receipts.length === 0 || timeRemaining?.expired}
                className="w-full"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Finish & Submit All Receipts
              </Button>
              {receipts.length === 0 && (
                <p className="text-xs text-muted-foreground mt-2">
                  Add at least one receipt before finishing submission.
                </p>
              )}
              {timeRemaining?.expired && (
                <p className="text-xs text-destructive mt-2">
                  The 48-hour deadline has expired. No further submissions are allowed.
                </p>
              )}
            </div>
          )}

          {app.receiptsSubmittedAt && (
            <div className="rounded-md border border-green-200 bg-green-50 p-3 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-semibold text-green-900">Receipts submitted</p>
                  <p className="text-xs text-green-800">
                    {new Date(app.receiptsSubmittedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </Card>
      </DialogContent>
    </Dialog>
  );
}
