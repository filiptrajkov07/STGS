import { Badge } from "@/components/ui/badge";
import { STATUS_LABEL, type AppStatus } from "@/lib/stgs-types";

export function StatusBadge({ status }: { status: AppStatus }) {
  const variant: "default" | "secondary" | "destructive" | "outline" =
    status === "approved"
      ? "default"
      : status === "rejected"
        ? "destructive"
        : status === "draft"
          ? "outline"
          : "secondary";
  return <Badge variant={variant}>{STATUS_LABEL[status]}</Badge>;
}
