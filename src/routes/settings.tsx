import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
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

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { currentRole, rules, updateRules } = useStgs();
  const [maxHotelStars, setMaxHotelStars] = useState(rules.maxHotelStars);
  const [allowedFlightClass, setAllowedFlightClass] = useState<FlightClass>(
    rules.allowedFlightClass,
  );
  const [perDiemAmount, setPerDiemAmount] = useState(rules.perDiemAmount);
  const [breakfastDeduction, setBreakfastDeduction] = useState(
    rules.breakfastDeduction,
  );
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setMaxHotelStars(rules.maxHotelStars);
    setAllowedFlightClass(rules.allowedFlightClass);
    setPerDiemAmount(rules.perDiemAmount);
    setBreakfastDeduction(rules.breakfastDeduction);
  }, [rules]);

  if (currentRole !== "hr") {
    return (
      <Card className="p-6">
        <p>HR Settings are only available to HR users.</p>
      </Card>
    );
  }

  const save = () => {
    updateRules({
      maxHotelStars,
      allowedFlightClass,
      perDiemAmount,
      breakfastDeduction,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          HR administration
        </p>
        <h2 className="text-2xl font-semibold">Global travel rules</h2>
        <p className="text-sm text-muted-foreground mt-1">
          These defaults apply to every new application. HR can override them
          per-application from the review modal.
        </p>
      </div>

      <Card className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label>Max hotel stars</Label>
          <Input
            type="number"
            min={1}
            max={5}
            value={maxHotelStars}
            onChange={(e) => setMaxHotelStars(Number(e.target.value))}
          />
        </div>
        <div>
          <Label>Allowed flight class</Label>
          <Select
            value={allowedFlightClass}
            onValueChange={(v) => setAllowedFlightClass(v as FlightClass)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Economy">Economy</SelectItem>
              <SelectItem value="Premium Economy">Premium Economy</SelectItem>
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
            onChange={(e) => setBreakfastDeduction(Number(e.target.value))}
          />
        </div>
        <div className="sm:col-span-2 flex items-center gap-3">
          <Button onClick={save}>Save rules</Button>
          {saved && (
            <span className="text-sm text-muted-foreground">Saved.</span>
          )}
        </div>
      </Card>
    </div>
  );
}
