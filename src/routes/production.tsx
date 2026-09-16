import { Outlet, createFileRoute } from "@tanstack/react-router";
import { ProductionFooter } from "@/components/production/site-footer";
import { ProductionHeader } from "@/components/production/site-header";

export const Route = createFileRoute("/production")({
  component: ProductionLayout,
});

function ProductionLayout() {
  return (
    <div className="theme-production min-h-svh">
      <ProductionHeader />
      <main>
        <Outlet />
      </main>
      <ProductionFooter />
    </div>
  );
}
