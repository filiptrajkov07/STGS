import type { Application, GlobalRules, FlightClass } from "./stgs-types";

export interface ValidationResult {
  valid: boolean;
  violations: string[];
}

/**
 * Validates an application against policy rules.
 * HR must enforce these checks before forwarding to Dean.
 *
 * Rules checked:
 * - Hotel stars must not exceed maxHotelStars
 * - Flight class must be allowed (not higher than allowed)
 */
export function validateApplicationAgainstPolicy(
  app: Application,
  rules: GlobalRules,
): ValidationResult {
  const violations: string[] = [];

  // Check hotel stars
  const maxAllowed = app.overrides.maxHotelStars ?? rules.maxHotelStars;
  if (app.hotelStars > maxAllowed) {
    violations.push(
      `Hotel category violation: Application requests ${app.hotelStars}★ hotel, but maximum allowed is ${maxAllowed}★`,
    );
  }

  // Check flight class
  const allowedFlightClass =
    app.overrides.allowedFlightClass ?? rules.allowedFlightClass;
  if (!isFlightClassAllowed(app.flightClass, allowedFlightClass)) {
    violations.push(
      `Flight class violation: Application requests ${app.flightClass}, but maximum allowed is ${allowedFlightClass}`,
    );
  }

  return {
    valid: violations.length === 0,
    violations,
  };
}

/**
 * Determines if the requested flight class is allowed
 * based on the policy maximum.
 *
 * Flight class hierarchy (higher tier = more expensive):
 * Economy < Premium Economy < Business < First Class
 */
function isFlightClassAllowed(
  requested: FlightClass,
  allowed: FlightClass,
): boolean {
  const hierarchy: FlightClass[] = [
    "Economy",
    "Premium Economy",
    "Business",
    "First Class",
  ];

  const requestedIndex = hierarchy.indexOf(requested);
  const allowedIndex = hierarchy.indexOf(allowed);

  return requestedIndex <= allowedIndex;
}

/**
 * Generates an auto-rejection reason for policy violations
 */
export function generateAutoRejectReason(violations: string[]): string {
  return `[AUTOMATIC REJECTION - Policy Violation]\n\n${violations.join("\n\n")}\n\nThis application does not comply with configured travel policies and cannot proceed to Dean review.`;
}
