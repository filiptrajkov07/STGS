import { STAGES, STATUS_LABEL, type AppStatus } from "@/lib/stgs-types";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export function WorkflowTimeline({ status }: { status: AppStatus }) {
  const currentIdx = STAGES.indexOf(status === "rejected" ? "draft" : status);
  return (
    <ol className="flex items-center gap-2 flex-wrap">
      {STAGES.map((stage, i) => {
        const done = i < currentIdx || status === "approved";
        const current = i === currentIdx && status !== "approved";
        return (
          <li key={stage} className="flex items-center gap-2">
            <div
              className={cn(
                "h-7 w-7 rounded-full grid place-items-center text-xs font-semibold border",
                done
                  ? "bg-primary text-primary-foreground border-primary"
                  : current
                    ? "border-primary text-primary"
                    : "border-muted text-muted-foreground",
              )}
            >
              {done ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            <span
              className={cn(
                "text-xs",
                current ? "font-semibold" : "text-muted-foreground",
              )}
            >
              {STATUS_LABEL[stage]}
            </span>
            {i < STAGES.length - 1 && (
              <div className="w-6 h-px bg-border mx-1" />
            )}
          </li>
        );
      })}
      {status === "rejected" && (
        <li className="ml-2 text-xs font-semibold text-destructive">
          Rejected
        </li>
      )}
    </ol>
  );
}
