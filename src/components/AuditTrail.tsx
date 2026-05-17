import {
  CheckCircle2,
  AlertCircle,
  Clock,
  FileText,
  User,
  Shield,
  Send,
  Crown,
} from "lucide-react";
import type { WorkflowEvent } from "@/lib/stgs-types";

const ACTION_CONFIG: Record<
  string,
  { icon: React.ReactNode; bg: string; text: string; border: string }
> = {
  "Application submitted": {
    icon: <Send className="h-3.5 w-3.5" />,
    bg: "oklch(0.95 0.06 255)",
    text: "oklch(0.42 0.16 265)",
    border: "oklch(0.88 0.08 258)",
  },
  "HR approved": {
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
    bg: "oklch(0.96 0.07 145)",
    text: "oklch(0.38 0.14 148)",
    border: "oklch(0.88 0.10 145)",
  },
  "HR rejected": {
    icon: <AlertCircle className="h-3.5 w-3.5" />,
    bg: "oklch(0.97 0.06 25)",
    text: "oklch(0.45 0.18 25)",
    border: "oklch(0.90 0.10 25)",
  },
  "Dean approved": {
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
    bg: "oklch(0.96 0.07 145)",
    text: "oklch(0.38 0.14 148)",
    border: "oklch(0.88 0.10 145)",
  },
  "Dean rejected": {
    icon: <AlertCircle className="h-3.5 w-3.5" />,
    bg: "oklch(0.97 0.06 25)",
    text: "oklch(0.45 0.18 25)",
    border: "oklch(0.90 0.10 25)",
  },
  "Receipt uploaded": {
    icon: <FileText className="h-3.5 w-3.5" />,
    bg: "oklch(0.97 0.08 75)",
    text: "oklch(0.45 0.14 72)",
    border: "oklch(0.90 0.10 75)",
  },
  "Receipts finalized and submitted": {
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
    bg: "oklch(0.96 0.07 145)",
    text: "oklch(0.38 0.14 148)",
    border: "oklch(0.88 0.10 145)",
  },
  "HR auto-rejected (policy violation)": {
    icon: <AlertCircle className="h-3.5 w-3.5" />,
    bg: "oklch(0.97 0.06 25)",
    text: "oklch(0.45 0.18 25)",
    border: "oklch(0.90 0.10 25)",
  },
};

const DEFAULT_CONFIG = {
  icon: <Clock className="h-3.5 w-3.5" />,
  bg: "oklch(0.96 0.012 255)",
  text: "oklch(0.40 0.08 258)",
  border: "oklch(0.88 0.025 258)",
};

const ACTOR_CONFIG: Record<string, { icon: React.ReactNode; label: string; bg: string; text: string }> = {
  academic: {
    icon: <User className="h-3 w-3" />,
    label: "Academic",
    bg: "oklch(0.95 0.06 255)",
    text: "oklch(0.42 0.16 265)",
  },
  hr: {
    icon: <Shield className="h-3 w-3" />,
    label: "HR",
    bg: "oklch(0.97 0.08 75)",
    text: "oklch(0.45 0.14 72)",
  },
  dean: {
    icon: <Crown className="h-3 w-3" />,
    label: "Dean",
    bg: "oklch(0.96 0.06 285)",
    text: "oklch(0.42 0.14 280)",
  },
  system: {
    icon: <AlertCircle className="h-3 w-3" />,
    label: "System",
    bg: "oklch(0.96 0.012 255)",
    text: "oklch(0.40 0.08 258)",
  },
};

export function AuditTrail({ events }: { events: WorkflowEvent[] }) {
  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-3">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center"
          style={{ background: "var(--color-muted)" }}
        >
          <Clock className="h-5 w-5" style={{ color: "var(--color-muted-foreground)" }} />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium" style={{ color: "var(--color-foreground)" }}>
            No activity yet
          </p>
          <p className="text-xs mt-0.5" style={{ color: "var(--color-muted-foreground)" }}>
            Events will appear here as the application progresses
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Vertical line */}
      <div
        className="absolute left-4 top-4 bottom-4 w-px"
        style={{ background: "var(--color-border)" }}
      />

      <div className="space-y-2">
        {events.map((event) => {
          const cfg = ACTION_CONFIG[event.action] ?? DEFAULT_CONFIG;
          const actor = ACTOR_CONFIG[event.actorRole] ?? ACTOR_CONFIG.system;

          return (
            <div key={event.id} className="flex gap-3 relative">
              {/* Icon bubble */}
              <div
                className="relative z-10 w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border"
                style={{
                  background: cfg.bg,
                  color: cfg.text,
                  borderColor: cfg.border,
                }}
              >
                {cfg.icon}
              </div>

              {/* Content */}
              <div
                className="flex-1 rounded-xl border px-3 py-2.5 min-w-0"
                style={{
                  background: "var(--color-card)",
                  borderColor: "var(--color-border)",
                  boxShadow: "0 1px 3px oklch(0.15 0.04 265 / 4%)",
                }}
              >
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p
                        className="text-sm font-semibold leading-tight"
                        style={{ color: "var(--color-foreground)" }}
                      >
                        {event.action}
                      </p>
                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.65rem] font-semibold"
                        style={{ background: actor.bg, color: actor.text }}
                      >
                        {actor.icon}
                        {actor.label}
                      </span>
                    </div>
                    {event.note && (
                      <p
                        className="text-xs mt-1 leading-relaxed"
                        style={{ color: "var(--color-muted-foreground)" }}
                      >
                        {event.note}
                      </p>
                    )}
                  </div>
                  <p
                    className="text-[0.65rem] shrink-0 font-medium whitespace-nowrap"
                    style={{ color: "var(--color-muted-foreground)" }}
                  >
                    {new Date(event.createdAt).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
