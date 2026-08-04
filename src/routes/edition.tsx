import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/edition")({
  component: EditionLayout,
});

function EditionLayout() {
  return <Outlet />;
}
