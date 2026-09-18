import { Link, Outlet, createFileRoute } from "@tanstack/react-router";
import { GroupeShell } from "@/components/groupe-chrome";

export const Route = createFileRoute("/entreprise")({
  component: EntrepriseLayout,
});

function EntrepriseLayout() {
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
