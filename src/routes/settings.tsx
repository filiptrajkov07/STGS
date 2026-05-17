import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
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
import { useStgs } from "@/lib/stgs-store";
import type { FlightClass } from "@/lib/stgs-types";
import {
  Hotel,
  Plane,
  Coins,
  Coffee,
  Save,
  CheckCircle2,
  Settings2,
  Info,
} from "lucide-react";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

function SettingField({
  label,
  description,
  icon,
  children,
}: {
  label: string;
  description?: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div
      className="flex items-start gap-4 p-4 rounded-xl border transition-colors hover:border-[oklch(0.7_0.10_258)]"
      style={{
        background: "var(--color-card)",
        borderColor: "var(--color-border)",
      }}
    >
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
        style={{
          background: "linear-gradient(135deg, oklch(0.96 0.015 258), oklch(0.94 0.025 265))",
          border: "1px solid oklch(0.88 0.08 258)",
        }}
      >
        <span style={{ color: "oklch(0.48 0.20 264)" }}>{icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <Label
          className="text-sm font-semibold block mb-0.5"
          style={{ color: "var(--color-foreground)" }}
        >
          {label}
        </Label>
        {description && (
          <p className="text-xs mb-2" style={{ color: "var(--color-muted-foreground)" }}>
            {description}
          </p>
        )}
        {children}
      </div>
    </div>
  );
}

function SettingsPage() {
  const { currentRole, rules, updateRules } = useStgs();
  const [maxHotelStars, setMaxHotelStars] = useState(rules.maxHotelStars);
  const [allowedFlightClass, setAllowedFlightClass] = useState<FlightClass>(
    rules.allowedFlightClass,
  );
  const [perDiemAmount, setPerDiemAmount] = useState(rules.perDiemAmount);
  const [breakfastDeduction, setBreakfastDeduction] = useState(rules.breakfastDeduction);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setMaxHotelStars(rules.maxHotelStars);
    setAllowedFlightClass(rules.allowedFlightClass);
    setPerDiemAmount(rules.perDiemAmount);
    setBreakfastDeduction(rules.breakfastDeduction);
  }, [rules]);

  if (currentRole !== "hr") {
    return (
      <div
        className="rounded-2xl border p-8 text-center"
        style={{ background: "var(--color-card)", borderColor: "var(--color-border)" }}
      >
        <p className="text-sm" style={{ color: "var(--color-muted-foreground)" }}>
          HR Settings are only available to HR users.
        </p>
      </div>
    );
  }

  const save = () => {
    updateRules({ maxHotelStars, allowedFlightClass, perDiemAmount, breakfastDeduction });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Page header */}
      <div className="space-y-1">
        <p className="section-label">HR Administration</p>
        <h2
          className="text-2xl font-bold tracking-tight"
          style={{ color: "var(--color-foreground)" }}
        >
          Global Travel Rules
        </h2>
        <p className="text-sm" style={{ color: "var(--color-muted-foreground)" }}>
          Configure default travel policies. These apply to all new applications and can be overridden per-application during HR review.
        </p>
      </div>

      {/* Info banner */}
      <div
        className="flex items-start gap-3 rounded-xl border px-4 py-3"
        style={{
          background: "oklch(0.95 0.06 255)",
          borderColor: "oklch(0.88 0.08 258)",
        }}
      >
        <Info className="h-4 w-4 shrink-0 mt-0.5" style={{ color: "oklch(0.48 0.20 264)" }} />
        <p className="text-xs leading-relaxed" style={{ color: "oklch(0.35 0.12 265)" }}>
          Changes saved here become the new defaults for all subsequent applications.
          Existing applications already reviewed by HR will not be affected.
        </p>
      </div>

      {/* Settings card */}
      <div
        className="rounded-2xl border overflow-hidden"
        style={{
          background: "var(--color-card)",
          borderColor: "var(--color-border)",
          boxShadow: "0 1px 3px oklch(0.15 0.04 265 / 4%), 0 4px 12px oklch(0.15 0.04 265 / 4%)",
        }}
      >
        {/* Card header */}
        <div
          className="flex items-center gap-3 px-6 py-4 border-b"
          style={{
            background: "linear-gradient(135deg, oklch(0.96 0.015 258), oklch(0.98 0.008 248))",
            borderColor: "var(--color-border)",
          }}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, oklch(0.48 0.20 264 / 15%), oklch(0.52 0.20 275 / 10%))",
              border: "1px solid oklch(0.88 0.08 258)",
            }}
          >
            <Settings2 className="h-4 w-4" style={{ color: "oklch(0.48 0.20 264)" }} />
          </div>
          <div>
            <h3 className="text-sm font-semibold" style={{ color: "var(--color-foreground)" }}>
              Policy Configuration
            </h3>
            <p className="text-xs" style={{ color: "var(--color-muted-foreground)" }}>
              4 configurable rules
            </p>
          </div>
        </div>

        <div className="p-5 space-y-3">
          <SettingField
            label="Maximum hotel stars"
            description="Applications requesting higher-rated hotels will be flagged as policy violations."
            icon={<Hotel className="h-4 w-4" />}
          >
            <div className="flex items-center gap-3">
              <Input
                type="number"
                min={1}
                max={5}
                value={maxHotelStars}
                onChange={(e) => setMaxHotelStars(Number(e.target.value))}
                className="w-24 h-8 text-sm"
              />
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <span
                    key={n}
                    className="text-sm"
                    style={{ opacity: n <= maxHotelStars ? 1 : 0.2 }}
                  >
                    ⭐
                  </span>
                ))}
              </div>
            </div>
          </SettingField>

          <SettingField
            label="Allowed flight class"
            description="Maximum permitted flight class. Higher classes will be considered violations."
            icon={<Plane className="h-4 w-4" />}
          >
            <Select
              value={allowedFlightClass}
              onValueChange={(v) => setAllowedFlightClass(v as FlightClass)}
            >
              <SelectTrigger className="w-48 h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Economy">Economy</SelectItem>

                <SelectItem value="Business">Business</SelectItem>
                <SelectItem value="First Class">First Class</SelectItem>
              </SelectContent>
            </Select>
          </SettingField>

          <SettingField
            label="Per diem amount"
            description="Daily allowance amount for accommodation and meals."
            icon={<Coins className="h-4 w-4" />}
          >
            <div className="flex items-center gap-2">
              <div className="relative">
                <span
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold"
                  style={{ color: "var(--color-muted-foreground)" }}
                >
                  €
                </span>
                <Input
                  type="number"
                  min={0}
                  value={perDiemAmount}
                  onChange={(e) => setPerDiemAmount(Number(e.target.value))}
                  className="w-28 h-8 text-sm pl-7"
                />
              </div>
              <span className="text-xs" style={{ color: "var(--color-muted-foreground)" }}>
                per day
              </span>
            </div>
          </SettingField>

          <SettingField
            label="Breakfast deduction"
            description="Percentage deducted from per diem when breakfast is provided."
            icon={<Coffee className="h-4 w-4" />}
          >
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={0}
                max={100}
                value={breakfastDeduction}
                onChange={(e) => setBreakfastDeduction(Number(e.target.value))}
                className="w-24 h-8 text-sm"
              />
              <span className="text-xs" style={{ color: "var(--color-muted-foreground)" }}>
                % of per diem
              </span>
            </div>
          </SettingField>
        </div>

        {/* Footer action */}
        <div
          className="flex items-center justify-between px-6 py-4 border-t"
          style={{
            borderColor: "var(--color-border)",
            background: "var(--color-muted)/30",
          }}
        >
          <p className="text-xs" style={{ color: "var(--color-muted-foreground)" }}>
            Changes take effect immediately for new applications
          </p>
          <div className="flex items-center gap-3">
            {saved && (
              <span
                className="inline-flex items-center gap-1.5 text-xs font-semibold animate-fade-in"
                style={{ color: "oklch(0.45 0.14 148)" }}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Saved successfully
              </span>
            )}
            <Button
              onClick={save}
              size="sm"
              className="gap-2"
              style={{
                background: saved
                  ? "oklch(0.58 0.18 148)"
                  : "linear-gradient(135deg, oklch(0.48 0.20 264), oklch(0.52 0.20 275))",
                boxShadow: "0 2px 8px oklch(0.48 0.20 264 / 30%)",
                border: "none",
                color: "white",
                fontWeight: 600,
                transition: "background 0.3s ease",
              }}
            >
              <Save className="h-3.5 w-3.5" />
              Save rules
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
