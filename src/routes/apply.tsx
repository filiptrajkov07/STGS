import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStgs } from "@/lib/stgs-store";
import type { FlightClass } from "@/lib/stgs-types";

export const Route = createFileRoute("/apply")({
  component: ApplyPage,
});

function ApplyPage() {
  const { currentRole, createApplication } = useStgs();
  const navigate = useNavigate();
  const today = new Date();
  const startDefault = new Date(today.getTime() + 9 * 86400000)
    .toISOString()
    .slice(0, 10);
  const endDefault = new Date(today.getTime() + 12 * 86400000)
    .toISOString()
    .slice(0, 10);

  const [employeeName, setEmployeeName] = useState("Dr. Elena Petrova");
  const [department, setDepartment] = useState("Software Engineering");
  const [academicRole, setAcademicRole] = useState<
    "Teacher" | "Teaching Assistant"
  >("Teacher");
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
      <Card className="p-6">
        <p>This page is only available to Academic users.</p>
      </Card>
    );
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!invitationLetter) {
      setError("Invitation letter (PDF) is required.");
      return;
    }
    if (new Date(endDate) < new Date(startDate)) {
      setError("End date must be on or after start date.");
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
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          Travel request intake
        </p>
        <h2 className="text-2xl font-semibold">Apply for travel grant</h2>
      </div>

      <Card className="p-6">
        <form onSubmit={onSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label>Employee name</Label>
            <Input
              value={employeeName}
              onChange={(e) => setEmployeeName(e.target.value)}
              required
            />
          </div>
          <div>
            <Label>Department</Label>
            <Input
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              required
            />
          </div>
          <div>
            <Label>Academic role</Label>
            <Select
              value={academicRole}
              onValueChange={(v) => setAcademicRole(v as typeof academicRole)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Teacher">Teacher</SelectItem>
                <SelectItem value="Teaching Assistant">
                  Teaching Assistant
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Destination</Label>
            <Input
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              required
            />
          </div>
          <div>
            <Label>Start date</Label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>
          <div>
            <Label>End date</Label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
          </div>
          <div>
            <Label>Invitation letter (PDF)</Label>
            <Input
              type="file"
              accept=".pdf"
              onChange={(e) =>
                setInvitationLetter(e.target.files?.[0]?.name || "")
              }
            />
          </div>
          <div>
            <Label>Hotel stars</Label>
            <Select
              value={String(hotelStars)}
              onValueChange={(v) => setHotelStars(Number(v))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3 stars</SelectItem>
                <SelectItem value="4">4 stars</SelectItem>
                <SelectItem value="5">5 stars</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Flight class</Label>
            <Select
              value={flightClass}
              onValueChange={(v) => setFlightClass(v as FlightClass)}
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
          <label className="flex items-center gap-2 text-sm sm:col-span-2">
            <input
              type="checkbox"
              checked={breakfastProvided}
              onChange={(e) => setBreakfastProvided(e.target.checked)}
            />
            Breakfast included/provided
          </label>
          <div className="sm:col-span-2">
            <Label>Academic purpose</Label>
            <Textarea
              rows={4}
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
            />
          </div>
          {error && (
            <div className="sm:col-span-2 text-sm text-destructive">
              {error}
            </div>
          )}
          <div className="sm:col-span-2">
            <Button type="submit">Submit application</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
