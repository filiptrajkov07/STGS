## Goal

Port the uploaded STGS demo into this TanStack Start project as React components, using **localStorage** for persistence (no backend, no auth). Apply all the restructuring from your spec.

## Persistence

- Single `localStorage` key `stgs-state-v2` holding: `applications[]`, `receipts[]`, `workflowEvents[]`, `globalRules`, `currentRole`.
- A `useStgsStore` hook (zustand-style or React context + reducer) reads/writes it.
- Role is switched via the existing top-of-app role pills (Academic / HR / Dean) — no login.

## Approval order (changed)

`draft → pending_hr → pending_dean → approved` (or `rejected`).

## Role-scoped tabs

**Academic**
- **Apply** (renamed from Application) — intake form. Removed: "Hotel provided" field, "Request satisfies active travel policies" panel.
- **My Applications** — list; clicking a row opens the **Application Modal** (workflow timeline + receipts upload live ONLY here).

**HR** (acts before Dean)
- **Applications** — list of submissions; click → HR review modal with full details + per-application rule overrides + Approve/Reject.
- **Settings** — global/base travel rules used as defaults for new applications.

**Dean** (final approval only)
- **Applications** (renamed from Application) — list of `pending_dean` items; click → read-only modal with only **Accept** and **Reject**. Reject requires a non-empty reason (textarea, min 5 chars).

## Application modal (academic)

- Header: reference, status, dates.
- Workflow timeline (read-only).
- Receipt upload form + receipt list.
- **Duplicate-receipt rule**: on submit, check existing receipts for the same application matching `merchant + amount + date`. If duplicate → block submit and render a large, highly visible red banner at top of modal: **"⚠ Duplicate receipt detected"**.

## Files

- `src/lib/stgs-store.ts` — state shape, localStorage persistence, actions (createApplication, submitForHr, hrApprove/Reject, deanApprove/Reject, addReceipt with duplicate guard, updateGlobalRules, updateAppOverrides).
- `src/lib/stgs-types.ts` — types + status enum + helpers (reference generator).
- `src/components/AppShell.tsx` — header, role switcher, role-aware tabs.
- `src/routes/__root.tsx` — wrap with AppShell.
- `src/routes/index.tsx` — role-aware redirect (academic → /apply, hr/dean → /applications).
- `src/routes/apply.tsx` (academic only; redirects others).
- `src/routes/my-applications.tsx` (academic).
- `src/routes/applications.tsx` (HR + Dean — picks correct modal based on role).
- `src/routes/settings.tsx` (HR only).
- `src/components/ApplicationModal.tsx` (academic).
- `src/components/HrReviewModal.tsx`.
- `src/components/DeanReviewModal.tsx`.

Built with shadcn `Dialog`, `Button`, `Input`, `Textarea`, `Select`, `Card`, `Badge`, `Alert`.

## Removed entirely

- "Hotel provided" everywhere.
- "Request satisfies active travel policies" panel.
- Top-level Workflow & Receipts tabs (academic) — moved into modal.
- Dashboard / Reports / guided demo / OCR scaffolding (out of scope).

## Out of scope

OCR sim, per-diem calculator UI, audit print, guided tour. Audit events still recorded internally; no dedicated screen.
