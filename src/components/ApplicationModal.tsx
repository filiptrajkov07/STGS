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
import { useStgs } from "@/lib/stgs-store";
import type { Application } from "@/lib/stgs-types";
import { StatusBadge } from "./StatusBadge";
import { WorkflowTimeline } from "./WorkflowTimeline";
import { AuditTrail } from "./AuditTrail";
import { InvitationLetterViewer } from "./InvitationLetterViewer";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  Receipt,
  User,
  MapPin,
  Hotel,
  Plane,
  Upload,
  Plus,
  Send,
  Coins,
  Coffee,
  Flag,
  ScanLine,
  Sparkles,
} from "lucide-react";

function ModalSection({
  icon,
  title,
  badge,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  badge?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-2xl border overflow-hidden"
      style={{
        background: "var(--color-card)",
        borderColor: "var(--color-border)",
        boxShadow: "0 1px 3px oklch(0.15 0.04 265 / 4%)",
      }}
    >
      <div
        className="flex items-center justify-between px-5 py-3.5 border-b"
        style={{
          background: "linear-gradient(135deg, oklch(0.97 0.010 258), oklch(0.99 0.005 248))",
          borderColor: "var(--color-border)",
        }}
      >
        <div className="flex items-center gap-2.5">
          <span style={{ color: "oklch(0.48 0.20 264)" }}>{icon}</span>
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

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-[0.65rem] font-semibold uppercase tracking-wider mb-0.5" style={{ color: "var(--color-muted-foreground)" }}>
        {label}
      </p>
      <p className="text-sm font-medium" style={{ color: "var(--color-foreground)" }}>
        {value}
      </p>
    </div>
  );
}

