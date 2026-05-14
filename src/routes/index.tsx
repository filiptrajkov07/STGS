import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useStgs } from "@/lib/stgs-store";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { currentRole } = useStgs();
  if (currentRole === "academic") return <Navigate to="/apply" />;
  return <Navigate to="/applications" />;
}
