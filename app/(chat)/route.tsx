import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/(chat)")({
  component: Layout,
});

function Layout() {
  return (
    <div className="min-h-dvh">
      <Outlet />
    </div>
  );
}