export function ApplicationModal({
  app,
  onClose,
}: {
  app: Application | null;
  onClose: () => void;
}) {
  const { addReceipt, receiptsFor, eventsFor, finalizeReceipts, markTravelComplete, rules } = useStgs();
  const [merchant, setMerchant] = useState("Hotel Mitte");
  const [amount, setAmount] = useState("420");
  const [currency, setCurrency] = useState<"EUR" | "MKD" | "USD">("EUR");
  const [category, setCategory] = useState<"Hotel" | "Flight" | "Food" | "Other">("Hotel");
  const [date, setDate] = useState("");
  const [fileName, setFileName] = useState("");
  const [breakfastIncluded, setBreakfastIncluded] = useState(false);
  const [duplicateFlag, setDuplicateFlag] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ merchant?: string; amount?: string; file?: string }>({});
  const [flightClassError, setFlightClassError] = useState("");
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [isOcrFile, setIsOcrFile] = useState(false);
  const [showInvitationLetter, setShowInvitationLetter] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
    expired: boolean;
  } | null>(null);

  useEffect(() => {
    if (!app?.deanApprovedAt) {
      setTimeRemaining(null);
      return;
    }
    const calculateTimeRemaining = () => {
      const approvedTime = new Date(app.deanApprovedAt!).getTime();
      const deadlineTime = approvedTime + 48 * 60 * 60 * 1000;
      const now = new Date().getTime();
      const remaining = deadlineTime - now;
      if (remaining <= 0) {
        setTimeRemaining({ hours: 0, minutes: 0, seconds: 0, expired: true });
        return;
      }
      setTimeRemaining({
        hours: Math.floor(remaining / (60 * 60 * 1000)),
        minutes: Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000)),
        seconds: Math.floor((remaining % (60 * 1000)) / 1000),
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
  const travelAlreadyFinished = events.some((e) => e.action === "Travel marked as completed");

  const runDemoOcrScan = () => {
    if (!canSubmitReceipts || scanning) return;
    setScanning(true);
    setFieldErrors({});
    setDuplicateFlag(false);
    setFlightClassError("");

    const merchants: Record<typeof category, string[]> = {
      Hotel: ["Hotel Mitte", "Park Inn Berlin", "Hilton Garden Inn", "Marriott Berlin", "Hotel Adlon Kempinski", "NH Collection"],
      Flight: ["Lufthansa", "Wizz Air", "Ryanair", "Austrian Airlines", "Air France", "KLM", "Turkish Airlines"],
      Food: ["Restaurant Zur Letzten Instanz", "Curry 36", "Cafe Einstein", "Burgermeister", "Mustafa's Kebap", "Vapiano", "Block House"],
      Other: ["Taxi Berlin", "BVG Public Transport", "DB Bahn Ticket", "Conference Fee", "Uber Trip", "Print Shop"],
    };
    const amountRanges: Record<typeof category, [number, number]> = {
      Hotel: [180, 650],
      Flight: [120, 480],
      Food: [12, 95],
      Other: [8, 75],
    };
    const currencies: Array<"EUR" | "MKD" | "USD"> = ["EUR", "EUR", "EUR", "USD"];
    const categories: Array<typeof category> = ["Hotel", "Flight", "Food", "Other"];

    const pickedCategory = categories[Math.floor(Math.random() * categories.length)];
    const pickedMerchant = merchants[pickedCategory][Math.floor(Math.random() * merchants[pickedCategory].length)];
    const [lo, hi] = amountRanges[pickedCategory];
    const pickedAmount = (Math.random() * (hi - lo) + lo).toFixed(2);
    const pickedCurrency = currencies[Math.floor(Math.random() * currencies.length)];

    // Pick a date within the travel window
    const start = new Date(app.startDate);
    const end = new Date(app.endDate);
    const days = Math.max(0, Math.round((end.getTime() - start.getTime()) / 86400000));
    const offset = Math.floor(Math.random() * (days + 1));
    const pickedDate = new Date(start.getTime() + offset * 86400000).toISOString().slice(0, 10);

    // Simulate scanning delay for realism
    setTimeout(() => {
      setMerchant(pickedMerchant);
      setAmount(pickedAmount);
      setCurrency(pickedCurrency);
      setCategory(pickedCategory);
      setDate(pickedDate);
      const slug = pickedMerchant.replace(/[^a-z0-9]+/gi, "_").toLowerCase().slice(0, 20);
      setFileName(`receipt_${slug}_${pickedDate}.jpg`);
      setIsOcrFile(true);
      setScanning(false);
    }, 900);
  };

  const onSubmit = () => {
    setDuplicateFlag(false);
    setFlightClassError("");
    const errors: { merchant?: string; amount?: string; file?: string } = {};
    if (!merchant.trim()) errors.merchant = "Merchant name is required.";
    if (!amount || Number(amount) <= 0) errors.amount = "A valid amount greater than 0 is required.";
    if (!fileName.trim()) errors.file = "A receipt file is required as proof.";
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});

    // Flight receipt: reject if the application's flight class exceeds policy
    if (category === "Flight" && app) {
      const hierarchy: import("@/lib/stgs-types").FlightClass[] = ["Economy", "Business", "First Class"];
      const allowed = app.overrides.allowedFlightClass ?? rules.allowedFlightClass;
      const requestedIdx = hierarchy.indexOf(app.flightClass);
      const allowedIdx = hierarchy.indexOf(allowed);
      if (requestedIdx > allowedIdx) {
        setFlightClassError(
          `Flight class violation: this application requested ${app.flightClass}, but policy only allows up to ${allowed}. This flight receipt cannot be accepted.`,
        );
        return;
      }
    }
    const result = addReceipt({
      applicationId: app.id,
      merchant,
      amount: Number(amount),
      currency,
      category,
      date: date || app.startDate,
      fileName: fileName,
      breakfastIncluded,
    });
    if (!result.ok) {
      setDuplicateFlag(true);
      return;
    }
    setMerchant("");
    setAmount("");
    setFileName("");
    setIsOcrFile(false);
  };

  const isApproved = app.status === "approved";
  const canSubmitReceipts = isApproved && travelAlreadyFinished;

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
        {/* Modal header */}
        <div
          className="sticky top-0 z-10 px-6 py-5 border-b"
          style={{
            background: "linear-gradient(135deg, oklch(0.48 0.20 264), oklch(0.52 0.20 278))",
            borderColor: "oklch(0.48 0.20 264 / 40%)",
          }}
        >
          <DialogHeader>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p
                  className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] mb-1"
                  style={{ color: "oklch(0.85 0.10 260)" }}
                >
                  {app.reference}
                </p>
                <DialogTitle className="text-xl font-bold text-white tracking-tight">
                  {app.destination}
                </DialogTitle>
                <p className="text-sm mt-0.5" style={{ color: "oklch(0.90 0.08 258)" }}>
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
          {/* Rejection notice */}
          {app.status === "rejected" && app.rejectionReason && (
            <div
              className="flex items-start gap-3 rounded-xl border px-4 py-3"
              style={{
                background: "oklch(0.97 0.06 25)",
                borderColor: "oklch(0.90 0.10 25)",
              }}
            >
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" style={{ color: "oklch(0.55 0.23 25)" }} />
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

          {/* Workflow overview */}
          <ModalSection
            icon={<MapPin className="h-4 w-4" />}
            title="Application Overview"
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
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 border-t" style={{ borderColor: "var(--color-border)" }}>
                <DetailRow
                  label="Employee"
                  value={
                    <span className="flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5" style={{ color: "var(--color-muted-foreground)" }} />
                      {app.employeeName}
                    </span>
                  }
                />
                <DetailRow label="Department" value={app.department} />
                <DetailRow label="Role" value={app.academicRole} />
                <DetailRow
                  label="Travel dates"
                  value={`${app.startDate} → ${app.endDate}`}
                />
                <DetailRow
                  label="Hotel"
                  value={
                    <span className="flex items-center gap-1.5">
                      <Hotel className="h-3.5 w-3.5" style={{ color: "var(--color-muted-foreground)" }} />
                      {app.hotelStars} stars
                    </span>
                  }
                />
                <DetailRow
                  label="Flight"
                  value={
                    <span className="flex items-center gap-1.5">
                      <Plane className="h-3.5 w-3.5" style={{ color: "var(--color-muted-foreground)" }} />
                      {app.flightClass}
                    </span>
                  }
                />
              </div>
            </div>
          </ModalSection>

          {/* Per diem calculation — shown after dean approval */}
          {(app.status === "approved" || app.status === "submitted") && (() => {
            const start = new Date(app.startDate);
            const end = new Date(app.endDate);
            const days = Math.max(1, Math.round((end.getTime() - start.getTime()) / 86400000) + 1);
            const ratePerDay = app.overrides.perDiemAmount ?? rules.perDiemAmount;
            const deductionPct = app.overrides.breakfastDeduction ?? rules.breakfastDeduction;
            const hasBreakfast = app.breakfastProvided;
            const deductionAmount = hasBreakfast ? (ratePerDay * deductionPct) / 100 : 0;
            const effectiveRate = ratePerDay - deductionAmount;
            const total = effectiveRate * days;

            return (
              <ModalSection
                icon={<Coins className="h-4 w-4" />}
                title="Per Diem Calculation"
                badge={
                  <span
                    className="text-[0.65rem] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
                    style={{ background: "oklch(0.96 0.07 145)", color: "oklch(0.38 0.14 148)" }}
                  >
                    Approved
                  </span>
                }
              >
                <div className="space-y-3">
                  {/* Rate breakdown */}
                  <div
                    className="rounded-xl border divide-y overflow-hidden"
                    style={{ borderColor: "var(--color-border)" }}
                  >
                    <div className="flex items-center justify-between px-4 py-2.5">
                      <span className="text-sm" style={{ color: "var(--color-muted-foreground)" }}>
                        Base rate (HR approved)
                      </span>
                      <span className="text-sm font-semibold font-mono" style={{ color: "var(--color-foreground)" }}>
                        €{ratePerDay.toFixed(2)} / day
                      </span>
                    </div>

                    {hasBreakfast && (
                      <div className="flex items-center justify-between px-4 py-2.5"
                        style={{ background: "oklch(0.97 0.05 75 / 50%)" }}
                      >
                        <span className="flex items-center gap-2 text-sm" style={{ color: "oklch(0.45 0.14 72)" }}>
                          <Coffee className="h-3.5 w-3.5" />
                          Breakfast deduction ({deductionPct}%)
                        </span>
                        <span className="text-sm font-semibold font-mono" style={{ color: "oklch(0.45 0.14 72)" }}>
                          −€{deductionAmount.toFixed(2)} / day
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between px-4 py-2.5"
                      style={{ background: "oklch(0.97 0.010 258)" }}
                    >
                      <span className="text-sm font-medium" style={{ color: "var(--color-foreground)" }}>
                        Effective rate
                      </span>
                      <span className="text-sm font-bold font-mono" style={{ color: "oklch(0.48 0.20 264)" }}>
                        €{effectiveRate.toFixed(2)} / day
                      </span>
                    </div>

                    <div className="flex items-center justify-between px-4 py-2.5"
                      style={{ background: "oklch(0.97 0.010 258)" }}
                    >
                      <span className="text-sm" style={{ color: "var(--color-muted-foreground)" }}>
                        Travel duration
                      </span>
                      <span className="text-sm font-semibold" style={{ color: "var(--color-foreground)" }}>
                        {days} day{days !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>

                  {/* Total */}
                  <div
                    className="flex items-center justify-between rounded-xl px-4 py-3 border"
                    style={{
                      background: "linear-gradient(135deg, oklch(0.96 0.015 258), oklch(0.94 0.025 265))",
                      borderColor: "oklch(0.88 0.08 258)",
                    }}
                  >
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-muted-foreground)" }}>
                        Total per diem entitlement
                      </p>
                      {hasBreakfast && (
                        <p className="text-xs mt-0.5" style={{ color: "var(--color-muted-foreground)" }}>
                          Breakfast deduction applied ({deductionPct}% off each day)
                        </p>
                      )}
                    </div>
                    <p
                      className="text-2xl font-bold font-mono tracking-tight"
                      style={{ color: "oklch(0.48 0.20 264)" }}
                    >
                      €{total.toFixed(2)}
                    </p>
                  </div>
                </div>
              </ModalSection>
            );
          })()}

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

          {/* Receipts section */}
          {app.receiptsSubmittedAt ? (
            <div
              className="flex items-center gap-4 rounded-2xl border px-5 py-4"
              style={{
                background: "oklch(0.96 0.07 145)",
                borderColor: "oklch(0.88 0.10 145)",
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: "oklch(0.58 0.18 148)", boxShadow: "0 2px 8px oklch(0.58 0.18 148 / 30%)" }}
              >
                <CheckCircle2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-sm" style={{ color: "oklch(0.30 0.12 148)" }}>
                  Receipts submitted successfully
                </p>
                <p className="text-xs mt-0.5" style={{ color: "oklch(0.45 0.12 148)" }}>
                  {new Date(app.receiptsSubmittedAt).toLocaleString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ) : (
            <ModalSection
              icon={<Receipt className="h-4 w-4" />}
              title="Expense Receipts"
              badge={
                receipts.length > 0 ? (
                  <span
                    className="text-[0.65rem] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
                    style={{
                      background: "oklch(0.94 0.04 265)",
                      color: "oklch(0.4 0.15 265)",
                    }}
                  >
                    {receipts.length} added
                  </span>
                ) : undefined
              }
            >
              <div className="space-y-4">
                {/* Demo: mark travel as completed to reset 48h window */}
                {isApproved && !travelAlreadyFinished && (
                  <div
                    className="rounded-xl border px-4 py-3 flex items-center justify-between gap-3"
                    style={{
                      background: "oklch(0.97 0.010 258)",
                      borderColor: "oklch(0.88 0.025 258)",
                      borderStyle: "dashed",
                    }}
                  >
                    <div>
                      <p className="text-xs font-semibold" style={{ color: "var(--color-foreground)" }}>
                        Demo: simulate travel completion
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--color-muted-foreground)" }}>
                        Resets the 48-hour receipt window to start from now.
                      </p>
                    </div>
                    <button
                      onClick={() => markTravelComplete(app.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all hover:opacity-90 hover:scale-105"
                      style={{
                        background: "linear-gradient(135deg, oklch(0.48 0.20 264), oklch(0.52 0.20 275))",
                        color: "white",
                        boxShadow: "0 2px 8px oklch(0.48 0.20 264 / 30%)",
                      }}
                    >
                      <Flag className="h-3.5 w-3.5" />
                      Travel Finished
                    </button>
                  </div>
                )}

                {/* 48h deadline countdown — only after travel is marked finished */}
                {isApproved && travelAlreadyFinished && app.deanApprovedAt && (
                  <div
                    className="flex items-center gap-3 rounded-xl border px-4 py-3"
                    style={{
                      background: timeRemaining?.expired
                        ? "oklch(0.97 0.06 25)"
                        : timeRemaining?.hours === 0 && (timeRemaining?.minutes ?? 60) < 30
                        ? "oklch(0.97 0.07 60)"
                        : "oklch(0.95 0.06 255)",
                      borderColor: timeRemaining?.expired
                        ? "oklch(0.90 0.10 25)"
                        : timeRemaining?.hours === 0 && (timeRemaining?.minutes ?? 60) < 30
                        ? "oklch(0.90 0.10 65)"
                        : "oklch(0.88 0.08 258)",
                    }}
                  >
                    <Clock
                      className="h-4 w-4 shrink-0"
                      style={{
                        color: timeRemaining?.expired
                          ? "oklch(0.55 0.23 25)"
                          : "oklch(0.48 0.20 264)",
                      }}
                    />
                    <div className="flex-1">
                      <p
                        className="text-sm font-semibold"
                        style={{
                          color: timeRemaining?.expired
                            ? "oklch(0.40 0.18 25)"
                            : "oklch(0.35 0.12 265)",
                        }}
                      >
                        {timeRemaining?.expired ? "Submission deadline expired" : "48-hour submission window"}
                      </p>
                      {timeRemaining && !timeRemaining.expired && (
                        <p className="text-xs mt-0.5" style={{ color: "var(--color-muted-foreground)" }}>
                          Time remaining:{" "}
                          <strong>
                            {timeRemaining.hours}h {timeRemaining.minutes}m {timeRemaining.seconds}s
                          </strong>
                        </p>
                      )}
                      {timeRemaining?.expired && (
                        <p className="text-xs mt-0.5" style={{ color: "oklch(0.45 0.15 25)" }}>
                          The 48-hour window for receipt submission has passed.
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Not yet approved notice */}
                {!isApproved && (
                  <div
                    className="flex items-center gap-3 rounded-xl border px-4 py-3"
                    style={{
                      background: "oklch(0.97 0.08 75)",
                      borderColor: "oklch(0.90 0.10 75)",
                    }}
                  >
                    <Clock className="h-4 w-4 shrink-0" style={{ color: "oklch(0.55 0.16 72)" }} />
                    <div>
                      <p className="text-sm font-semibold" style={{ color: "oklch(0.38 0.14 72)" }}>
                        Awaiting approval
                      </p>
                      <p className="text-xs" style={{ color: "oklch(0.45 0.12 72)" }}>
                        Receipts can only be uploaded after both HR and Dean approval.
                      </p>
                    </div>
                  </div>
                )}

                {/* Duplicate warning */}
                {duplicateFlag && (
                  <div
                    className="flex items-start gap-3 rounded-xl border px-4 py-3"
                    style={{
                      background: "oklch(0.97 0.06 25)",
                      borderColor: "oklch(0.90 0.10 25)",
                    }}
                  >
                    <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" style={{ color: "oklch(0.55 0.23 25)" }} />
                    <div>
                      <p className="text-sm font-semibold" style={{ color: "oklch(0.40 0.18 25)" }}>
                        Duplicate receipt
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: "oklch(0.45 0.15 25)" }}>
                        A receipt with the same merchant, amount, and date already exists.
                      </p>
                    </div>
                  </div>
                )}

                {/* Flight class violation error */}
                {flightClassError && (
                  <div
                    className="flex items-start gap-3 rounded-xl border px-4 py-3"
                    style={{
                      background: "oklch(0.97 0.06 25)",
                      borderColor: "oklch(0.90 0.10 25)",
                    }}
                  >
                    <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" style={{ color: "oklch(0.55 0.23 25)" }} />
                    <div>
                      <p className="text-sm font-semibold" style={{ color: "oklch(0.40 0.18 25)" }}>
                        Flight receipt rejected
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: "oklch(0.45 0.15 25)" }}>
                        {flightClassError}
                      </p>
                    </div>
                  </div>
                )}

                {/* Demo OCR scan banner */}
                {canSubmitReceipts && (
                  <div
                    className="relative overflow-hidden rounded-xl border px-4 py-3 flex items-center justify-between gap-3"
                    style={{
                      background: "linear-gradient(135deg, oklch(0.95 0.08 285 / 70%), oklch(0.96 0.06 265 / 50%))",
                      borderColor: "oklch(0.85 0.12 280)",
                    }}
                  >
                    {scanning && (
                      <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          background:
                            "linear-gradient(90deg, transparent 0%, oklch(0.55 0.22 285 / 25%) 50%, transparent 100%)",
                          animation: "shine 1.2s linear infinite",
                        }}
                      />
                    )}
                    <div className="flex items-center gap-2.5 relative">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{
                          background: "linear-gradient(135deg, oklch(0.48 0.20 264), oklch(0.55 0.22 285))",
                          boxShadow: "0 2px 8px oklch(0.48 0.20 264 / 30%)",
                        }}
                      >
                        <ScanLine className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold flex items-center gap-1.5" style={{ color: "oklch(0.30 0.16 280)" }}>
                          {scanning ? "Scanning receipt…" : "Auto-fill with OCR"}
                          {!scanning && <Sparkles className="h-3 w-3" style={{ color: "oklch(0.55 0.22 285)" }} />}
                        </p>
                        <p className="text-[0.7rem] mt-0.5" style={{ color: "oklch(0.45 0.10 270)" }}>
                          {scanning
                            ? "Extracting merchant, amount, date…"
                            : "Demo: simulate scanning a paper receipt"}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={runDemoOcrScan}
                      disabled={scanning}
                      className="relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all hover:opacity-90 hover:scale-105 disabled:opacity-60 disabled:hover:scale-100"
                      style={{
                        background: "linear-gradient(135deg, oklch(0.48 0.20 264), oklch(0.55 0.22 285))",
                        color: "white",
                        boxShadow: "0 2px 8px oklch(0.48 0.20 264 / 35%)",
                      }}
                    >
                      <ScanLine className={scanning ? "h-3.5 w-3.5 animate-pulse" : "h-3.5 w-3.5"} />
                      {scanning ? "Scanning…" : "Scan Receipt"}
                    </button>
                  </div>
                )}

                {/* Receipt form */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-muted-foreground)" }}>
                      Merchant
                    </Label>
                    <Input
                      value={merchant}
                      onChange={(e) => { setMerchant(e.target.value); setFieldErrors((p) => ({ ...p, merchant: undefined })); }}
                      disabled={!canSubmitReceipts}
                      className="h-9"
                      style={fieldErrors.merchant ? { borderColor: "oklch(0.55 0.23 25)" } : {}}
                    />
                    {fieldErrors.merchant && (
                      <p className="text-xs font-medium" style={{ color: "oklch(0.55 0.23 25)" }}>
                        {fieldErrors.merchant}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-muted-foreground)" }}>
                      Amount
                    </Label>
                    <Input
                      type="number"
                      value={amount}
                      onChange={(e) => { setAmount(e.target.value); setFieldErrors((p) => ({ ...p, amount: undefined })); }}
                      disabled={!canSubmitReceipts}
                      className="h-9"
                      style={fieldErrors.amount ? { borderColor: "oklch(0.55 0.23 25)" } : {}}
                    />
                    {fieldErrors.amount && (
                      <p className="text-xs font-medium" style={{ color: "oklch(0.55 0.23 25)" }}>
                        {fieldErrors.amount}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-muted-foreground)" }}>
                      Currency
                    </Label>
                    <Select
                      value={currency}
                      onValueChange={(v) => setCurrency(v as typeof currency)}
                      disabled={!canSubmitReceipts}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EUR">EUR — Euro</SelectItem>
                        <SelectItem value="MKD">MKD — Macedonian Denar</SelectItem>
                        <SelectItem value="USD">USD — US Dollar</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-muted-foreground)" }}>
                      Category
                    </Label>
                    <Select
                      value={category}
                      onValueChange={(v) => { setCategory(v as typeof category); setFlightClassError(""); }}
                      disabled={!canSubmitReceipts}
                    >
                      <SelectTrigger className="h-9">
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
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-muted-foreground)" }}>
                      Date
                    </Label>
                    <Input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      disabled={!canSubmitReceipts}
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label className="text-xs font-semibold uppercase tracking-wide flex items-center gap-1" style={{ color: "var(--color-muted-foreground)" }}>
                      Receipt file
                      <span style={{ color: "oklch(0.55 0.23 25)" }}>*</span>
                      <span className="font-normal normal-case ml-1" style={{ color: "var(--color-muted-foreground)" }}>
                        — required as proof
                      </span>
                    </Label>
                    <div
                      className="relative rounded-xl border-2 border-dashed px-4 py-3 transition-colors hover:border-[oklch(0.48_0.20_264)]"
                      style={{
                        borderColor: fieldErrors.file
                          ? "oklch(0.55 0.23 25)"
                          : fileName
                          ? "oklch(0.58 0.18 148)"
                          : "var(--color-border)",
                        background: fileName ? "oklch(0.96 0.07 145 / 40%)" : "transparent",
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                          style={{
                            background: fileName ? "oklch(0.58 0.18 148)" : "var(--color-muted)",
                          }}
                        >
                          {fileName ? (
                            <CheckCircle2 className="h-4 w-4 text-white" />
                          ) : (
                            <Upload className="h-4 w-4" style={{ color: "var(--color-muted-foreground)" }} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p
                              className="text-sm font-medium truncate"
                              style={{
                                color: fileName ? "oklch(0.30 0.12 148)" : "var(--color-foreground)",
                              }}
                            >
                              {fileName || "Click to upload your receipt"}
                            </p>
                            {fileName && isOcrFile && (
                              <span
                                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[0.6rem] font-bold uppercase tracking-wider shrink-0"
                                style={{
                                  background: "linear-gradient(135deg, oklch(0.48 0.20 264), oklch(0.55 0.22 285))",
                                  color: "white",
                                  boxShadow: "0 1px 4px oklch(0.48 0.20 264 / 35%)",
                                }}
                              >
                                <ScanLine className="h-2.5 w-2.5" />
                                OCR
                              </span>
                            )}
                          </div>
                          <p className="text-xs" style={{ color: "var(--color-muted-foreground)" }}>
                            {fileName && isOcrFile
                              ? "Auto-captured from OCR scan · attached as proof"
                              : "PDF, JPG, or PNG · proof of expense"}
                          </p>
                        </div>
                      </div>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => {
                          const name = e.target.files?.[0]?.name || "";
                          setFileName(name);
                          setIsOcrFile(false);
                          if (name) setFieldErrors((p) => ({ ...p, file: undefined }));
                        }}
                        disabled={!canSubmitReceipts}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                      />
                    </div>
                    {fieldErrors.file && (
                      <p className="text-xs font-medium" style={{ color: "oklch(0.55 0.23 25)" }}>
                        {fieldErrors.file}
                      </p>
                    )}
                  </div>
                </div>

                <Button
                  onClick={onSubmit}
                  disabled={!canSubmitReceipts}
                  size="sm"
                  className="gap-2"
                  style={
                    canSubmitReceipts
                      ? {
                          background: "linear-gradient(135deg, oklch(0.48 0.20 264), oklch(0.52 0.20 275))",
                          border: "none",
                          color: "white",
                          fontWeight: 600,
                          boxShadow: "0 2px 8px oklch(0.48 0.20 264 / 30%)",
                        }
                      : {}
                  }
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add receipt
                </Button>

                {/* Receipts list */}
                {receipts.length > 0 && (
                  <div className="space-y-2 pt-2 border-t" style={{ borderColor: "var(--color-border)" }}>
                    <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-muted-foreground)" }}>
                      Added receipts ({receipts.length})
                    </p>
                    {receipts.map((r) => (
                      <div
                        key={r.id}
                        className="flex items-center justify-between rounded-xl border px-3 py-2.5"
                        style={{
                          background: "var(--color-muted)",
                          borderColor: "var(--color-border)",
                        }}
                      >
                        <div>
                          <p className="text-sm font-medium" style={{ color: "var(--color-foreground)" }}>
                            {r.merchant}{" "}
                            <span
                              className="text-xs font-normal"
                              style={{ color: "var(--color-muted-foreground)" }}
                            >
                              ({r.category})
                            </span>
                          </p>
                          <p className="text-xs mt-0.5" style={{ color: "var(--color-muted-foreground)" }}>
                            {r.date} · {r.fileName}
                          </p>
                        </div>
                        <span
                          className="font-mono text-sm font-semibold"
                          style={{ color: "oklch(0.48 0.20 264)" }}
                        >
                          {r.currency} {r.amount.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {receipts.length === 0 && canSubmitReceipts && (
                  <p className="text-xs" style={{ color: "var(--color-muted-foreground)" }}>
                    No receipts added yet.
                  </p>
                )}

                {/* Finalize button */}
                {canSubmitReceipts && !app.receiptsSubmittedAt && (
                  <div className="pt-3 border-t space-y-3" style={{ borderColor: "var(--color-border)" }}>
                    {!confirmSubmit ? (
                      <Button
                        onClick={() => setConfirmSubmit(true)}
                        disabled={timeRemaining?.expired}
                        className="w-full gap-2"
                        style={
                          !timeRemaining?.expired
                            ? {
                                background: "linear-gradient(135deg, oklch(0.48 0.18 148), oklch(0.55 0.18 155))",
                                border: "none",
                                color: "white",
                                fontWeight: 600,
                                boxShadow: "0 2px 12px oklch(0.48 0.18 148 / 35%)",
                              }
                            : {}
                        }
                      >
                        <Send className="h-4 w-4" />
                        Finish & Submit All Receipts
                      </Button>
                    ) : (
                      <div
                        className="rounded-xl border p-4 space-y-3"
                        style={{
                          background: "oklch(0.97 0.06 25 / 50%)",
                          borderColor: "oklch(0.90 0.10 25)",
                        }}
                      >
                        <div className="flex items-start gap-2.5">
                          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" style={{ color: "oklch(0.55 0.23 25)" }} />
                          <div>
                            <p className="text-sm font-semibold" style={{ color: "oklch(0.38 0.18 25)" }}>
                              Are you sure you want to submit?
                            </p>
                            <p className="text-xs mt-0.5" style={{ color: "oklch(0.45 0.15 25)" }}>
                              {receipts.length === 0
                                ? "You have not added any receipts. This action is final and cannot be undone."
                                : `You are about to submit ${receipts.length} receipt${receipts.length !== 1 ? "s" : ""}. This action is final and cannot be undone.`}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => {
                              finalizeReceipts(app.id);
                              onClose();
                            }}
                            className="gap-2 flex-1"
                            style={{
                              background: "oklch(0.48 0.18 148)",
                              border: "none",
                              color: "white",
                              fontWeight: 600,
                            }}
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Yes, submit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setConfirmSubmit(false)}
                            className="flex-1"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                    {timeRemaining?.expired && (
                      <p className="text-xs text-center" style={{ color: "oklch(0.55 0.23 25)" }}>
                        The 48-hour deadline has expired.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </ModalSection>
          )}
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
