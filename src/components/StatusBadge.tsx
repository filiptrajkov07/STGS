import type { AppStatus } from "@/lib/stgs-types";

const STATUS_CONFIG: Record<
  AppStatus,
  { label: string; bg: string; text: string; dot: string; border: string }
> = {
  draft: {
    label: "Draft",
    bg: "oklch(0.96 0.012 255)",
    text: "oklch(0.40 0.08 258)",
    dot: "oklch(0.60 0.10 258)",
    border: "oklch(0.88 0.025 258)",
  },
  pending_hr: {
    label: "Pending HR",
    bg: "oklch(0.97 0.08 75)",
    text: "oklch(0.45 0.14 72)",
    dot: "oklch(0.65 0.18 72)",
    border: "oklch(0.90 0.10 75)",
  },
  pending_dean: {
    label: "Pending Dean",
    bg: "oklch(0.95 0.06 255)",
    text: "oklch(0.42 0.16 265)",
    dot: "oklch(0.58 0.18 265)",
    border: "oklch(0.88 0.08 258)",
  },
  approved: {
    label: "Approved",
    bg: "oklch(0.96 0.07 145)",
    text: "oklch(0.38 0.14 148)",
    dot: "oklch(0.58 0.18 148)",
    border: "oklch(0.88 0.10 145)",
  },
  submitted: {
    label: "Submitted",
    bg: "oklch(0.94 0.06 255)",
    text: "oklch(0.35 0.18 265)",
    dot: "oklch(0.48 0.20 264)",
    border: "oklch(0.85 0.10 258)",
  },
  rejected: {
    label: "Rejected",
    bg: "oklch(0.97 0.06 25)",
    text: "oklch(0.45 0.18 25)",
    dot: "oklch(0.55 0.23 25)",
    border: "oklch(0.90 0.10 25)",
  },
};

export function StatusBadge({ status }: { status: AppStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold shrink-0"
      style={{
        background: cfg.bg,
        color: cfg.text,
        border: `1px solid ${cfg.border}`,
        letterSpacing: "0.02em",
      }}
    >
      <span
        className="inline-block w-1.5 h-1.5 rounded-full shrink-0"
        style={{ background: cfg.dot }}
      />
      {cfg.label}
    </span>
  );
}
