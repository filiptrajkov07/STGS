import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useStgs } from "@/lib/stgs-store";
import type { Role } from "@/lib/stgs-types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const TABS: Record<Role, { to: string; label: string }[]> = {
  academic: [
    { to: "/apply", label: "Apply" },
    { to: "/my-applications", label: "My Applications" },
  ],
  hr: [
    { to: "/applications", label: "Applications" },
    { to: "/settings", label: "Settings" },
  ],
  dean: [{ to: "/applications", label: "Applications" }],
};

const ROLE_LABEL: Record<Role, string> = {
  academic: "Academic",
  hr: "HR",
  dean: "Dean",
};

export function AppShell({ children }: { children: React.ReactNode }) {
  const { currentRole, setRole, resetAll } = useStgs();
  const location = useLocation();
  const navigate = useNavigate();
  const tabs = TABS[currentRole];

  const handleRoleChange = (r: Role) => {
    setRole(r);
    const first = TABS[r][0]?.to;
    if (first) navigate({ to: first });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b sticky top-0 z-10 bg-background/90 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-primary text-primary-foreground grid place-items-center font-bold">
              ST
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                FINKI
              </p>
              <h1 className="text-base sm:text-lg font-semibold">
                Scientific Travel Grant System
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-md border p-1 bg-muted">
              {(Object.keys(ROLE_LABEL) as Role[]).map((r) => (
                <button
                  key={r}
                  onClick={() => handleRoleChange(r)}
                  className={cn(
                    "px-3 py-1.5 text-sm rounded-sm transition-colors",
                    currentRole === r
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {ROLE_LABEL[r]}
                </button>
              ))}
            </div>
            <Button variant="outline" size="sm" onClick={resetAll}>
              Reset
            </Button>
          </div>
        </div>
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 flex gap-1 border-t">
          {tabs.map((t) => {
            const active = location.pathname.startsWith(t.to);
            return (
              <Link
                key={t.to}
                to={t.to}
                className={cn(
                  "px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors",
                  active
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                )}
              >
                {t.label}
              </Link>
            );
          })}
        </nav>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">{children}</main>
    </div>
  );
}
