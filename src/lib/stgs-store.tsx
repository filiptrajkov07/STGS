import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type {
  Application,
  GlobalRules,
  Receipt,
  Role,
  StgsState,
  WorkflowEvent,
} from "./stgs-types";
import {
  validateApplicationAgainstPolicy,
  generateAutoRejectReason,
} from "./policy-validator";

const KEY = "stgs-state-v2";

const defaultRules: GlobalRules = {
  maxHotelStars: 4,
  allowedFlightClass: "Economy",
  perDiemAmount: 40,
  breakfastDeduction: 20,
};

const initialState: StgsState = {
  currentRole: "academic",
  applications: [],
  receipts: [],
  events: [],
  rules: defaultRules,
};

function loadState(): StgsState {
  if (typeof window === "undefined") return initialState;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return initialState;
    const parsed = JSON.parse(raw) as Partial<StgsState>;
    return {
      ...initialState,
      ...parsed,
      rules: { ...defaultRules, ...(parsed.rules || {}) },
      applications: parsed.applications || [],
      receipts: parsed.receipts || [],
      events: parsed.events || [],
    };
  } catch {
    return initialState;
  }
}

const uid = () => Math.random().toString(36).slice(2, 10);
const now = () => new Date().toISOString();

function makeReference() {
  return `STGS-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
}

interface StgsContextValue extends StgsState {
  setRole: (r: Role) => void;
  createApplication: (
    data: Omit<
      Application,
      "id" | "reference" | "createdAt" | "status" | "overrides"
    >,
  ) => Application;
  hrApprove: (appId: string, overrides: Application["overrides"]) => void;
  hrReject: (appId: string, reason: string) => void;
  deanApprove: (appId: string) => void;
  deanReject: (appId: string, reason: string) => void;
  finalizeReceipts: (appId: string) => void;
  addReceipt: (
    data: Omit<Receipt, "id" | "createdAt">,
  ) => { ok: true; receipt: Receipt } | { ok: false; reason: "duplicate" };
  updateRules: (rules: GlobalRules) => void;
  updateOverrides: (appId: string, overrides: Application["overrides"]) => void;
  receiptsFor: (appId: string) => Receipt[];
  eventsFor: (appId: string) => WorkflowEvent[];
  resetAll: () => void;
}

const Ctx = createContext<StgsContextValue | null>(null);

export function StgsProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<StgsState>(initialState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(loadState());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(KEY, JSON.stringify(state));
  }, [state, hydrated]);

  const addEvent = useCallback(
    (
      s: StgsState,
      applicationId: string,
      actorRole: WorkflowEvent["actorRole"],
      action: string,
      note?: string,
    ): StgsState => ({
      ...s,
      events: [
        {
          id: uid(),
          applicationId,
          actorRole,
          action,
          note,
          createdAt: now(),
        },
        ...s.events,
      ],
    }),
    [],
  );

  const value = useMemo<StgsContextValue>(() => {
    return {
      ...state,
      setRole: (r) => setState((s) => ({ ...s, currentRole: r })),
      createApplication: (data) => {
        const app: Application = {
          ...data,
          id: uid(),
          reference: makeReference(),
          createdAt: now(),
          status: "pending_hr",
          overrides: {},
        };
        setState((s) => {
          const next = { ...s, applications: [app, ...s.applications] };
          return addEvent(
            next,
            app.id,
            "academic",
            "Application submitted",
            `Routed to HR for review.`,
          );
        });
        return app;
      },
      hrApprove: (appId, overrides) => {
        setState((s) => {
          // Find the application
          const app = s.applications.find((a) => a.id === appId);
          if (!app) return s;

          // Create a temporary updated app with the new overrides to validate
          const appWithOverrides = { ...app, overrides };

          // Validate against policy rules
          const validation = validateApplicationAgainstPolicy(
            appWithOverrides,
            s.rules,
          );

          // If validation fails, auto-reject the application
          if (!validation.valid) {
            const rejectionReason = generateAutoRejectReason(
              validation.violations,
            );
            const next = {
              ...s,
              applications: s.applications.map((a) =>
                a.id === appId
                  ? {
                      ...a,
                      overrides,
                      status: "rejected" as const,
                      rejectionReason,
                    }
                  : a,
              ),
            };
            return addEvent(
              next,
              appId,
              "system",
              "HR auto-rejected (policy violation)",
              rejectionReason,
            );
          }

          // Validation passed - approve and route to Dean
          const next = {
            ...s,
            applications: s.applications.map((a) =>
              a.id === appId
                ? { ...a, overrides, status: "pending_dean" as const }
                : a,
            ),
          };
          return addEvent(
            next,
            appId,
            "hr",
            "HR approved",
            "Policy validation passed; routed to Dean.",
          );
        });
      },
      hrReject: (appId, reason) => {
        setState((s) => {
          const next = {
            ...s,
            applications: s.applications.map((a) =>
              a.id === appId
                ? { ...a, status: "rejected" as const, rejectionReason: reason }
                : a,
            ),
          };
          return addEvent(next, appId, "hr", "HR rejected", reason);
        });
      },
      deanApprove: (appId) => {
        setState((s) => {
          const next = {
            ...s,
            applications: s.applications.map((a) =>
              a.id === appId ? { ...a, status: "approved" as const, deanApprovedAt: now() } : a,
            ),
          };
          return addEvent(next, appId, "dean", "Dean approved");
        });
      },
      deanReject: (appId, reason) => {
        setState((s) => {
          const next = {
            ...s,
            applications: s.applications.map((a) =>
              a.id === appId
                ? { ...a, status: "rejected" as const, rejectionReason: reason }
                : a,
            ),
          };
          return addEvent(next, appId, "dean", "Dean rejected", reason);
        });
      },
      finalizeReceipts: (appId) => {
        setState((s) => {
          const next = {
            ...s,
            applications: s.applications.map((a) =>
              a.id === appId ? { ...a, receiptsSubmittedAt: now() } : a,
            ),
          };
          return addEvent(
            next,
            appId,
            "academic",
            "Receipts finalized and submitted",
            "All receipts for this application have been submitted.",
          );
        });
      },
      addReceipt: (data) => {
        const dup = state.receipts.find(
          (r) =>
            r.applicationId === data.applicationId &&
            r.merchant.trim().toLowerCase() ===
              data.merchant.trim().toLowerCase() &&
            Number(r.amount) === Number(data.amount) &&
            r.date === data.date,
        );
        if (dup) {
          return { ok: false, reason: "duplicate" } as const;
        }
        const receipt: Receipt = { ...data, id: uid(), createdAt: now() };
        setState((s) => {
          const next = { ...s, receipts: [receipt, ...s.receipts] };
          return addEvent(
            next,
            data.applicationId,
            "academic",
            "Receipt uploaded",
            `${data.merchant} — ${data.currency} ${data.amount}`,
          );
        });
        return { ok: true, receipt } as const;
      },
      updateRules: (rules) => setState((s) => ({ ...s, rules })),
      updateOverrides: (appId, overrides) => {
        setState((s) => ({
          ...s,
          applications: s.applications.map((a) =>
            a.id === appId ? { ...a, overrides } : a,
          ),
        }));
      },
      receiptsFor: (appId) =>
        state.receipts.filter((r) => r.applicationId === appId),
      eventsFor: (appId) =>
        state.events.filter((e) => e.applicationId === appId),
      resetAll: () => setState(initialState),
    };
  }, [state, addEvent]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStgs() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useStgs must be used within StgsProvider");
  return v;
}
