export type Role = "academic" | "hr" | "dean";

export type AppStatus =
  | "draft"
  | "pending_hr"
  | "pending_dean"
  | "approved"
  | "rejected";

export type FlightClass =
  | "Economy"
  | "Premium Economy"
  | "Business"
  | "First Class";

export interface PolicyOverrides {
  maxHotelStars?: number;
  allowedFlightClass?: FlightClass;
  perDiemAmount?: number;
  breakfastDeduction?: number;
}

export interface Application {
  id: string;
  reference: string;
  createdAt: string;
  employeeName: string;
  department: string;
  academicRole: "Teacher" | "Teaching Assistant";
  destination: string;
  startDate: string;
  endDate: string;
  hotelStars: number;
  flightClass: FlightClass;
  breakfastProvided: boolean;
  purpose: string;
  invitationLetter: string; // file name
  status: AppStatus;
  overrides: PolicyOverrides;
  rejectionReason?: string;
  deanApprovedAt?: string; // ISO timestamp when Dean approved
  receiptsSubmittedAt?: string; // ISO timestamp when receipts were finalized
}

export interface Receipt {
  id: string;
  applicationId: string;
  merchant: string;
  amount: number;
  currency: "EUR" | "MKD" | "USD";
  category: "Hotel" | "Flight" | "Food" | "Other";
  date: string;
  fileName: string;
  breakfastIncluded: boolean;
  createdAt: string;
}

export interface WorkflowEvent {
  id: string;
  applicationId: string;
  actorRole: Role | "system";
  action: string;
  note?: string;
  createdAt: string;
}

export interface GlobalRules {
  maxHotelStars: number;
  allowedFlightClass: FlightClass;
  perDiemAmount: number;
  breakfastDeduction: number;
}

export interface StgsState {
  currentRole: Role;
  applications: Application[];
  receipts: Receipt[];
  events: WorkflowEvent[];
  rules: GlobalRules;
}

export const STATUS_LABEL: Record<AppStatus, string> = {
  draft: "Draft",
  pending_hr: "Pending HR Review",
  pending_dean: "Pending Dean Approval",
  approved: "Approved",
  rejected: "Rejected",
};

export const STAGES: AppStatus[] = [
  "draft",
  "pending_hr",
  "pending_dean",
  "approved",
];
