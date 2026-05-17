import { STAGES, STATUS_LABEL, type AppStatus } from "@/lib/stgs-types";
import { cn } from "@/lib/utils";
import { Check, X } from "lucide-react";

export function WorkflowTimeline({ status }: { status: AppStatus }) {
  const isRejected = status === "rejected";
  const currentIdx = STAGES.indexOf(isRejected ? "draft" : status);

  return (
    <div className="relative flex items-start gap-0 w-full">
      {STAGES.map((stage, i) => {
        const done = i < currentIdx || status === "submitted";
        const current = i === currentIdx && !isRejected && status !== "submitted";
        const isLast = i === STAGES.length - 1;

        return (
          <div key={stage} className="flex-1 flex flex-col items-center relative">
            {/* Connector line before */}
            {i > 0 && (
              <div
                className="absolute top-3.5 right-1/2 w-full h-0.5 -translate-y-1/2"
                style={{
                  background: done || current
                    ? "linear-gradient(90deg, oklch(0.48 0.20 264), oklch(0.48 0.20 264 / 40%))"
                    : "var(--color-border)",
                  left: 0,
                  right: "50%",
                }}
              />
            )}

            {/* Step circle */}
            <div
              className={cn(
                "relative z-10 w-7 h-7 rounded-full flex items-center justify-center text-[0.65rem] font-bold border-2 transition-all duration-300",
              )}
              style={
                done
                  ? {
                      background: "linear-gradient(135deg, oklch(0.48 0.20 264), oklch(0.52 0.20 275))",
                      borderColor: "oklch(0.48 0.20 264)",
                      color: "white",
                      boxShadow: "0 2px 8px oklch(0.48 0.20 264 / 35%)",
                    }
                  : current
                  ? {
                      background: "white",
                      borderColor: "oklch(0.48 0.20 264)",
                      color: "oklch(0.48 0.20 264)",
                      boxShadow: "0 0 0 3px oklch(0.48 0.20 264 / 15%)",
                    }
                  : {
                      background: "var(--color-muted)",
                      borderColor: "var(--color-border)",
                      color: "var(--color-muted-foreground)",
                    }
              }
            >
              {done ? <Check className="h-3.5 w-3.5" /> : <span>{i + 1}</span>}
            </div>

            {/* Label */}
            <span
              className="mt-1.5 text-center leading-tight"
              style={{
                fontSize: "0.6rem",
                fontWeight: current ? 700 : done ? 500 : 400,
                color: current
                  ? "oklch(0.48 0.20 264)"
                  : done
                  ? "oklch(0.35 0.10 265)"
                  : "var(--color-muted-foreground)",
                maxWidth: "4.5rem",
              }}
            >
              {STATUS_LABEL[stage]}
            </span>
          </div>
        );
      })}

      {/* Rejected indicator */}
      {isRejected && (
        <div className="flex flex-col items-center ml-2">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center border-2"
            style={{
              background: "oklch(0.97 0.06 25)",
              borderColor: "oklch(0.55 0.23 25)",
              color: "oklch(0.55 0.23 25)",
            }}
          >
            <X className="h-3.5 w-3.5" />
          </div>
          <span
            className="mt-1.5 text-center font-bold"
            style={{ fontSize: "0.6rem", color: "oklch(0.55 0.23 25)" }}
          >
            Rejected
          </span>
        </div>
      )}
    </div>
  );
}
