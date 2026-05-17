import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
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
import type { FlightClass } from "@/lib/stgs-types";
import {
  User,
  MapPin,
  CalendarDays,
  Hotel,
  Plane,
  FileUp,
  AlertCircle,
  ArrowRight,
  Coffee,
  BookOpen,
} from "lucide-react";

export const Route = createFileRoute("/apply")({
  component: ApplyPage,
});

function SectionCard({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-2xl border overflow-hidden"
      style={{
        background: "var(--color-card)",
        borderColor: "var(--color-border)",
        boxShadow: "0 1px 3px oklch(0.15 0.04 265 / 4%), 0 4px 12px oklch(0.15 0.04 265 / 4%)",
      }}
    >
      <div
        className="flex items-center gap-3 px-6 py-4 border-b"
        style={{
          background: "linear-gradient(135deg, oklch(0.96 0.015 258), oklch(0.98 0.008 248))",
          borderColor: "var(--color-border)",
        }}
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{
            background: "linear-gradient(135deg, oklch(0.48 0.20 264 / 15%), oklch(0.52 0.20 275 / 10%))",
            border: "1px solid oklch(0.88 0.08 258)",
          }}
        >
          <span style={{ color: "oklch(0.48 0.20 264)" }}>{icon}</span>
        </div>
        <div>
          <h3 className="text-sm font-semibold" style={{ color: "var(--color-foreground)" }}>
            {title}
          </h3>
          {description && (
            <p className="text-xs mt-0.5" style={{ color: "var(--color-muted-foreground)" }}>
              {description}
            </p>
          )}
        </div>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

function FieldGroup({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label
        className="text-xs font-semibold uppercase tracking-wide"
        style={{ color: "var(--color-muted-foreground)" }}
      >
        {label}
      </Label>
      {children}
    </div>
  );
}

function ApplyPage() {
  const { currentRole, createApplication } = useStgs();
  const navigate = useNavigate();
  const today = new Date();
  const startDefault = new Date(today.getTime() + 9 * 86400000).toISOString().slice(0, 10);
  const endDefault = new Date(today.getTime() + 12 * 86400000).toISOString().slice(0, 10);

  const [employeeName, setEmployeeName] = useState("Dr. Elena Petrova");
  const [department, setDepartment] = useState("Software Engineering");
  const [academicRole, setAcademicRole] = useState<"Teacher" | "Teaching Assistant">("Teacher");
  const [destination, setDestination] = useState("Berlin, Germany");
  const [startDate, setStartDate] = useState(startDefault);
  const [endDate, setEndDate] = useState(endDefault);
  const [hotelStars, setHotelStars] = useState(4);
  const [flightClass, setFlightClass] = useState<FlightClass>("Economy");
  const [breakfastProvided, setBreakfastProvided] = useState(false);
  const [purpose, setPurpose] = useState(
    "Presenting a peer-reviewed paper at an international software engineering conference.",
  );
  const [invitationLetter, setInvitationLetter] = useState("");
  const [error, setError] = useState("");

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

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (new Date(endDate) < new Date(startDate)) {
      setError("End date must be on or after start date.");
      return;
    }
    setError("");
    if (!invitationLetter) {
      setError("Invitation letter (PDF) is required.");
      return;
    }
    createApplication({
      employeeName,
      department,
      academicRole,
      destination,
      startDate,
      endDate,
      hotelStars,
      flightClass,
      breakfastProvided,
      purpose,
      invitationLetter,
    });
    navigate({ to: "/my-applications" });
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Page header */}
      <div className="space-y-1">
        <p className="section-label">Travel request intake</p>
        <h2
          className="text-2xl font-bold tracking-tight"
          style={{ color: "var(--color-foreground)" }}
        >
          Apply for Travel Grant
        </h2>
        <p className="text-sm" style={{ color: "var(--color-muted-foreground)" }}>
          Complete all sections below. Your application will be reviewed by HR and the Dean.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        {/* Personal info */}
        <SectionCard
          icon={<User className="h-4 w-4" />}
          title="Applicant Information"
          description="Your identity and department"
        >
          <FieldGroup>
            <Field label="Full name">
              <Input
                value={employeeName}
                onChange={(e) => setEmployeeName(e.target.value)}
                required
                className="h-9"
              />
            </Field>
            <Field label="Department">
              <Input
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                required
                className="h-9"
              />
            </Field>
            <Field label="Academic role">
              <Select
                value={academicRole}
                onValueChange={(v) => setAcademicRole(v as typeof academicRole)}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Teacher">Teacher</SelectItem>
                  <SelectItem value="Teaching Assistant">Teaching Assistant</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </FieldGroup>
        </SectionCard>

        {/* Travel details */}
        <SectionCard
          icon={<MapPin className="h-4 w-4" />}
          title="Travel Details"
          description="Destination and travel dates"
        >
          <FieldGroup>
            <Field label="Destination">
              <Input
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                required
                className="h-9"
                placeholder="City, Country"
              />
            </Field>
            <div className="sm:col-span-1" />
            <Field label="Start date">
              <div className="relative">
                <CalendarDays
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 pointer-events-none"
                  style={{ color: "var(--color-muted-foreground)" }}
                />
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    if (endDate && new Date(endDate) < new Date(e.target.value))
                      setError("End date must be on or after start date.");
                    else
                      setError("");
                  }}
                  required
                  className="h-9 pl-9"
                />
              </div>
            </Field>
            <Field label="End date">
              <div className="relative">
                <CalendarDays
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 pointer-events-none"
                  style={{ color: "var(--color-muted-foreground)" }}
                />
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    if (startDate && new Date(e.target.value) < new Date(startDate))
                      setError("End date must be on or after start date.");
                    else
                      setError("");
                  }}
                  required
                  className="h-9 pl-9"
                  style={
                    error === "End date must be on or after start date."
                      ? { borderColor: "oklch(0.55 0.23 25)" }
                      : {}
                  }
                />
              </div>
              {error === "End date must be on or after start date." && (
                <p className="text-xs font-medium mt-1" style={{ color: "oklch(0.55 0.23 25)" }}>
                  End date cannot be before the start date.
                </p>
              )}
            </Field>
          </FieldGroup>
        </SectionCard>

        {/* Accommodation & flight */}
        <SectionCard
          icon={<Hotel className="h-4 w-4" />}
          title="Accommodation & Flight"
          description="Requested travel class and hotel category"
        >
          <FieldGroup>
            <Field label="Hotel stars">
              <Select
                value={String(hotelStars)}
                onValueChange={(v) => setHotelStars(Number(v))}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">⭐⭐⭐ 3 stars</SelectItem>
                  <SelectItem value="4">⭐⭐⭐⭐ 4 stars</SelectItem>
                  <SelectItem value="5">⭐⭐⭐⭐⭐ 5 stars</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Flight class">
              <Select
                value={flightClass}
                onValueChange={(v) => setFlightClass(v as FlightClass)}
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
            </Field>
            <div className="sm:col-span-2">
              <label
                className="flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors hover:bg-[var(--color-muted)]/50"
                style={{ borderColor: "var(--color-border)" }}
              >
                <input
                  type="checkbox"
                  checked={breakfastProvided}
                  onChange={(e) => setBreakfastProvided(e.target.checked)}
                  className="w-4 h-4 accent-[oklch(0.48_0.20_264)]"
                />
                <div className="flex items-center gap-2">
                  <Coffee className="h-4 w-4" style={{ color: "var(--color-muted-foreground)" }} />
                  <span className="text-sm font-medium" style={{ color: "var(--color-foreground)" }}>
                    Breakfast included / provided
                  </span>
                  <span className="text-xs" style={{ color: "var(--color-muted-foreground)" }}>
                    (affects per diem calculation)
                  </span>
                </div>
              </label>
            </div>
          </FieldGroup>
        </SectionCard>

        {/* Purpose & documents */}
        <SectionCard
          icon={<BookOpen className="h-4 w-4" />}
          title="Purpose & Documentation"
          description="Academic justification and supporting files"
        >
          <div className="space-y-4">
            <Field label="Academic purpose">
              <Textarea
                rows={4}
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="Describe the academic purpose of this travel..."
                className="resize-none"
              />
            </Field>
            <Field label="Invitation letter (PDF)">
              <div
                className="relative rounded-xl border-2 border-dashed px-4 py-4 transition-colors hover:border-[oklch(0.48_0.20_264)] group"
                style={{ borderColor: "var(--color-border)" }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: "var(--color-muted)" }}
                  >
                    <FileUp
                      className="h-4 w-4 transition-colors group-hover:text-[oklch(0.48_0.20_264)]"
                      style={{ color: "var(--color-muted-foreground)" }}
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium" style={{ color: "var(--color-foreground)" }}>
                      {invitationLetter || "Click to upload invitation letter"}
                    </p>
                    <p className="text-xs" style={{ color: "var(--color-muted-foreground)" }}>
                      PDF files only · Required
                    </p>
                  </div>
                </div>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setInvitationLetter(e.target.files?.[0]?.name || "")}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            </Field>
          </div>
        </SectionCard>

        {/* Error */}
        {error && (
          <div
            className="flex items-center gap-3 rounded-xl border px-4 py-3"
            style={{
              background: "oklch(0.97 0.06 25)",
              borderColor: "oklch(0.90 0.10 25)",
              color: "oklch(0.45 0.18 25)",
            }}
          >
            <AlertCircle className="h-4 w-4 shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Submit */}
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs" style={{ color: "var(--color-muted-foreground)" }}>
            Your application will be submitted as <strong>Pending HR Review</strong>
          </p>
          <Button
            type="submit"
            className="gap-2 px-6"
            style={{
              background: "linear-gradient(135deg, oklch(0.48 0.20 264), oklch(0.52 0.20 275))",
              boxShadow: "0 2px 12px oklch(0.48 0.20 264 / 35%)",
              border: "none",
              color: "white",
              fontWeight: 600,
            }}
          >
            Submit Application
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
