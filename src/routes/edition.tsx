import { Outlet, createFileRoute } from "@tanstack/react-router";
import { PortalFooter } from "@/components/portal-footer";
import { PortalHeader, liensEdition } from "@/components/portal-header";

export const Route = createFileRoute("/edition")({
  component: EditionLayout,
});

function EditionLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <PortalHeader portail="edition" titre="Maison d'édition" liens={liensEdition} />
      <main className="flex-1">
        <Outlet />
      </main>
      <PortalFooter portail="edition" />
    </div>
  );
}
