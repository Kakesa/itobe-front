import { Outlet, createFileRoute } from "@tanstack/react-router";
import { PortalFooter } from "@/components/portal-footer";
import { PortalHeader, liensMedia } from "@/components/portal-header";

export const Route = createFileRoute("/media")({
  component: MediaLayout,
});

function MediaLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <PortalHeader portail="media" titre="Média" liens={liensMedia} />
      <main className="flex-1">
        <Outlet />
      </main>
      <PortalFooter portail="media" />
    </div>
  );
}
