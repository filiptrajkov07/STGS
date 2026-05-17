import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText, Download, X } from "lucide-react";

export function InvitationLetterViewer({
  fileName,
  isOpen,
  onClose,
}: {
  fileName: string;
  isOpen: boolean;
  onClose: () => void;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className="max-w-lg"
        style={{
          background: "var(--color-card)",
          border: "1px solid var(--color-border)",
          borderRadius: "1rem",
          boxShadow: "0 20px 60px oklch(0.15 0.04 265 / 18%), 0 4px 12px oklch(0.15 0.04 265 / 10%)",
        }}
      >
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">Invitation Letter</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div
            className="rounded-xl p-8 flex flex-col items-center gap-4 text-center border"
            style={{
              background: "linear-gradient(135deg, oklch(0.96 0.015 258), oklch(0.98 0.008 248))",
              borderColor: "var(--color-border)",
            }}
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm"
              style={{
                background: "linear-gradient(135deg, oklch(0.48 0.20 264 / 15%), oklch(0.52 0.20 275 / 10%))",
                border: "1px solid oklch(0.88 0.08 258)",
              }}
            >
              <FileText className="h-8 w-8" style={{ color: "oklch(0.48 0.20 264)" }} />
            </div>
            <div>
              <p className="font-semibold text-sm" style={{ color: "var(--color-foreground)" }}>
                {fileName}
              </p>
              <p className="text-xs mt-1" style={{ color: "var(--color-muted-foreground)" }}>
                PDF Document · Invitation Letter
              </p>
            </div>
            <div
              className="w-full rounded-lg px-4 py-3 text-xs text-left"
              style={{
                background: "var(--color-card)",
                border: "1px solid var(--color-border)",
                color: "var(--color-muted-foreground)",
              }}
            >
              <p className="font-medium mb-1" style={{ color: "var(--color-foreground)" }}>
                Document Preview
              </p>
              <p>This is a simulated file viewer. In a production environment, the PDF would be rendered here with full preview capabilities.</p>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="gap-2"
            >
              <X className="h-3.5 w-3.5" />
              Close
            </Button>
            <Button
              size="sm"
              className="gap-2"
              style={{
                background: "linear-gradient(135deg, oklch(0.48 0.20 264), oklch(0.52 0.20 275))",
                boxShadow: "0 2px 8px oklch(0.48 0.20 264 / 30%)",
              }}
            >
              <Download className="h-3.5 w-3.5" />
              Download
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
