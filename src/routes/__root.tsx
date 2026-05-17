import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { StgsProvider } from "@/lib/stgs-store";
import { AppShell } from "@/components/AppShell";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4" style={{ background: "var(--color-background)" }}>
      <div className="max-w-sm text-center space-y-4">
        <div
          className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto text-3xl font-black text-white"
          style={{
            background: "linear-gradient(135deg, oklch(0.48 0.20 264), oklch(0.52 0.20 275))",
            boxShadow: "0 8px 24px oklch(0.48 0.20 264 / 30%)",
          }}
        >
          404
        </div>
        <div>
          <h2 className="text-xl font-bold" style={{ color: "var(--color-foreground)" }}>
            Page not found
          </h2>
          <p className="mt-1 text-sm" style={{ color: "var(--color-muted-foreground)" }}>
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        <Link
          to="/"
          className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{
            background: "linear-gradient(135deg, oklch(0.48 0.20 264), oklch(0.52 0.20 275))",
            boxShadow: "0 2px 12px oklch(0.48 0.20 264 / 30%)",
          }}
        >
          Return home
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Scientific Travel Grant System — FINKI" },
      { name: "description", content: "STGS — Manage and track scientific travel grant applications through the HR and Dean approval workflow." },
      { property: "og:title", content: "Scientific Travel Grant System" },
      { property: "og:description", content: "STGS — FINKI travel grant management platform." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <StgsProvider>
        <AppShell>
          <Outlet />
        </AppShell>
      </StgsProvider>
    </QueryClientProvider>
  );
}
