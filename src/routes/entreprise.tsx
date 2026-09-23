import { Link, Outlet, createFileRoute, useRouterState } from "@tanstack/react-router";
import { GroupeNav, GroupeShell } from "@/components/groupe-chrome";

export const Route = createFileRoute("/entreprise")({
  component: EntrepriseLayout,
});

function EntrepriseLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isDarkPage =
    pathname === "/entreprise/about" || pathname === "/entreprise/contact";

  if (isDarkPage) {
    return (
      <div className="entreprise-dark-layout">
        <GroupeNav tone="onDark" />
        <Outlet />
      </div>
    );
  }

  return (
    <GroupeShell>
      <header className="mx-auto mb-12 flex max-w-3xl justify-center md:mb-16">
        <Link to="/" className="inline-block">
          <img
            src="/images/itobe-entreprises-logo.png"
            alt="ITOBE Entreprises"
            className="block h-14 w-auto object-contain md:h-16"
            width={263}
            height={144}
          />
        </Link>
      </header>
      <Outlet />
    </GroupeShell>
  );
}
