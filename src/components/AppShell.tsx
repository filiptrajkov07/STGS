import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useStgs } from "@/lib/stgs-store";
import type { Role } from "@/lib/stgs-types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  GraduationCap,
  Users,
  Crown,
  RefreshCw,
  PlaneTakeoff,
  FileText,
  Settings,
  LayoutDashboard,
} from "lucide-react";

const TABS: Record<Role, { to: string; label: string; icon: React.ReactNode }[]> = {
  academic: [
    { to: "/apply", label: "Apply", icon: <PlaneTakeoff className="h-3.5 w-3.5" /> },
    { to: "/my-applications", label: "My Applications", icon: <FileText className="h-3.5 w-3.5" /> },
  ],
  hr: [
    { to: "/applications", label: "Applications", icon: <LayoutDashboard className="h-3.5 w-3.5" /> },
    { to: "/settings", label: "Settings", icon: <Settings className="h-3.5 w-3.5" /> },
  ],
  dean: [
    { to: "/applications", label: "Applications", icon: <LayoutDashboard className="h-3.5 w-3.5" /> },
  ],
};

const ROLE_LABEL: Record<Role, string> = {
  academic: "Academic",
  hr: "HR",
  dean: "Dean",
};

const ROLE_ICONS: Record<Role, React.ReactNode> = {
  academic: <GraduationCap className="h-3.5 w-3.5" />,
  hr: <Users className="h-3.5 w-3.5" />,
  dean: <Crown className="h-3.5 w-3.5" />,
};

const ROLE_DESCRIPTIONS: Record<Role, string> = {
  academic: "Staff Portal",
  hr: "HR Dashboard",
  dean: "Dean's Office",
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
    <div className="min-h-screen" style={{ background: "var(--color-background)" }}>
      {/* Header */}
      <header
        className="sticky top-0 z-50 border-b"
        style={{
          background: "oklch(1 0 0 / 85%)",
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          borderColor: "var(--color-border)",
          boxShadow: "0 1px 0 0 oklch(0.91 0.018 258), 0 4px 16px oklch(0.15 0.04 265 / 4%)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Top bar */}
          <div className="flex items-center justify-between py-3 gap-4">
            {/* Brand */}
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl grid place-items-center shrink-0 shadow-md"
                style={{
                  background: "linear-gradient(135deg, oklch(0.48 0.20 264), oklch(0.55 0.22 285))",
                  boxShadow: "0 2px 8px oklch(0.48 0.20 264 / 35%)",
                }}
              >
                <PlaneTakeoff className="h-4.5 w-4.5 text-white" style={{ width: "1.1rem", height: "1.1rem" }} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-[0.9rem] font-700 tracking-tight leading-none" style={{ fontWeight: 700 }}>
                    Travel Grant System
                  </h1>
                  <span
                    className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded-md text-[0.6rem] font-semibold uppercase tracking-wider"
                    style={{ background: "oklch(0.94 0.04 265)", color: "oklch(0.4 0.15 265)" }}
                  >
                    FINKI
                  </span>
                </div>
                <p className="text-[0.68rem] mt-0.5 font-medium" style={{ color: "var(--color-muted-foreground)" }}>
                  {ROLE_DESCRIPTIONS[currentRole]}
                </p>
              </div>
            </div>

            {/* Right controls */}
            <div className="flex items-center gap-2">
              {/* Role switcher */}
              <div
                className="inline-flex rounded-xl p-1 gap-0.5"
                style={{
                  background: "var(--color-muted)",
                  border: "1px solid var(--color-border)",
                }}
              >
                {(Object.keys(ROLE_LABEL) as Role[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => handleRoleChange(r)}
                    className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200",
                      currentRole === r
                        ? "text-white shadow-sm"
                        : "text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-white/60",
                    )}
                    style={
                      currentRole === r
                        ? {
                            background: "linear-gradient(135deg, oklch(0.48 0.20 264), oklch(0.52 0.20 275))",
                            boxShadow: "0 2px 8px oklch(0.48 0.20 264 / 30%)",
                          }
                        : {}
                    }
                  >
                    {ROLE_ICONS[r]}
                    <span className="hidden sm:inline">{ROLE_LABEL[r]}</span>
                  </button>
                ))}
              </div>

              {/* Reset button */}
              <button
                onClick={resetAll}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 hover:scale-105"
                style={{
                  background: "var(--color-card)",
                  border: "1px solid var(--color-border)",
                  color: "var(--color-muted-foreground)",
                  boxShadow: "0 1px 3px oklch(0.15 0.04 265 / 6%)",
                }}
                title="Reset all data"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            </div>
          </div>

          {/* Navigation tabs */}
          <nav className="flex gap-0.5 -mb-px">
            {tabs.map((t) => {
              const active = location.pathname.startsWith(t.to);
              return (
                <Link
                  key={t.to}
                  to={t.to}
                  className={cn(
                    "inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all duration-200 rounded-t-lg -mb-px",
                    active
                      ? "border-b-[oklch(0.48_0.20_264)] text-[oklch(0.48_0.20_264)]"
                      : "border-transparent text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-muted)]/60",
                  )}
                  style={active ? { borderBottomColor: "oklch(0.48 0.20 264)", color: "oklch(0.48 0.20 264)" } : {}}
                >
                  <span style={{ opacity: active ? 1 : 0.7 }}>{t.icon}</span>
                  {t.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
        {children}
      </main>
    </div>
  );
}
